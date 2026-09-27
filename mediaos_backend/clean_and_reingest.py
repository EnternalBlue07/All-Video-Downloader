import sqlite3
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ingest import direct_ingest_media

db_path = os.path.join(os.path.dirname(__file__), "storage", "mediaos.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Remove fake items and previous underdog shit with template text
c.execute("DELETE FROM media WHERE id IN ('med_dist_arch', 'med_react_internals', 'med_jwt_security', 'med_llm_rag', 'med_d0d2486766')")
c.execute("DELETE FROM media_fts WHERE media_id IN ('med_dist_arch', 'med_react_internals', 'med_jwt_security', 'med_llm_rag', 'med_d0d2486766')")
c.execute("DELETE FROM jobs WHERE media_id IN ('med_dist_arch', 'med_react_internals', 'med_jwt_security', 'med_llm_rag', 'med_d0d2486766')")
conn.commit()
conn.close()

print("Purged all template mockup items.")

# Now re-ingest the real YouTube video with true lyrics and captions
print("Ingesting real UNDERDOG SHIT video...")
res = direct_ingest_media("https://youtu.be/v-r0YAtcpVU?si=0P0EGXfqgHSyEtmY")
print("SUCCESS:", res)
