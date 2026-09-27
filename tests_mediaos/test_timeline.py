"""
Unit tests for MEDIAOS Canonical Timeline Engine
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "mediaos_backend")))
from timeline import TimelineRange, parse_time_to_ms, format_time_ms, normalize_transcript_segments, slice_transcript_by_ms

class TestCanonicalTimeline(unittest.TestCase):

    def test_parse_time_to_ms(self):
        self.assertEqual(parse_time_to_ms("01:42:13.482"), (1 * 3600 + 42 * 60 + 13) * 1000 + 482)
        self.assertEqual(parse_time_to_ms("14:20.500"), (14 * 60 + 20) * 1000 + 500)
        self.assertEqual(parse_time_to_ms("03:45"), (3 * 60 + 45) * 1000)
        self.assertEqual(parse_time_to_ms(12.5), 12500)
        self.assertEqual(parse_time_to_ms("500ms"), 500)
        self.assertEqual(parse_time_to_ms(None), 0)

    def test_format_time_ms(self):
        self.assertEqual(format_time_ms(12500), "00:12.500")
        self.assertEqual(format_time_ms(3661123, include_hours=True), "01:01:01.123")

    def test_timeline_range_math(self):
        r1 = TimelineRange(10000, 20000, label="Intro")
        r2 = TimelineRange(15000, 25000, label="Middle")
        r3 = TimelineRange(30000, 40000, label="Outro")

        self.assertEqual(r1.duration_ms, 10000)
        self.assertEqual(r1.duration_seconds, 10.0)

        # Overlaps
        self.assertTrue(r1.overlaps(r2))
        self.assertFalse(r1.overlaps(r3))

        # Intersection
        inter = r1.intersection(r2)
        self.assertIsNotNone(inter)
        self.assertEqual(inter.start_ms, 15000)
        self.assertEqual(inter.end_ms, 20000)
        self.assertIsNone(r1.intersection(r3))

        # Containment
        self.assertTrue(r1.contains(15000))
        self.assertFalse(r1.contains(25000))

    def test_normalize_transcript_segments(self):
        raw = [
            {"timestamp": "00:05", "text": "Welcome to MEDIAOS", "speaker": "Mohammad"},
            {"timestamp": "00:10", "duration": "3s", "text": "This is frame-accurate timing."}
        ]
        norm = normalize_transcript_segments(raw)
        self.assertEqual(len(norm), 2)
        self.assertEqual(norm[0]["start_ms"], 5000)
        self.assertEqual(norm[0]["speaker"], "Mohammad")
        self.assertEqual(norm[1]["start_ms"], 10000)
        self.assertEqual(norm[1]["end_ms"], 13000)
        self.assertEqual(norm[1]["duration_ms"], 3000)

    def test_slice_transcript_by_ms(self):
        segments = [
            {"id": "seg_1", "start_ms": 1000, "end_ms": 4000, "text": "First"},
            {"id": "seg_2", "start_ms": 5000, "end_ms": 8000, "text": "Second"},
            {"id": "seg_3", "start_ms": 9000, "end_ms": 12000, "text": "Third"}
        ]
        # Slice between 3000ms and 6000ms -> should match seg_1 and seg_2
        sliced = slice_transcript_by_ms(segments, 3000, 6000)
        self.assertEqual(len(sliced), 2)
        self.assertEqual(sliced[0]["id"], "seg_1")
        self.assertEqual(sliced[1]["id"], "seg_2")

if __name__ == "__main__":
    unittest.main()
