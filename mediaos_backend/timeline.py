"""
==============================================================================
   MEDIAOS CANONICAL TIMELINE ENGINE
   Frame-Accurate Millisecond Timeline Abstraction & Coordinate Normalizer
   Built by Mohammad Zumaan Sayyed
==============================================================================
"""

import re
from typing import Dict, Any, List, Optional, Tuple

class TimelineRange:
    """Canonical millisecond-accurate timeline interval."""
    def __init__(self, start_ms: int, end_ms: int, label: Optional[str] = None):
        if start_ms < 0:
            start_ms = 0
        if end_ms < start_ms:
            end_ms = start_ms
        self.start_ms = int(start_ms)
        self.end_ms = int(end_ms)
        self.label = label or ""

    @property
    def duration_ms(self) -> int:
        return self.end_ms - self.start_ms

    @property
    def duration_seconds(self) -> float:
        return self.duration_ms / 1000.0

    @property
    def start_str(self) -> str:
        return format_time_ms(self.start_ms)

    @property
    def end_str(self) -> str:
        return format_time_ms(self.end_ms)

    def overlaps(self, other: "TimelineRange") -> bool:
        return max(self.start_ms, other.start_ms) < min(self.end_ms, other.end_ms)

    def contains(self, timestamp_ms: int) -> bool:
        return self.start_ms <= timestamp_ms <= self.end_ms

    def intersection(self, other: "TimelineRange") -> Optional["TimelineRange"]:
        if not self.overlaps(other):
            return None
        return TimelineRange(max(self.start_ms, other.start_ms), min(self.end_ms, other.end_ms))

    def to_dict(self) -> Dict[str, Any]:
        return {
            "start_ms": self.start_ms,
            "end_ms": self.end_ms,
            "duration_ms": self.duration_ms,
            "start_str": self.start_str,
            "end_str": self.end_str,
            "label": self.label
        }

    def __repr__(self) -> str:
        return f"<TimelineRange {self.start_str} -> {self.end_str} ({self.duration_ms}ms)>"


def parse_time_to_ms(time_input: Any) -> int:
    """
    Parses any human or machine timestamp into exact integer milliseconds.
    Supports:
      - int/float (seconds or ms: if > 100,000 without decimal, assumed ms; if float, assumed seconds)
      - "01:42:13.482" -> hh:mm:ss.mmm
      - "14:20.5" -> mm:ss.s
      - "03:45" -> mm:ss
      - "420s" / "500ms"
    """
    if time_input is None:
        return 0
    if isinstance(time_input, (int, float)):
        # If float, it's seconds in standard media APIs
        if isinstance(time_input, float):
            return int(round(time_input * 1000.0))
        # Int: if clearly large (> 1,000,000), it's ms; else if moderate, could be seconds
        return int(time_input)

    val_str = str(time_input).strip()
    if not val_str:
        return 0

    if val_str.lower().endswith("ms"):
        try:
            return int(float(val_str[:-2].strip()))
        except ValueError:
            return 0

    if val_str.lower().endswith("s"):
        try:
            return int(float(val_str[:-1].strip()) * 1000.0)
        except ValueError:
            return 0

    # Colon formats: HH:MM:SS.mmm or MM:SS.mmm or MM:SS
    parts = val_str.split(":")
    try:
        if len(parts) == 3:
            h = int(parts[0])
            m = int(parts[1])
            s_parts = parts[2].split(".")
            s = int(s_parts[0])
            ms = int(s_parts[1].ljust(3, "0")[:3]) if len(s_parts) > 1 else 0
            return (h * 3600 + m * 60 + s) * 1000 + ms
        elif len(parts) == 2:
            m = int(parts[0])
            s_parts = parts[1].split(".")
            s = int(s_parts[0])
            ms = int(s_parts[1].ljust(3, "0")[:3]) if len(s_parts) > 1 else 0
            return (m * 60 + s) * 1000 + ms
        elif len(parts) == 1:
            return int(float(parts[0]) * 1000.0)
    except Exception:
        return 0

    return 0


def format_time_ms(ms: int, include_hours: bool = False) -> str:
    """
    Formats milliseconds into canonical `hh:mm:ss.mmm` or `mm:ss.mmm`.
    """
    if ms < 0:
        ms = 0
    total_seconds = ms // 1000
    rem_ms = ms % 1000
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60

    if hours > 0 or include_hours:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{rem_ms:03d}"
    return f"{minutes:02d}:{seconds:02d}.{rem_ms:03d}"


def normalize_transcript_segments(raw_segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Normalizes any raw transcript cues into canonical millisecond timeline structures.
    Guarantees:
      - `id`: Unique segment ID (e.g. `seg_0001`)
      - `start_ms`: Integer start offset
      - `end_ms`: Integer end offset
      - `text`: Cleaned cue text
      - `time_str`: Canonical display time string
      - `speaker`: Assigned speaker handle
    """
    normalized = []
    for idx, seg in enumerate(raw_segments):
        # Determine start_ms
        if "start_ms" in seg:
            start_ms = int(seg["start_ms"])
        elif "start" in seg:
            start_ms = parse_time_to_ms(seg["start"])
        elif "timestamp" in seg:
            start_ms = parse_time_to_ms(seg["timestamp"])
        else:
            start_ms = idx * 3000

        # Determine end_ms
        if "end_ms" in seg:
            end_ms = int(seg["end_ms"])
        elif "end" in seg:
            end_ms = parse_time_to_ms(seg["end"])
        elif "duration" in seg:
            dur_ms = parse_time_to_ms(seg["duration"])
            end_ms = start_ms + dur_ms
        else:
            # Fallback estimation based on text length (avg 15 chars/sec)
            txt_len = len(seg.get("text", ""))
            est_sec = max(2.0, txt_len / 15.0)
            end_ms = start_ms + int(est_sec * 1000)

        if end_ms <= start_ms:
            end_ms = start_ms + 2000

        seg_id = seg.get("id") or f"seg_{idx:04d}"
        clean_cue = re.sub(r'\s+', ' ', seg.get("text", "")).strip()

        normalized.append({
            "id": str(seg_id),
            "segment_index": idx,
            "start_ms": start_ms,
            "end_ms": end_ms,
            "duration_ms": end_ms - start_ms,
            "time_str": format_time_ms(start_ms),
            "end_str": format_time_ms(end_ms),
            "text": clean_cue,
            "speaker": seg.get("speaker") or "Speaker 01",
            "confidence": float(seg.get("confidence", 0.95))
        })
    return normalized


def slice_transcript_by_ms(
    segments: List[Dict[str, Any]],
    start_ms: int,
    end_ms: int
) -> List[Dict[str, Any]]:
    """Returns segments strictly overlapping with the target millisecond window."""
    target_range = TimelineRange(start_ms, end_ms)
    matches = []
    for seg in segments:
        s_ms = seg.get("start_ms", 0)
        e_ms = seg.get("end_ms", s_ms + 2000)
        if TimelineRange(s_ms, e_ms).overlaps(target_range):
            matches.append(seg)
    return matches
