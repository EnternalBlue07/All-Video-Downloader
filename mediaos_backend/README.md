# MEDIAOS Intelligence Engine (Backend Core)

> **High-Performance Python Asynchronous Media Processing & Intelligence Server**  
> *Architected and Crafted by **Mohammad Zumaan Sayyed***

---

## Architecture & Technology Stack

The **MEDIAOS Backend** is a high-throughput, async Python engine designed to manage the entire lifecycle of digital media assets: from URL inspection and multi-stream downloading to perceptual DNA hashing, full-text transcript search, vertical clipping, and RFC-compliant format streaming.

* **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/) with asynchronous route handlers & ASGI runtime.
* **ASGI Server:** [Uvicorn](https://www.uvicorn.org/) with high-performance event loop (`uvloop`).
* **Ingestion Core:** Native [yt-dlp](https://github.com/yt-dlp/yt-dlp) core integration for 1000+ streaming sites.
* **Transcoding Engine:** [FFmpeg 8.1](https://ffmpeg.org/) for stream copy, container transmutation, and 9:16 vertical video rendering.
* **Data Layer:** SQLite 3 with **Write-Ahead Logging (WAL)** and **FTS5 (Full-Text Search)** virtual tables.
* **Real-time Bus:** Native WebSockets for multiplexed download progress and telemetry broadcasting.

---

## Directory Structure & Modules

```
mediaos_backend/
├── db.py                # Thread-safe SQLite connection pool, schema migrations & WAL setup
├── dna.py               # Dual-vector Media DNA generation & multi-tiered duplicate detection
├── find_download.py     # Resilient filesystem resolver for completed audio/video files
├── format_export.py     # Transmuxing engine & RFC 6266/5987 Unicode Content-Disposition headers
├── ingest.py            # Asynchronous yt-dlp worker queue, progress hooks & cancellation
├── intelligence.py      # Context-aware chapter extraction, NLP key concepts & summary generation
├── main.py              # FastAPI application server, REST endpoints & WebSocket handlers
├── requirements.txt     # Locked production dependencies
├── seed.py              # Initial database seeder for instant sandbox demonstration
├── semantic_search.py   # SQLite FTS5 transcript indexing, BM25 ranking & Q&A synthesis
├── storage_intel.py     # Disk consumption analytics, codec breakdowns & duplicate reports
└── storage/             # Persistent directory containing mediaos.db and SQLite WAL files
```

---

## Database Schema (SQLite WAL)

MEDIAOS stores all state in `mediaos_backend/storage/mediaos.db` with WAL mode enabled for concurrent reads and writes without database lock contention.

### 1. `media` Table
* `id` (TEXT, PK): Unique media identifier (`med_<uuid>`)
* `url` (TEXT): Canonical upstream stream URL
* `title` (TEXT): Media title
* `creator` (TEXT): Channel / author / producer
* `duration` (INTEGER): Stream length in seconds
* `resolution` (TEXT): Output resolution (e.g. `1080p`, `2160p (4K)`)
* `thumbnail` (TEXT): Web-accessible thumbnail URL
* `file_path` (TEXT): Absolute path to local storage
* `file_size` (INTEGER): File size in bytes
* `ai_status` (TEXT): State (`pending`, `analyzing`, `completed`)
* `summary` (TEXT): AI generated summary
* `chapters` (TEXT): JSON array of timestamped chapter markers
* `topics` (TEXT): JSON array of semantic concepts & keywords
* `transcript` (TEXT): JSON array of timestamped speech cues
* `dna` (TEXT): JSON payload of Source Identity & Content Fingerprint
* `clip_candidates` (TEXT): JSON array of recommended short-form moments

### 2. `jobs` Table
Tracks real-time download and transcoding operations with download speeds, ETA, and progress percentages.

### 3. `clips` Table
Persists rendered 9:16 vertical video assets with start/end time offsets and caption settings.

### 4. `collections` & `courses` Tables
Enables curating ingested videos into thematic knowledge tracks and multi-module educational courses.

---

## Local Development

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the FastAPI development server with hot-reloading
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# 3. Access Swagger API docs
open http://localhost:8000/docs
```
