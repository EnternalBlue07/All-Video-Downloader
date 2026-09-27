"""
==============================================================================
   MEDIAOS CRASH-SAFE & JOB RECOVERY ENGINE
   State Persistence, Atomic File Finalization & Startup Reconciler
   Built by Mohammad Zumaan Sayyed
==============================================================================
"""

import os
import glob
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

from db import get_connection

DOWNLOADS_DIR = os.path.join(os.path.dirname(__file__), "downloads")

def reconcile_startup_jobs() -> Dict[str, Any]:
    """
    Scans for interrupted jobs on application startup and reconciles state:
      - Any jobs left in 'downloading', 'transcoding', 'analyzing' are transitioned
        to 'interrupted' so they can be resumed cleanly by the user.
      - Checks whether the target file actually finished downloading before crash.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id, media_id, url, title, thumbnail, source, stage, progress, quality, created_at
    FROM jobs
    WHERE stage IN ('downloading', 'transcoding', 'analyzing', 'queued')
    """)
    interrupted_rows = cursor.fetchall()

    reconciled = []
    now_iso = datetime.now().isoformat()

    for r in interrupted_rows:
        job_id = r["id"]
        # Check if the finished media file exists
        media_id = r["media_id"]
        cursor.execute("SELECT file_path FROM media WHERE id = ?", (media_id,))
        media_row = cursor.fetchone()

        file_exists = media_row and media_row["file_path"] and os.path.exists(media_row["file_path"])

        if file_exists:
            new_stage = "completed"
            cursor.execute("UPDATE jobs SET stage = 'completed', progress = 100.0, speed = '—', eta = '—' WHERE id = ?", (job_id,))
        else:
            new_stage = "interrupted"
            cursor.execute("UPDATE jobs SET stage = 'interrupted', speed = '—', eta = 'Interrupted (Ready to resume)' WHERE id = ?", (job_id,))

        reconciled.append({
            "id": job_id,
            "title": r["title"],
            "url": r["url"],
            "previous_stage": r["stage"],
            "new_stage": new_stage
        })

    conn.commit()
    conn.close()

    return {
        "interrupted_count": len(reconciled),
        "reconciled_jobs": reconciled
    }


def find_orphaned_fragments() -> List[Dict[str, Any]]:
    """
    Scans the media vault for dangling `.part`, `.ytdl`, or `.tmp` fragments.
    """
    patterns = [
        os.path.join(DOWNLOADS_DIR, "*.part"),
        os.path.join(DOWNLOADS_DIR, "*.ytdl"),
        os.path.join(DOWNLOADS_DIR, "*.tmp")
    ]
    orphaned = []
    for pat in patterns:
        for fpath in glob.glob(pat):
            try:
                sz = os.path.getsize(fpath)
                mtime = os.path.getmtime(fpath)
                orphaned.append({
                    "file_path": fpath,
                    "file_name": os.path.basename(fpath),
                    "size_bytes": sz,
                    "last_modified": datetime.fromtimestamp(mtime).isoformat()
                })
            except Exception:
                pass
    return orphaned


def clean_orphaned_fragments() -> int:
    """Removes orphaned download fragments to reclaim disk space."""
    orphans = find_orphaned_fragments()
    cleaned = 0
    for item in orphans:
        try:
            os.remove(item["file_path"])
            cleaned += 1
        except Exception:
            pass
    return cleaned
