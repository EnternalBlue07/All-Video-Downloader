"""
==============================================================================
   MEDIAOS PROVENANCE & SOURCE GROUNDING ENGINE
   Traceable, Hallucination-Resistant Verification & Evidence Ledger
   Built by Mohammad Zumaan Sayyed
==============================================================================
"""

import os
import re
import uuid
import sqlite3
from typing import Dict, Any, List, Optional
from datetime import datetime

from db import get_connection
from timeline import format_time_ms, parse_time_to_ms, normalize_transcript_segments

class ProvenanceStatus:
    VERIFIED = "VERIFIED"
    HIGH_CONFIDENCE = "HIGH_CONFIDENCE"
    MEDIUM_CONFIDENCE = "MEDIUM_CONFIDENCE"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


def extract_claim_evidence(
    claim_text: str,
    segments: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Scans normalized transcript segments for verified textual evidence backing a claim.
    Returns exact start_ms, end_ms, matching segment IDs, and evidence span.
    Guarantees: If evidence is not grounded in real transcripts, returns INSUFFICIENT_EVIDENCE.
    """
    if not claim_text or not segments:
        return {
            "status": ProvenanceStatus.INSUFFICIENT_EVIDENCE,
            "confidence": 0.0,
            "evidence_text": "Insufficient source transcript available to verify statement.",
            "start_ms": 0,
            "end_ms": 0,
            "transcript_segment_ids": []
        }

    # Extract clean semantic words from claim (ignore small stop words)
    stop_words = {"the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for", "of", "and", "or", "it", "this", "that", "with"}
    claim_words = [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-\.]{3,}\b', claim_text) if w.lower() not in stop_words]

    if not claim_words:
        return {
            "status": ProvenanceStatus.INSUFFICIENT_EVIDENCE,
            "confidence": 0.0,
            "evidence_text": "No substantive verifiable keywords in claim.",
            "start_ms": 0,
            "end_ms": 0,
            "transcript_segment_ids": []
        }

    # Score each segment based on term overlap & density
    scored_segments = []
    for seg in segments:
        text = seg.get("text", "").lower()
        matched_words = [w for w in claim_words if w in text]
        if matched_words:
            # Overlap ratio
            ratio = len(matched_words) / len(claim_words)
            scored_segments.append((ratio, len(matched_words), seg))

    if not scored_segments:
        return {
            "status": ProvenanceStatus.INSUFFICIENT_EVIDENCE,
            "confidence": 0.0,
            "evidence_text": "No grounded transcript spans corroborate this claim.",
            "start_ms": 0,
            "end_ms": 0,
            "transcript_segment_ids": []
        }

    # Sort by ratio descending
    scored_segments.sort(key=lambda x: (x[0], x[1]), reverse=True)
    best_ratio, count, best_seg = scored_segments[0]

    # Look for adjacent corroborating segments (temporal expansion only if split across boundary)
    best_idx = best_seg.get("segment_index", 0)
    matched_window = [best_seg]
    if best_ratio < 0.60:
        for seg in segments:
            idx = seg.get("segment_index", 0)
            if idx in (best_idx - 1, best_idx + 1):
                adj_words = [w for w in claim_words if w in seg.get("text", "").lower()]
                if len(adj_words) >= 2:
                    matched_window.append(seg)

    matched_window.sort(key=lambda s: s.get("start_ms", 0))

    start_ms = matched_window[0].get("start_ms", 0)
    end_ms = matched_window[-1].get("end_ms", start_ms + 2000)
    evidence_text = " ... ".join([s.get("text", "") for s in matched_window])
    seg_ids = [str(s.get("id")) for s in matched_window]

    # Determine confidence status
    confidence = min(0.98, max(0.20, best_ratio * 1.25))

    if confidence >= 0.85:
        status = ProvenanceStatus.VERIFIED
    elif confidence >= 0.65:
        status = ProvenanceStatus.HIGH_CONFIDENCE
    elif confidence >= 0.40:
        status = ProvenanceStatus.MEDIUM_CONFIDENCE
    elif confidence >= 0.25:
        status = ProvenanceStatus.LOW_CONFIDENCE
    else:
        status = ProvenanceStatus.INSUFFICIENT_EVIDENCE

    return {
        "status": status,
        "confidence": round(confidence, 2),
        "evidence_text": evidence_text,
        "start_ms": start_ms,
        "end_ms": end_ms,
        "start_str": format_time_ms(start_ms, include_hours=True),
        "end_str": format_time_ms(end_ms, include_hours=True),
        "transcript_segment_ids": seg_ids
    }


def record_provenance_claim(
    source_media_id: str,
    media_dna: str,
    claim_text: str,
    segments: List[Dict[str, Any]],
    transcription_model: str = "whisper-base",
    analysis_model: str = "mediaos-neural-v1"
) -> Dict[str, Any]:
    """
    Evaluates, grounds, and records a verified provenance record in SQLite.
    """
    norm_segments = normalize_transcript_segments(segments)
    evidence = extract_claim_evidence(claim_text, norm_segments)

    claim_id = f"prov_{uuid.uuid4().hex[:12]}"
    now_iso = datetime.now().isoformat()

    conn = get_connection()
    cursor = conn.cursor()

    import json
    cursor.execute("""
    INSERT OR REPLACE INTO provenance_claims (
        id, source_media_id, media_dna, claim_text, transcript_segment_ids,
        start_ms, end_ms, confidence, evidence_text, transcription_model,
        analysis_model, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        claim_id,
        source_media_id,
        media_dna,
        claim_text,
        json.dumps(evidence["transcript_segment_ids"]),
        evidence["start_ms"],
        evidence["end_ms"],
        evidence["confidence"],
        evidence["evidence_text"],
        transcription_model,
        analysis_model,
        evidence["status"],
        now_iso
    ))

    conn.commit()
    conn.close()

    result = {
        "id": claim_id,
        "source_media_id": source_media_id,
        "media_dna": media_dna,
        "claim_text": claim_text,
        "transcript_segment_ids": evidence["transcript_segment_ids"],
        "start_ms": evidence["start_ms"],
        "end_ms": evidence["end_ms"],
        "start_str": evidence.get("start_str", format_time_ms(evidence["start_ms"])),
        "end_str": evidence.get("end_str", format_time_ms(evidence["end_ms"])),
        "confidence": evidence["confidence"],
        "evidence_text": evidence["evidence_text"],
        "transcription_model": transcription_model,
        "analysis_model": analysis_model,
        "status": evidence["status"],
        "created_at": now_iso
    }
    return result


