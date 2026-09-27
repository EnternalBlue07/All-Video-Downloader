"""
Unit tests for MEDIAOS Output Verification Engine
"""

import sys
import os
import unittest
import tempfile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "mediaos_backend")))
from verifier import verify_output_asset, find_ffprobe_binary

class TestOutputVerifier(unittest.TestCase):

    def test_missing_file_rejection(self):
        result = verify_output_asset(
            file_path="non_existent_file_path_12345.mp4",
            asset_id="test_missing",
            min_bytes=1000
        )
        self.assertFalse(result["verified"])
        self.assertIn("File not found", result["error"])

    def test_sub_threshold_empty_file_rejection(self):
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tf:
            tf.write(b"too small")
            temp_path = tf.name

        try:
            result = verify_output_asset(
                file_path=temp_path,
                asset_id="test_small",
                min_bytes=10000
            )
            self.assertFalse(result["verified"])
            self.assertIn("below minimum allowable threshold", result["error"])
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_ffprobe_discovery(self):
        binary = find_ffprobe_binary()
        self.assertTrue(len(binary) > 0)

if __name__ == "__main__":
    unittest.main()
