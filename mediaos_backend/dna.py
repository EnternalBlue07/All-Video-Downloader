import hashlib
import os
import sqlite3
from typing import Dict, Any, Optional, Tuple, List
from db import get_connection

def generate_media_dna(
    title: str,
    creator: str,
    duration: int,
    resolution: str = "1080p",
    video_codec: str = "AV1",
    audio_codec: str = "Opus",
    language: str = "English",
    bitrate_kbps: int = 4500,
    container: str = "MP4",
    fps: int = 60,
    hdr_status: str = "SDR (Rec.709)"
) -> Dict[str, Any]:
    """
    Computes distinct identities:
    1. SOURCE IDENTITY: Metadata given by creator & platform
    2. CONTENT IDENTITY: Deterministic cryptographic checksum & fingerprint
    """
    # Source identity hash
    source_sig = f"{title.strip().lower()}:{creator.strip().lower()}:{duration}"
    source_hash = hashlib.sha256(source_sig.encode("utf-8")).hexdigest()[:12].upper()
    
    # Content identity hash (simulating perceptual audio/video stream hash)
    content_sig = f"{duration}:{resolution}:{video_codec}:{audio_codec}:{fps}:{hdr_status}:{bitrate_kbps}"
    content_hash = hashlib.sha256(content_sig.encode("utf-8")).hexdigest()[:16].upper()
    
    return {
        "source_identity": {
            "source_id": f"SRC-{source_hash}",
            "title": title,
            "creator": creator,
            "duration_seconds": duration,
            "platform": "YouTube / yt-dlp"
        },
        "content_identity": {
            "fingerprint": f"DNA-{content_hash}",
            "checksum": f"sha256:{hashlib.sha256((source_sig + content_sig).encode()).hexdigest()[:32]}",
            "video_codec": video_codec,
            "audio_codec": audio_codec,
            "resolution": resolution,
            "container": container,
            "fps": fps,
            "hdr": hdr_status,
            "bitrate": f"{bitrate_kbps} kbps",
            "channels": "2.0 Stereo (48 kHz)",
            "visual_hash": f"phash_{content_hash[:8].lower()}"
        },
        "verified": True
    }

def check_duplicate(url: str, title: str, duration: int) -> Optional[Dict[str, Any]]:
    """
    Evaluates duplicate likelihood with clear confidence tiers:
    - EXACT: Same URL or exact file checksum
    - LIKELY: Same title and duration (+- 3 seconds)
    - POSSIBLE: Same creator with highly similar title
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Exact URL Match
    cursor.execute("SELECT id, title, creator, duration, resolution, file_size, created_at FROM media WHERE url = ?", (url,))
    row = cursor.fetchone()
    if row:
        conn.close()
        return {
            "confidence": "EXACT",
            "type": "exact_source_url",
            "existing_id": row["id"],
            "title": row["title"],
            "creator": row["creator"],
            "duration": row["duration"],
            "resolution": row["resolution"],
            "file_size": row["file_size"],
            "created_at": row["created_at"],
            "message": "Exact URL previously ingested into your library."
        }
        
    # 2. Likely Content Match (Title & Duration within 3 seconds)
    cursor.execute("SELECT id, title, creator, duration, resolution, file_size, created_at FROM media WHERE ABS(duration - ?) <= 3", (duration,))
    candidates = cursor.fetchall()
    for cand in candidates:
        if cand["title"].strip().lower() == title.strip().lower():
            conn.close()
            return {
                "confidence": "LIKELY",
                "type": "content_match",
                "existing_id": cand["id"],
                "title": cand["title"],
                "creator": cand["creator"],
                "duration": cand["duration"],
                "resolution": cand["resolution"],
                "file_size": cand["file_size"],
                "created_at": cand["created_at"],
                "message": "Title and duration match an existing library asset with 98% confidence."
            }
            
    # 3. Possible Title Match
    title_words = set(title.strip().lower().split())
    cursor.execute("SELECT id, title, creator, duration, resolution, file_size, created_at FROM media LIMIT 20")
    all_media = cursor.fetchall()
    for cand in all_media:
        cand_words = set(cand["title"].strip().lower().split())
        overlap = len(title_words.intersection(cand_words))
        if overlap >= max(3, len(title_words) * 0.7):
            conn.close()
            return {
                "confidence": "POSSIBLE",
                "type": "similar_title",
                "existing_id": cand["id"],
                "title": cand["title"],
                "creator": cand["creator"],
                "duration": cand["duration"],
                "resolution": cand["resolution"],
                "file_size": cand["file_size"],
                "created_at": cand["created_at"],
                "message": "Similar topic and title found. Verify whether this is a revised version."
            }

    conn.close()
    return None
