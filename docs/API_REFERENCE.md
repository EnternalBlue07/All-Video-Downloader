# MEDIAOS REST & WebSocket API Specification

> **Base URL:** `http://localhost:8000/api`  
> **Interactive Swagger UI:** `http://localhost:8000/docs`  
> **ReDoc Documentation:** `http://localhost:8000/redoc`

---

## 1. System & Health

### `GET /api/health`
Returns the operational status of MEDIAOS, active engine versions, and architect credits.

**Response `200 OK`:**
```json
{
  "status": "operational",
  "system": "MEDIAOS",
  "builder": "Mohammad Zumaan Sayyed",
  "engine": "yt-dlp 2026.08.19 + FFmpeg 8.1.2 + Neural Core",
  "timestamp": "2026-09-27T18:50:00"
}
```

### `GET /api/stats`
Returns aggregated library statistics, total media hours, clip counts, and storage footprint.

**Response `200 OK`:**
```json
{
  "total_media": 24,
  "total_duration_hours": 14.8,
  "total_storage_bytes": 16428901234,
  "total_clips": 12,
  "total_collections": 4,
  "total_courses": 2
}
```

---

## 2. Ingestion & Stream Inspection

### `POST /api/inspect`
Analyzes any URL, pulls upstream metadata, evaluates duplicate confidence tiers, and formats available resolutions.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response `200 OK`:**
```json
{
  "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
  "creator": "Rick Astley",
  "duration": 213,
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "available_resolutions": ["2160p (4K)", "1440p (2K)", "1080p (FHD)", "720p (HD)"],
  "available_audio": ["opus", "aac", "mp3", "flac"],
  "duplicate_check": {
    "is_duplicate": false,
    "confidence": "NONE",
    "matched_item": null
  }
}
```

### `POST /api/process`
Enqueues a media download and background intelligence analysis job.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "creator": "Rick Astley",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "quality": "1080p",
  "container": "MP4",
  "audio": "opus",
  "subtitles": "en",
  "sponsorblock": true,
  "ai_analysis": true,
  "duration": 213
}
```

**Response `200 OK`:**
```json
{
  "job_id": "job_c9a14e97-28d1-41f2-9572-911855a805f1",
  "status": "queued",
  "message": "Ingest pipeline triggered successfully."
}
```

---

## 3. Real-Time Jobs & WebSockets

### `GET /api/jobs`
Lists all active, completed, or failed download jobs.

### `POST /api/jobs/{job_id}/cancel`
Signals the running extraction thread to terminate and mark the job as cancelled.

### `WebSocket /ws/jobs`
Live multiplexed stream of ingest progress updates.

**Payload Example:**
```json
{
  "id": "job_c9a14e97-28d1-41f2-9572-911855a805f1",
  "stage": "downloading",
  "progress": 68.4,
  "speed": "14.2 MB/s",
  "eta": "00:12",
  "size": "148.5 MB"
}
```

---

## 4. Media Library & Streaming

### `GET /api/media`
Returns all ingested media records with pagination, filtering, and sorting.
* Query Parameters: `limit` (default: 50), `offset` (default: 0), `query` (search term).

### `GET /api/media/{media_id}`
Returns complete detail payload for an ingested video including:
* Perceptual Media DNA
* AI Summary & Chapter timestamps
* Extracted topics & Key takeaways
* Full timestamped transcripts
* Vertical Clip candidates

### `DELETE /api/media/{media_id}`
Removes the media record from SQLite and unlinks local video, audio, and subtitle files.

### `GET /api/media/{media_id}/export`
Transcodes or packages the media into specified formats with RFC 6266 / RFC 5987 Unicode headers.
* Query Parameters: `format` (`mp4`, `mkv`, `webm`, `mp3`, `flac`, `wav`, `srt`, `vtt`, `txt`).

---

## 5. Clip Studio

### `POST /api/clips`
Renders a custom vertical (9:16) or standard clip with dynamic FFmpeg cropping.

**Request Body:**
```json
{
  "media_id": "med_123456",
  "media_title": "React Deep Dive",
  "title": "Understanding Reconciliation",
  "start_time": 142.5,
  "end_time": 185.0,
  "aspect_ratio": "9:16",
  "captions_enabled": true
}
```

### `GET /api/clips/{clip_id}/download`
Streams the rendered vertical short directly as an MP4 attachment.

---

## 6. Semantic Search & NLP

### `POST /api/ask-video`
Performs timestamp-grounded question answering on a specific video's transcript.

**Request Body:**
```json
{
  "media_id": "med_123456",
  "question": "How does the virtual DOM calculate diffs?"
}
```

**Response `200 OK`:**
```json
{
  "answer": "The speaker explains that the virtual DOM compares previous and new fiber trees using a heuristic O(n) algorithm at timestamp 02:45.",
  "timestamp": 165.0,
  "formatted_time": "02:45",
  "relevance_score": 0.94
}
```

### `POST /api/ask-library`
Cross-searches every ingested video in the entire database to synthesize an answer.