def get_provenance_claims(source_media_id: str) -> List[Dict[str, Any]]:
    """Retrieves all recorded provenance claims for a media item."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, source_media_id, media_dna, claim_text, transcript_segment_ids,
           start_ms, end_ms, confidence, evidence_text, transcription_model,
           analysis_model, status, created_at
    FROM provenance_claims
    WHERE source_media_id = ?
    ORDER BY start_ms ASC
    """, (source_media_id,))

    rows = cursor.fetchall()
    conn.close()

    import json
    claims = []
    for r in rows:
        seg_ids = []
        try:
            seg_ids = json.loads(r["transcript_segment_ids"] or "[]")
        except Exception:
            pass
        claims.append({
            "id": r["id"],
            "source_media_id": r["source_media_id"],
            "media_dna": r["media_dna"],
            "claim_text": r["claim_text"],
            "transcript_segment_ids": seg_ids,
            "start_ms": r["start_ms"],
            "end_ms": r["end_ms"],
            "start_str": format_time_ms(r["start_ms"], include_hours=True),
            "end_str": format_time_ms(r["end_ms"], include_hours=True),
            "confidence": r["confidence"],
            "evidence_text": r["evidence_text"],
            "transcription_model": r["transcription_model"],
            "analysis_model": r["analysis_model"],
            "status": r["status"],
            "created_at": r["created_at"]
        })
    return claims
