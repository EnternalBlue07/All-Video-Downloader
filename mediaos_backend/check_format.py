import subprocess
import json

p = r'D:\yt-dlp\mediaos_backend\downloads\test_avc.mp4'
cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', p]
out = subprocess.check_output(cmd).decode()
d = json.loads(out)
for s in d.get('streams', []):
    print("STREAM:", s.get('codec_type'), "CODEC:", s.get('codec_name'), "RES:", f"{s.get('width')}x{s.get('height')}", "FPS:", s.get('r_frame_rate'))
print("FORMAT NAME:", d.get('format', {}).get('format_name'))
print("CONTAINER:", d.get('format', {}).get('format_long_name'))
print("SIZE:", d.get('format', {}).get('size'))
