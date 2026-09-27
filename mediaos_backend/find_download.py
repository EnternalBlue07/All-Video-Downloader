import sqlite3
import os
import shutil

base = os.path.expanduser('~\\AppData\\Local\\Google\\Chrome\\User Data')
for p in os.listdir(base):
    hp = os.path.join(base, p, 'History')
    if os.path.exists(hp):
        try:
            shutil.copy2(hp, 'temp_hist')
            conn = sqlite3.connect('temp_hist')
            c = conn.cursor()
            c.execute("SELECT target_path, tab_url, mime_type, total_bytes FROM downloads ORDER BY start_time DESC LIMIT 2")
            rows = c.fetchall()
            if rows:
                print(f"PROFILE {p}:", rows)
            conn.close()
            if os.path.exists('temp_hist'):
                os.remove('temp_hist')
        except Exception as e:
            pass
