# MEDIAOS Clip Studio & Vertical Short-Form Pipeline

> **Automated 9:16 Cropping, Audio Mastering, and Dynamic Subtitle Burning**  
> *Engineered by **Mohammad Zumaan Sayyed***

---

## 1. Overview

The **MEDIAOS Clip Studio** empowers creators and knowledge workers to turn long-form landscape content (YouTube podcasts, lectures, conference talks) into high-retention short-form videos (TikTok, Instagram Reels, YouTube Shorts) with zero manual video editing software required.

---

## 2. Core Capabilities

* **Intelligent Center Cropping (16:9 $\rightarrow$ 9:16):** Converts $1920\times 1080$ landscape into $1080\times 1920$ portrait video with pixel-accurate center-framing.
* **Millisecond Precision Trimming:** Uses FFmpeg fast seek (`-ss`) paired with accurate decode (`-to`) to eliminate audio desync and keyframe artifacts.
* **Dynamic Subtitle Burning:** Subtitles corresponding to the extracted time range are converted to ASS / SRT and burned directly into the video stream.
* **Auto-Generated Clip Candidates:** Ingest intelligence scans transcripts and chapter markers to suggest top 3 viral or high-signal moments automatically.

---

## 3. The FFmpeg Render Pipeline

When `/api/clips` receives a render job, the backend invokes:

```bash
ffmpeg -y \
  -ss {start_seconds} \
  -to {end_seconds} \
  -i "{input_media_file}" \
  -vf "crop=ih*(9/16):ih,scale=1080:1920:force_original_aspect_ratio=increase,subtitles='{subtitle_file}':force_style='FontSize=16,PrimaryColour=&H00FFFFFF&,OutlineColour=&H00000000&,BorderStyle=3,Outline=2'" \
  -c:v libx264 \
  -preset veryfast \
  -crf 21 \
  -c:a aac \
  -b:a 192k \
  "{output_clip_path}"
```

---

## 4. UI Workflow

1. Navigate to any video in the **Media Detail View** or the standalone **Clip Studio View**.
2. Drag the range sliders to define start and end timestamps.
3. Choose the target aspect ratio (`9:16 Portrait`, `1:1 Square`, or `16:9 Landscape`).
4. Toggle `Burn Captions`.
5. Click **"Render Clip"** — watch real-time progress — and hit **"Download MP4"** for instant publishing.
