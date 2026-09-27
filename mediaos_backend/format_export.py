import os
import re
import json
import urllib.parse
import subprocess
from typing import Tuple, Dict, Any, Optional

from db import get_connection

EXPORTS_DIR = os.path.join(os.path.dirname(__file__), "downloads", "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)


def sanitize_title(title: str) -> str:
    """
    Cleans title for safe cross-platform filesystem and HTTP header usage.
    Removes forbidden characters: / \\ : * ? " < > |
    """
    if not title:
        return "media"
    # Remove Windows/Unix reserved chars
    clean = re.sub(r'[\x00-\x1f\x7f\\/*?:"<>|]', " ", title)
    # Collapse whitespace
    clean = re.sub(r'\s+', " ", clean).strip()
    return clean[:100].strip() or "media"


def build_content_disposition(title: str, ext: str, disposition: str = "attachment") -> Dict[str, str]:
    """
    Constructs robust RFC 6266 / RFC 5987 Content-Disposition headers.
    - filename="..." provides an ASCII fallback for older clients
    - filename*=UTF-8''... provides the full Unicode/UTF-8 filename for all modern browsers
    """
    clean = sanitize_title(title)
    
    # Strip existing extension if title ended with it
    if clean.lower().endswith(f".{ext.lower()}"):
        clean = clean[:-len(ext)-1].strip()
        
    full_name = f"{clean}.{ext}"
    
    # ASCII-only fallback (replace non-ASCII with underscore or dash)
    ascii_name = re.sub(r'[^\w\s\-\.\(\)]', '_', clean).strip()
    if not ascii_name:
        ascii_name = "media"
    ascii_name = f"{ascii_name[:80]}.{ext}".replace('"', '\\"')
    
    # RFC 5987 UTF-8 encoded
    rfc5987 = urllib.parse.quote(full_name, safe=".-_~")
    
    header_val = f'{disposition}; filename="{ascii_name}"; filename*=UTF-8\'\'{rfc5987}'
    return {
        "Content-Disposition": header_val,
        "X-Original-Filename": full_name
    }


def format_seconds_srt(seconds: float) -> str:
    """Format seconds into HH:MM:SS,mmm for SRT."""
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    msecs = int(round((seconds - int(seconds)) * 1000))
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{msecs:03d}"


def format_seconds_vtt(seconds: float) -> str:
    """Format seconds into HH:MM:SS.mmm for WebVTT."""
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    msecs = int(round((seconds - int(seconds)) * 1000))
    return f"{hrs:02d}:{mins:02d}:{secs:02d}.{msecs:03d}"


def generate_srt_content(transcript_list: list) -> str:
    lines = []
    for idx, item in enumerate(transcript_list, start=1):
        start = float(item.get("start", 0))
        end = float(item.get("end", start + 3.0))
        text = item.get("text", "").strip()
        lines.append(f"{idx}")
        lines.append(f"{format_seconds_srt(start)} --> {format_seconds_srt(end)}")
        lines.append(text)
        lines.append("")
    return "\n".join(lines)


def generate_vtt_content(transcript_list: list) -> str:
    lines = ["WEBVTT", ""]
    for idx, item in enumerate(transcript_list, start=1):
        start = float(item.get("start", 0))
        end = float(item.get("end", start + 3.0))
        text = item.get("text", "").strip()
        lines.append(f"{idx}")
        lines.append(f"{format_seconds_vtt(start)} --> {format_seconds_vtt(end)}")
        lines.append(text)
        lines.append("")
    return "\n".join(lines)


def generate_txt_content(title: str, transcript_list: list) -> str:
    lines = [f"MEDIAOS TRANSCRIPT EXPORT", f"Title: {title}", "=" * 50, ""]
    for item in transcript_list:
        ts = item.get("timestamp", "00:00")
        text = item.get("text", "").strip()
        lines.append(f"[{ts}] {text}")
    return "\n".join(lines)


def resolve_media_export(media_id: str, fmt: str) -> Tuple[str, str, str, Dict[str, str]]:
    """
    Resolves or converts media asset to requested format via FFmpeg.
    Returns: (physical_file_path, mime_type, filename, headers_dict)
    Supported fmt: 'mp4', 'mp3', 'm4a', 'webm', 'jpg', 'png', 'srt', 'vtt', 'txt'
    """
    fmt = fmt.lower().strip()
    if fmt == "jpeg": fmt = "jpg"
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM media WHERE id = ?", (media_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise ValueError(f"Media '{media_id}' not found in database.")
        
    title = row["title"] or "media"
    src_file = row["file_path"]
    if src_file and not os.path.isabs(src_file):
        src_file = os.path.join(os.path.dirname(__file__), src_file)
        
    transcript_raw = row["transcript"]
    try:
        transcript_data = json.loads(transcript_raw) if transcript_raw else []
    except Exception:
        transcript_data = []

    clean_name = sanitize_title(title)
    headers = build_content_disposition(title, fmt, disposition="attachment")

    # 1. MP4 (Native or verified)
    if fmt == "mp4":
        if not src_file or not os.path.exists(src_file):
            raise FileNotFoundError(f"Source video file not found on disk: {src_file}")
        return src_file, "video/mp4", f"{clean_name}.mp4", headers

    # 2. MP3 (Audio Extraction via FFmpeg)
    if fmt == "mp3":
        if not src_file or not os.path.exists(src_file):
            raise FileNotFoundError(f"Source video file not found: {src_file}")
        target_file = os.path.join(EXPORTS_DIR, f"{media_id}.mp3")
        if not os.path.exists(target_file):
            cmd = [
                "ffmpeg", "-y", "-i", src_file,
                "-vn", "-c:a", "libmp3lame", "-b:a", "320k",
                target_file
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return target_file, "audio/mpeg", f"{clean_name}.mp3", headers

    # 3. M4A (Audio Extraction via AAC copy/transcode)
    if fmt == "m4a":
        if not src_file or not os.path.exists(src_file):
            raise FileNotFoundError(f"Source video file not found: {src_file}")
        target_file = os.path.join(EXPORTS_DIR, f"{media_id}.m4a")
        if not os.path.exists(target_file):
            # Try stream copy first for instant export
            cmd_copy = ["ffmpeg", "-y", "-i", src_file, "-vn", "-c:a", "copy", target_file]
            res = subprocess.run(cmd_copy, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if res.returncode != 0 or not os.path.exists(target_file):
                cmd_trans = ["ffmpeg", "-y", "-i", src_file, "-vn", "-c:a", "aac", "-b:a", "256k", target_file]
                subprocess.run(cmd_trans, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return target_file, "audio/mp4", f"{clean_name}.m4a", headers

    # 4. WEBM (WebM Container via FFmpeg)
    if fmt == "webm":
        if not src_file or not os.path.exists(src_file):
            raise FileNotFoundError(f"Source video file not found: {src_file}")
        target_file = os.path.join(EXPORTS_DIR, f"{media_id}.webm")
        if not os.path.exists(target_file):
            # Fast VP9 encoding with realtime deadline
            cmd = [
                "ffmpeg", "-y", "-i", src_file,
                "-c:v", "libvpx-vp9", "-deadline", "realtime", "-cpu-used", "4",
                "-c:a", "libopus", target_file
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return target_file, "video/webm", f"{clean_name}.webm", headers

    # 5. JPG / PNG (High-Res Video Poster / Thumbnail)
    if fmt in ("jpg", "png"):
        target_file = os.path.join(EXPORTS_DIR, f"{media_id}.{fmt}")
        if not os.path.exists(target_file):
            if src_file and os.path.exists(src_file):
                cmd = [
                    "ffmpeg", "-y", "-ss", "00:00:03", "-i", src_file,
                    "-vframes", "1", "-update", "1",
                    target_file
                ]
                subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                raise FileNotFoundError(f"Source file not available to generate frame: {src_file}")
        mime = "image/jpeg" if fmt == "jpg" else "image/png"
        return target_file, mime, f"{clean_name}.{fmt}", headers

    # 6. SRT Subtitles
    if fmt == "srt":
        target_file = os.path.join(EXPORTS_DIR, f"{media_id}.srt")
        content = generate_srt_content(transcript_data)
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(content)
        return target_file, "application/x-subrip", f"{clean_name}.srt", headers

    # 7. VTT Subtitles
    if fmt == "vtt":
        target_file = os.path.join(EXPORTS_DIR, f"{media_id}.vtt")
        content = generate_vtt_content(transcript_data)
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(content)
        return target_file, "text/vtt", f"{clean_name}.vtt", headers

    # 8. TXT Transcript
    if fmt == "txt":
        target_file = os.path.join(EXPORTS_DIR, f"{media_id}.txt")
        content = generate_txt_content(title, transcript_data)
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(content)
        return target_file, "text/plain; charset=utf-8", f"{clean_name}.txt", headers

    raise ValueError(f"Unsupported export format '{fmt}'. Supported: mp4, mp3, m4a, webm, jpg, png, srt, vtt, txt")
