import sqlite3

conn = sqlite3.connect("storage/mediaos.db")
c = conn.cursor()
c.execute("DELETE FROM media WHERE id != 'med_126754fa94'")
c.execute("DELETE FROM media_fts WHERE media_id != 'med_126754fa94'")
conn.commit()
conn.close()
print("Cleaned up media table, kept med_126754fa94 with real downloaded MP4 file.")
