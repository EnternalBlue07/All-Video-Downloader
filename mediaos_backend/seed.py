import json
from datetime import datetime
from db import get_connection
from dna import generate_media_dna
from intelligence import generate_ai_analysis
from semantic_search import index_media_fts

def seed_database():
    # Production-grade MEDIAOS: do not insert mock dummy items.
    # Library is populated strictly via user ingestion and real streams.
    return

    sample_items = [
        {
            "id": "med_dist_arch",
            "url": "https://www.youtube.com/watch?v=sample_dist_arch",
            "title": "Distributed Systems & Ingestion Architecture Masterclass",
            "creator": "Martin Fowler & System Engineering Lab",
            "duration": 4820, # 1h 20m 20s
            "resolution": "2160p (4K)",
            "thumbnail": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
            "file_size": 2480000000,
            "created_at": "2026-09-24 14:12:00"
        },
        {
            "id": "med_react_internals",
            "url": "https://www.youtube.com/watch?v=sample_react_internals",
            "title": "React Server Components & Concurrent Runtime Internals",
            "creator": "Dan Abramov & Sophie Alpert",
            "duration": 3410, # 56m 50s
            "resolution": "1080p (FHD)",
            "thumbnail": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
            "file_size": 1420000000,
            "created_at": "2026-09-25 09:30:00"
        },
        {
            "id": "med_jwt_security",
            "url": "https://www.youtube.com/watch?v=sample_jwt_security",
            "title": "JWT Refresh Tokens, Session Barriers & OAuth2 Security",
            "creator": "OWASP Security Foundation",
            "duration": 2640, # 44m
            "resolution": "1440p (2K)",
            "thumbnail": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
            "file_size": 980000000,
            "created_at": "2026-09-25 18:22:00"
        },
        {
            "id": "med_llm_rag",
            "url": "https://www.youtube.com/watch?v=sample_llm_rag",
            "title": "Building Production RAG & Vector Indexing at Scale",
            "creator": "AI Research Group",
            "duration": 5120, # 1h 25m 20s
            "resolution": "2160p (4K)",
            "thumbnail": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
            "file_size": 2980000000,
            "created_at": "2026-09-26 08:45:00"
        }
    ]

    for item in sample_items:
        ai_data = generate_ai_analysis(
            title=item["title"],
            creator=item["creator"],
            duration=item["duration"]
        )
        dna = generate_media_dna(
            title=item["title"],
            creator=item["creator"],
            duration=item["duration"],
            resolution=item["resolution"],
            video_codec="AV1",
            audio_codec="Opus",
            container="MP4"
        )
        
        cursor.execute("""
            INSERT INTO media (
                id, url, title, creator, duration, resolution, thumbnail, file_path,
                file_size, created_at, ai_status, summary, chapters, topics, transcript,
                dna, knowledge, clip_candidates
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item["id"],
            item["url"],
            item["title"],
            item["creator"],
            item["duration"],
            item["resolution"],
            item["thumbnail"],
            f"downloads/{item['id']}.mp4",
            item["file_size"],
            item["created_at"],
            "indexed",
            ai_data["summary"],
            json.dumps(ai_data["chapters"]),
            json.dumps(ai_data["topics"]),
            json.dumps(ai_data["transcript"]),
            json.dumps(dna),
            json.dumps(ai_data["knowledge"]),
            json.dumps(ai_data["clip_candidates"])
        ))
        
        index_media_fts(
            media_id=item["id"],
            title=item["title"],
            creator=item["creator"],
            topics=ai_data["topics"],
            summary=ai_data["summary"],
            transcript=ai_data["transcript"],
            existing_conn=conn
        )

    # Initial collections
    cursor.execute("""
        INSERT OR REPLACE INTO collections (id, name, description, media_ids, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        "col_systems",
        "Systems Architecture & Scalability",
        "Curated deep dives into high-throughput backend patterns and distributed consistency.",
        json.dumps(["med_dist_arch", "med_llm_rag"]),
        "2026-09-25 10:00:00"
    ))
    cursor.execute("""
        INSERT OR REPLACE INTO collections (id, name, description, media_ids, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        "col_security",
        "Web Security & Identity",
        "Production token management, cryptographic verification and access boundaries.",
        json.dumps(["med_jwt_security"]),
        "2026-09-25 11:30:00"
    ))

    # Initial clips
    cursor.execute("""
        INSERT OR REPLACE INTO clips (id, media_id, media_title, title, start_time, end_time, aspect_ratio, captions_enabled, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "clip_intro_frag",
        "med_dist_arch",
        "Distributed Systems & Ingestion Architecture Masterclass",
        "Why Synchronous Cascades Kill Availability in 30s",
        720.0,
        752.0,
        "9:16",
        1,
        "ready",
        "2026-09-25 15:40:00"
    ))

    # Initial course
    modules = [
        {
            "id": "mod_1",
            "title": "Module 01 — Architectural Foundations & Ingestion",
            "video_id": "med_dist_arch",
            "summary": "Core mental models for unblocking event streams and bounded buffers.",
            "quiz_count": 2
        },
        {
            "id": "mod_2",
            "title": "Module 02 — Authentication & Identity Boundaries",
            "video_id": "med_jwt_security",
            "summary": "Refresh token rotations, session revocation, and cryptographic nonces.",
            "quiz_count": 2
        },
        {
            "id": "mod_3",
            "title": "Module 03 — Vector Search & RAG Integration",
            "video_id": "med_llm_rag",
            "summary": "High-density semantic indexing, reciprocal rank fusion, and chunking strategy.",
            "quiz_count": 2
        }
    ]
    cursor.execute("""
        INSERT OR REPLACE INTO courses (id, title, description, modules, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        "course_enterprise_arch",
        "Production Systems & AI Media Engineering",
        "From ingestion pipelines to secure authentication and high-density vector retrieval.",
        json.dumps(modules),
        "2026-09-26 09:00:00"
    ))

    # Seed an active download row to show live execution
    cursor.execute("""
        INSERT OR REPLACE INTO jobs (
            id, media_id, url, title, thumbnail, source, stage, progress, speed, eta, size, quality, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "job_live_demo",
        "med_live_demo",
        "https://www.youtube.com/watch?v=live_demo_event",
        "Event-Driven Microservices in Rust & Tokio",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
        "YouTube",
        "downloading",
        87.4,
        "44.8 MB/s",
        "00:06",
        "2.4 GB",
        "1080p (AV1)",
        "2026-09-26 12:00:00"
    ))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed_database()
    print("Database seeded successfully.")
