import sqlite3
import json
import os
import threading
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "storage", "mediaos.db")
_lock = threading.Lock()

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=30.0, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with _lock:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS media (
            id TEXT PRIMARY KEY,
            url TEXT,
            title TEXT,
            creator TEXT,
            duration INTEGER,
            resolution TEXT,
            thumbnail TEXT,
            file_path TEXT,
            file_size INTEGER DEFAULT 0,
            created_at TEXT,
            ai_status TEXT DEFAULT 'pending',
            summary TEXT,
            chapters TEXT,
            topics TEXT,
            transcript TEXT,
            dna TEXT,
            knowledge TEXT,
            clip_candidates TEXT
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            media_id TEXT,
            url TEXT,
            title TEXT,
            thumbnail TEXT,
            source TEXT,
            stage TEXT,
            progress REAL DEFAULT 0,
            speed TEXT,
            eta TEXT,
            size TEXT,
            quality TEXT,
            error_message TEXT,
            created_at TEXT
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS collections (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            media_ids TEXT,
            created_at TEXT
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS clips (
            id TEXT PRIMARY KEY,
            media_id TEXT,
            media_title TEXT,
            title TEXT,
            start_time REAL,
            end_time REAL,
            aspect_ratio TEXT,
            captions_enabled INTEGER DEFAULT 1,
            status TEXT DEFAULT 'ready',
            created_at TEXT
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            modules TEXT,
            created_at TEXT
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
        """)

        # FTS5 virtual table for lightning-fast transcript & metadata search
        cursor.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS media_fts USING fts5(
            media_id UNINDEXED,
            title,
            creator,
            topics,
            summary,
            transcript_text
        );
        """)
        
        conn.commit()
        conn.close()

init_db()
