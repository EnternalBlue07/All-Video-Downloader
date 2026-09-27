import math
import os
import subprocess
import sys
import shutil
from PIL import Image, ImageDraw, ImageFont

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def main():
    width = 1080
    height = 620
    fps = 25
    total_frames = 250  # 10 seconds total (50 frames = 2s per chapter)
    
    frames_dir = "scratch_frames"
    if os.path.exists(frames_dir):
        shutil.rmtree(frames_dir)
    os.makedirs(frames_dir, exist_ok=True)
    
    font_title = get_font("C:/Windows/Fonts/segoeuib.ttf", 20)
    font_sub = get_font("C:/Windows/Fonts/segoeui.ttf", 13)
    font_bold = get_font("C:/Windows/Fonts/segoeuib.ttf", 15)
    font_mono = get_font("C:/Windows/Fonts/consola.ttf", 13)
    font_mono_bold = get_font("C:/Windows/Fonts/consolab.ttf", 14)
    font_small = get_font("C:/Windows/Fonts/segoeui.ttf", 12)
    font_badge = get_font("C:/Windows/Fonts/segoeuib.ttf", 11)
    font_large_badge = get_font("C:/Windows/Fonts/segoeuib.ttf", 22)
    
    chapters = [
        {"id": "01", "name": "AUTONOMOUS INGESTION", "color": (16, 185, 129), "badge": "yt-dlp Core + FFmpeg 8.1"},
        {"id": "02", "name": "MEDIA DNA & PROVENANCE", "color": (56, 189, 248), "badge": "Anti-Hallucination Grounding"},
        {"id": "03", "name": "NEURAL FTS5 SEARCH", "color": (168, 85, 247), "badge": "SQLite FTS5 + BM25 Radar"},
        {"id": "04", "name": "SMART CLIP STUDIO (9:16)", "color": (245, 158, 11), "badge": "Face Tracking & Viral Crops"},
        {"id": "05", "name": "UNIVERSAL EXPORTER", "color": (236, 72, 153), "badge": "RFC 6266 Transmux Matrix"}
    ]
    
    print(f"Rendering {total_frames} frames ({width}x{height} @ {fps}fps)...")
    
    for frame_idx in range(total_frames):
        ch_idx = min(4, frame_idx // 50)
        ch_frame = frame_idx % 50
        ch_progress = ch_frame / 50.0  # 0.0 to 1.0
        current_ch = chapters[ch_idx]
        ch_color = current_ch["color"]
        
        # Base canvas
        img = Image.new("RGBA", (width, height), (8, 9, 11, 255))
        draw = ImageDraw.Draw(img)
        
        # Background subtle grid
        for x in range(0, width, 40):
            draw.line([(x, 0), (x, height)], fill=(18, 22, 28, 255), width=1)
        for y in range(0, height, 40):
            draw.line([(0, y), (width, y)], fill=(18, 22, 28, 255), width=1)
            
        # Top glowing radial light around active color
        # Outer window container
        draw.rounded_rectangle([15, 15, width - 15, height - 15], radius=16, fill=(14, 17, 23, 240), outline=(*ch_color, 120), width=2)
        
        # Top Header Bar
        draw.rectangle([17, 17, width - 17, 65], fill=(20, 24, 33, 255))
        draw.line([(17, 65), (width - 17, 65)], fill=(36, 42, 53, 255), width=1)
        
        # Window controls (macOS / Linux style dots)
        draw.ellipse([32, 35, 44, 47], fill=(239, 68, 68, 255))
        draw.ellipse([52, 35, 64, 47], fill=(245, 158, 11, 255))
        draw.ellipse([72, 35, 84, 47], fill=(16, 185, 129, 255))
        
        # Header title & founder
        draw.text((105, 27), "MEDIAOS", fill=(248, 250, 252), font=font_title)
        draw.text((205, 32), "— Local-First Media Intelligence & Editing Engine", fill=(148, 163, 184), font=font_sub)
        draw.text((640, 32), "Architected & Engineered by Mohammad Zumaan Sayyed", fill=(*ch_color, 255), font=font_sub)
        
        # Right badge: REC 60FPS
        draw.rounded_rectangle([width - 155, 28, width - 35, 52], radius=6, fill=(26, 32, 44, 255), outline=(*ch_color, 200), width=1)
        # pulsating red dot
        dot_alpha = int(180 + 75 * math.sin(frame_idx * 0.3))
        draw.ellipse([width - 145, 36, width - 137, 44], fill=(239, 68, 68, dot_alpha))
        draw.text((width - 130, 33), "60FPS DEMO", fill=(226, 232, 240), font=font_badge)
        
        # Navigation / Chapters Bar
        draw.rectangle([17, 66, width - 17, 105], fill=(12, 15, 21, 255))
        draw.line([(17, 105), (width - 17, 105)], fill=(36, 42, 53, 255), width=1)
        
        tab_width = (width - 34) // 5
        for i, ch in enumerate(chapters):
            tx1 = 17 + i * tab_width
            tx2 = tx1 + tab_width
            is_active = (i == ch_idx)
            
            if is_active:
                draw.rectangle([tx1, 66, tx2, 104], fill=(22, 28, 38, 255))
                draw.rectangle([tx1, 102, tx2, 105], fill=ch["color"])
                draw.text((tx1 + 16, 73), f"MODULE {ch['id']}", fill=ch["color"], font=font_badge)
                draw.text((tx1 + 16, 86), ch["name"][:18], fill=(248, 250, 252), font=font_bold)
            else:
                draw.text((tx1 + 16, 73), f"MODULE {ch['id']}", fill=(100, 116, 139), font=font_badge)
                draw.text((tx1 + 16, 86), ch["name"][:18], fill=(148, 163, 184), font=font_small)
            if i < 4:
                draw.line([(tx2, 68), (tx2, 103)], fill=(28, 34, 44, 255), width=1)
                
        # =========================================================
        # MAIN STAGE AREA (Y: 115 to 495)
        # =========================================================
        stage_box = [30, 115, width - 30, 495]
        draw.rounded_rectangle(stage_box, radius=12, fill=(10, 13, 18, 255), outline=(28, 34, 46, 255), width=1)
        
        # Chapter 1: Ingestion
        if ch_idx == 0:
            draw.text((50, 135), "AUTONOMOUS INGESTION PIPELINE (yt-dlp core + FFmpeg 8.1)", fill=(16, 185, 129), font=font_bold)
            
            # URL Input Box
            draw.rounded_rectangle([50, 165, width - 50, 210], radius=8, fill=(18, 22, 30, 255), outline=(16, 185, 129), width=1)
            draw.ellipse([65, 182, 75, 192], fill=(16, 185, 129))
            
            url_text = "https://www.youtube.com/watch?v=distributed-media-systems-architecture"
            chars_to_show = int(len(url_text) * min(1.0, ch_progress * 1.8))
            draw.text((85, 178), url_text[:chars_to_show], fill=(241, 245, 249), font=font_mono)
            
            # 4 Pipeline Cards
            steps = [
                ("1. Stream Probe", "4K 2160p AV01 (Zero Re-encode)", ch_progress > 0.15),
                ("2. Audio Demux", "Opus 160kbps VBR Lossless", ch_progress > 0.40),
                ("3. SponsorBlock", "3 sponsor segments stripped", ch_progress > 0.65),
                ("4. Output Verify", "ffprobe container integrity check ✓", ch_progress > 0.85)
            ]
            
            card_w = (width - 100 - 45) // 4
            for s_idx, (st_title, st_desc, st_done) in enumerate(steps):
                cx1 = 50 + s_idx * (card_w + 15)
                cx2 = cx1 + card_w
                c_bg = (16, 185, 129, 35) if st_done else (18, 22, 30, 255)
                c_border = (16, 185, 129) if st_done else (40, 48, 62)
                draw.rounded_rectangle([cx1, 230, cx2, 340], radius=8, fill=c_bg, outline=c_border, width=1)
                draw.text((cx1 + 14, 245), f"STEP 0{s_idx + 1}", fill=(16, 185, 129) if st_done else (100, 116, 139), font=font_badge)
                draw.text((cx1 + 14, 265), st_title, fill=(248, 250, 252), font=font_bold)
                draw.text((cx1 + 14, 290), st_desc, fill=(148, 163, 184), font=font_small)
                
            # Download speed & progress bar
            dl_pct = min(100, int(ch_progress * 100))
            draw.text((50, 365), f"Ingestion Rate: 48.7 MB/s — Buffer Status: {dl_pct}% Completed", fill=(203, 213, 225), font=font_mono)
            draw.rounded_rectangle([50, 395, width - 50, 415], radius=6, fill=(20, 26, 36, 255))
            draw.rounded_rectangle([50, 395, 50 + int((width - 100) * (dl_pct / 100.0)), 415], radius=6, fill=(16, 185, 129))
            
            draw.text((50, 435), "Crash-Safe Engine: Interrupted downloads resume from exact byte boundary without corruption", fill=(100, 116, 139), font=font_sub)

        # Chapter 2: Media DNA & Provenance
        elif ch_idx == 1:
            draw.text((50, 135), "CRYPTOGRAPHIC MEDIA DNA & ZERO-HALLUCINATION PROVENANCE", fill=(56, 189, 248), font=font_bold)
            
            # Left box: Dual Vector DNA
            draw.rounded_rectangle([50, 170, 520, 430], radius=10, fill=(16, 22, 32, 255), outline=(56, 189, 248), width=1)
            draw.text((70, 190), "DUAL-VECTOR CRYPTOGRAPHIC FINGERPRINT", fill=(56, 189, 248), font=font_bold)
            
            dna_items = [
                ("SOURCE MEDIA ID", "SRC-9F4B2E81A03C"),
                ("CONTENT SHA-256", "7c018a2df983ee52b14e9f7a"),
                ("PERCEPTUAL HASH", "phash_e8a201bf99a0c41d"),
                ("CANONICAL TIMEBASE", "30.000 FPS (Millisecond Accurate)")
            ]
            for d_i, (k, v) in enumerate(dna_items):
                dy = 230 + d_i * 45
                draw.rectangle([70, dy, 500, dy + 35], fill=(22, 28, 40, 255))
                draw.text((80, dy + 8), f"{k}:", fill=(148, 163, 184), font=font_mono)
                draw.text((230, dy + 8), v, fill=(56, 189, 248), font=font_mono_bold)
                
            # Right box: Grounding Evidence Radar
            draw.rounded_rectangle([545, 170, width - 50, 430], radius=10, fill=(16, 24, 28, 255), outline=(16, 185, 129), width=1)
            draw.rounded_rectangle([565, 190, 710, 215], radius=4, fill=(16, 185, 129))
            draw.text((575, 194), "SOURCE_VERIFIED", fill=(0, 0, 0), font=font_badge)
            draw.text((725, 194), "96.8% Grounding Confidence", fill=(16, 185, 129), font=font_bold)
            
            quote_text = (
                '"JWT token rotation is strictly mandatory to prevent replay attacks during '
                'distributed microservice handshakes in high-throughput architectures..."'
            )
            draw.text((565, 240), quote_text, fill=(248, 250, 252), font=font_sub)
            
            draw.rectangle([565, 305, width - 70, 355], fill=(22, 32, 38, 255))
            draw.text((580, 315), "CANONICAL TIMELINE SPAN:", fill=(148, 163, 184), font=font_badge)
            draw.text((580, 330), "00:14:22.500 → 00:15:01.200 (Exact Seek Target)", fill=(56, 189, 248), font=font_mono_bold)
            
            # Interactive verify checkmark
            draw.text((565, 380), "Anti-Hallucination Guard: Returns INSUFFICIENT_EVIDENCE if transcript confidence < 0.60", fill=(100, 116, 139), font=font_small)

        # Chapter 3: Semantic Search (FTS5)
        elif ch_idx == 2:
            draw.text((50, 135), "NEURAL TRANSCRIPT INDEX & SQLITE FTS5 BM25 SEARCH", fill=(168, 85, 247), font=font_bold)
            
            # Search Input Bar
            draw.rounded_rectangle([50, 165, width - 50, 210], radius=8, fill=(18, 20, 30, 255), outline=(168, 85, 247), width=1)
            search_query = "What did the speaker explain about PostgreSQL B-tree index logarithmic scans?"
            chars_show = int(len(search_query) * min(1.0, ch_progress * 1.5))
            draw.text((70, 178), f"🔍  {search_query[:chars_show]}", fill=(241, 245, 249), font=font_bold)
            draw.text((width - 180, 178), "FTS5 BM25 RADAR", fill=(168, 85, 247), font=font_badge)
            
            # Waveform frequency equalizer visualizer
            draw.text((50, 225), "AUDIO SPECTRUM & HIT DISTRIBUTION ACROSS CANONICAL TIMELINE", fill=(148, 163, 184), font=font_badge)
            for bar_i in range(80):
                bx = 50 + bar_i * 12
                # animated bounce
                bar_h = int(12 + 28 * math.sin(bar_i * 0.4 + frame_idx * 0.4) * math.cos(bar_i * 0.2))
                bar_h = max(4, min(36, bar_h))
                draw.rectangle([bx, 275 - bar_h, bx + 6, 275], fill=(168, 85, 247, 220))
                
            # Search result hit cards
            results = [
                ("PostgreSQL Internals Masterclass", "00:14:20.500", "...indexing speeds up query resolution using logarithmic scans over partitioned leaves...", "0.982"),
                ("Storage Engine Architecture", "00:38:12.120", "...B-tree depth rarely exceeds 4 levels even with millions of tuples due to high fan-out...", "0.914")
            ]
            for r_idx, (r_title, r_time, r_txt, r_score) in enumerate(results):
                ry1 = 295 + r_idx * 75
                draw.rounded_rectangle([50, ry1, width - 50, ry1 + 65], radius=8, fill=(18, 22, 32, 255), outline=(36, 44, 60), width=1)
                draw.text((70, ry1 + 10), r_title, fill=(248, 250, 252), font=font_bold)
                draw.text((70, ry1 + 32), r_txt, fill=(148, 163, 184), font=font_small)
                draw.text((width - 190, ry1 + 10), f"SEEK: {r_time}", fill=(56, 189, 248), font=font_mono_bold)
                draw.text((width - 190, ry1 + 32), f"Relevance: {r_score}", fill=(168, 85, 247), font=font_badge)

        # Chapter 4: Clip Studio (16:9 to 9:16)
        elif ch_idx == 3:
            draw.text((50, 135), "AI VERTICAL CLIP STUDIO (16:9 LANDSCAPE → 9:16 SHORTS / REELS)", fill=(245, 158, 11), font=font_bold)
            
            # Left: 16:9 Landscape Video Frame
            draw.rounded_rectangle([80, 180, 480, 405], radius=10, fill=(20, 26, 38, 255), outline=(245, 158, 11), width=1)
            draw.text((100, 195), "SOURCE 16:9 WIDESCREEN (1920x1080)", fill=(148, 163, 184), font=font_badge)
            
            # Centroid face tracking box smoothly moving horizontally
            box_x = int(240 + 50 * math.sin(frame_idx * 0.15))
            draw.rectangle([box_x, 220, box_x + 90, 390], fill=(245, 158, 11, 40), outline=(245, 158, 11), width=2)
            draw.rounded_rectangle([box_x + 8, 228, box_x + 82, 248], radius=3, fill=(245, 158, 11))
            draw.text((box_x + 14, 231), "FACE: 99.4%", fill=(0, 0, 0), font=font_badge)
            
            # Center Arrow
            draw.text((515, 280), "➔", fill=(245, 158, 11), font=font_large_badge)
            
            # Right: 9:16 Smartphone Vertical Frame
            draw.rounded_rectangle([580, 165, 740, 435], radius=18, fill=(12, 16, 24, 255), outline=(245, 158, 11), width=3)
            # Simulated speaker avatar
            draw.ellipse([635, 220, 685, 270], fill=(245, 158, 11))
            draw.rounded_rectangle([615, 285, 705, 345], radius=8, fill=(245, 158, 11, 160))
            
            # Dynamic Burned Subtitle Box
            sub_glow = int(180 + 75 * math.sin(frame_idx * 0.4))
            draw.rounded_rectangle([595, 375, 725, 415], radius=6, fill=(0, 0, 0, 220), outline=(254, 240, 138, sub_glow), width=1)
            draw.text((605, 382), "VIRAL KARAOKE", fill=(254, 240, 138), font=font_badge)
            draw.text((605, 396), "CAPTIONS 🔥", fill=(255, 255, 255), font=font_badge)
            
            # Description sidebar
            draw.text((770, 210), "AI Subject Tracking Features:", fill=(248, 250, 252), font=font_bold)
            clip_pts = [
                "• Automatic facial centroid tracking",
                "• Kinetic word-by-word subtitle burn",
                "• 60 FPS NVENC / H.264 rendering",
                "• Export ready for TikTok, Shorts & Reels"
            ]
            for p_i, pt in enumerate(clip_pts):
                draw.text((770, 245 + p_i * 30), pt, fill=(203, 213, 225), font=font_sub)

        # Chapter 5: Universal Transcoder
        elif ch_idx == 4:
            draw.text((50, 135), "UNIVERSAL TRANSMUXING & RFC 6266 / 5987 EXPORT MATRIX", fill=(236, 72, 153), font=font_bold)
            
            fmts = [
                ("MP4", "H.264 / AAC", "Universal Video", (236, 72, 153)),
                ("MKV", "AV1 / Opus", "Master Archive", (56, 189, 248)),
                ("MP3", "320kbps MP3", "Podcasts / Audio", (245, 158, 11)),
                ("FLAC", "24-bit Lossless", "Studio Master", (16, 185, 129)),
                ("SRT", "UTF-8 Timed", "Subtitles / Closed Captions", (168, 85, 247))
            ]
            fmt_w = (width - 100 - 40) // 5
            for f_i, (f_ext, f_codec, f_use, f_col) in enumerate(fmts):
                fx1 = 50 + f_i * (fmt_w + 10)
                fx2 = fx1 + fmt_w
                draw.rounded_rectangle([fx1, 180, fx2, 330], radius=10, fill=(20, 24, 34, 255), outline=f_col, width=1)
                draw.text((fx1 + 16, 198), f_ext, fill=f_col, font=font_large_badge)
                draw.text((fx1 + 16, 245), f_codec, fill=(248, 250, 252), font=font_bold)
                draw.text((fx1 + 16, 275), f_use, fill=(148, 163, 184), font=font_small)
                
            draw.rounded_rectangle([50, 360, width - 50, 430], radius=8, fill=(18, 22, 32, 255), outline=(236, 72, 153), width=1)
            draw.text((70, 375), "RFC 6266 & RFC 5987 UNICODE CONTENT-DISPOSITION COMPLIANCE", fill=(236, 72, 153), font=font_bold)
            draw.text((70, 400), "Ensures special characters, emojis, and non-ASCII media titles download flawlessly across all browsers and operating systems.", fill=(203, 213, 225), font=font_sub)

        # =========================================================
        # BOTTOM TERMINAL STREAM & PROGRESS BAR (Y: 505 to 595)
        # =========================================================
        # Live Terminal Line
        draw.rounded_rectangle([30, 508, width - 30, 545], radius=6, fill=(12, 15, 20, 255), outline=(32, 38, 50), width=1)
        draw.text((45, 520), "TERMINAL STDOUT:", fill=ch_color, font=font_badge)
        
        terminal_msg = f"[MEDIAOS-KERNEL] Active module: {current_ch['name']} | Time: {(frame_idx / fps):.2f}s | Status: 100% HEALTHY"
        draw.text((160, 520), terminal_msg, fill=(226, 232, 240), font=font_mono)
        
        # Scrubber bar across bottom
        draw.rectangle([30, 558, width - 30, 564], fill=(24, 30, 42, 255))
        progress_w = int((width - 60) * ((frame_idx + 1) / total_frames))
        draw.rectangle([30, 558, 30 + progress_w, 564], fill=ch_color)
        
        # Bottom footer stats
        draw.text((32, 575), f"TIMELINE: {frame_idx + 1}/{total_frames} FRAMES", fill=(100, 116, 139), font=font_mono)
        draw.text((width - 340, 575), "MEDIAOS v2.6.4 • POWERED BY YT-DLP & FFMPEG 8.1", fill=(100, 116, 139), font=font_mono)
        
        # Laser Scanline effect across entire video
        scan_y = int((frame_idx * 7) % height)
        draw.line([(15, scan_y), (width - 15, scan_y)], fill=(*ch_color, 120), width=2)
        
        # Save frame
        frame_filename = os.path.join(frames_dir, f"frame_{frame_idx:04d}.png")
        img.save(frame_filename)
        
        if (frame_idx + 1) % 50 == 0:
            print(f"Rendered {frame_idx + 1}/{total_frames} frames...")
            
    print("All frames rendered! Invoking FFmpeg to assemble MP4 and GIF...")
    
    mp4_out = "docs/assets/mediaos_demo.mp4"
    gif_out = "docs/assets/mediaos_guide.gif"
    
    # 1. Generate MP4 (H.264 high quality, yuv420p for maximum web compatibility)
    mp4_cmd = [
        "ffmpeg", "-y",
        "-framerate", str(fps),
        "-i", os.path.join(frames_dir, "frame_%04d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-movflags", "+faststart",
        mp4_out
    ]
    subprocess.run(mp4_cmd, check=True)
    print(f"Generated MP4: {mp4_out} ({os.path.getsize(mp4_out) / 1024:.1f} KB)")
    
    # 2. Generate Optimized GIF with Palettegen for GitHub README preview
    palette_file = "scratch_palette.png"
    gen_palette_cmd = [
        "ffmpeg", "-y",
        "-i", mp4_out,
        "-vf", "fps=15,scale=960:-1:flags=lanczos,palettegen",
        palette_file
    ]
    subprocess.run(gen_palette_cmd, check=True)
    
    gen_gif_cmd = [
        "ffmpeg", "-y",
        "-i", mp4_out,
        "-i", palette_file,
        "-lavfi", "fps=15,scale=960:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3",
        gif_out
    ]
    subprocess.run(gen_gif_cmd, check=True)
    print(f"Generated GIF: {gif_out} ({os.path.getsize(gif_out) / (1024 * 1024):.2f} MB)")
    
    # Clean up scratch files
    if os.path.exists(palette_file):
        os.remove(palette_file)
    shutil.rmtree(frames_dir)
    print("Video generation successfully completed!")

if __name__ == "__main__":
    main()
