"""
Unit tests for MEDIAOS Provenance Engine & Grounding Validator
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "mediaos_backend")))
from provenance import extract_claim_evidence, ProvenanceStatus

class TestProvenanceEngine(unittest.TestCase):

    def setUp(self):
        self.segments = [
            {"id": "seg_01", "segment_index": 0, "start_ms": 10000, "end_ms": 16000, "text": "In this video we will discuss database indexing and B-tree internals."},
            {"id": "seg_02", "segment_index": 1, "start_ms": 17000, "end_ms": 25000, "text": "PostgreSQL indexing speeds up query resolution using logarithmic scans."},
            {"id": "seg_03", "segment_index": 2, "start_ms": 26000, "end_ms": 35000, "text": "Always remember to use JWT rotation when implementing stateless refresh sessions."}
        ]

    def test_verified_claim(self):
        claim = "PostgreSQL indexing uses logarithmic scans for queries"
        evidence = extract_claim_evidence(claim, self.segments)
        self.assertIn(evidence["status"], [ProvenanceStatus.VERIFIED, ProvenanceStatus.HIGH_CONFIDENCE])
        self.assertGreaterEqual(evidence["confidence"], 0.65)
        self.assertEqual(evidence["start_ms"], 17000)
        self.assertIn("seg_02", evidence["transcript_segment_ids"])

    def test_insufficient_evidence_for_hallucination(self):
        # A claim completely absent from the source material
        claim = "Quantum computing uses cryogenic qubit gates to break RSA-4096 encryption."
        evidence = extract_claim_evidence(claim, self.segments)
        self.assertEqual(evidence["status"], ProvenanceStatus.INSUFFICIENT_EVIDENCE)
        self.assertEqual(evidence["confidence"], 0.0)
        self.assertEqual(evidence["transcript_segment_ids"], [])

    def test_empty_or_trivial_claim(self):
        claim = "is the and"
        evidence = extract_claim_evidence(claim, self.segments)
        self.assertEqual(evidence["status"], ProvenanceStatus.INSUFFICIENT_EVIDENCE)
        self.assertEqual(evidence["confidence"], 0.0)

if __name__ == "__main__":
    unittest.main()
