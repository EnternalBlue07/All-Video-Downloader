"""
Unit tests for MEDIAOS Media DNA & Duplicate Arbitrator
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "mediaos_backend")))
from dna import generate_media_dna

class TestMediaDNA(unittest.TestCase):

    def test_dna_determinism(self):
        # Two executions with identical parameters must produce the exact same fingerprint
        dna1 = generate_media_dna(
            title="Distributed Systems Masterclass",
            creator="Martin Fowler",
            duration=3600,
            resolution="1080p",
            video_codec="AV1",
            audio_codec="Opus"
        )

        dna2 = generate_media_dna(
            title="Distributed Systems Masterclass",
            creator="Martin Fowler",
            duration=3600,
            resolution="1080p",
            video_codec="AV1",
            audio_codec="Opus"
        )

        self.assertEqual(dna1["source_identity"]["source_id"], dna2["source_identity"]["source_id"])
        self.assertEqual(dna1["content_identity"]["fingerprint"], dna2["content_identity"]["fingerprint"])
        self.assertEqual(dna1["content_identity"]["checksum"], dna2["content_identity"]["checksum"])

    def test_dna_mutation_detection(self):
        # Different duration or codec must produce different content fingerprint
        dna_base = generate_media_dna(
            title="Lecture",
            creator="Teacher",
            duration=1200,
            resolution="1080p",
            video_codec="AV1"
        )

        dna_mutated = generate_media_dna(
            title="Lecture",
            creator="Teacher",
            duration=1200,
            resolution="1080p",
            video_codec="H264"
        )

        self.assertEqual(dna_base["source_identity"]["source_id"], dna_mutated["source_identity"]["source_id"])
        self.assertNotEqual(dna_base["content_identity"]["fingerprint"], dna_mutated["content_identity"]["fingerprint"])

if __name__ == "__main__":
    unittest.main()
