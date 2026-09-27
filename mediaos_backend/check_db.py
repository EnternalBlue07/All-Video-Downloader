import sqlite3
import json

conn = sqlite3.connect("storage/mediaos.db")
c = conn.cursor()
c.execute("SELECT id, title, creator, summary, topics, transcript FROM media")
for row in c.fetchall():
    print(f"ID: {row[0]}")
    print(f"TITLE: {row[1].encode('ascii', 'ignore').decode()}")
    print(f"CREATOR: {row[2].encode('ascii', 'ignore').decode()}")
    print(f"SUMMARY: {row[3].encode('ascii', 'ignore').decode()}")
    print(f"TOPICS: {row[4]}")
    trans = json.loads(row[5])
    print("TRANSCRIPT COUNT:", len(trans))
    if trans:
        print("SAMPLE LINE:", trans[0]['timestamp'], trans[0]['text'].encode('ascii', 'ignore').decode())

