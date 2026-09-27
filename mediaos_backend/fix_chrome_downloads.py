import json
import urllib.request
import asyncio
import websockets

async def fix_chrome_download_behavior():
    # 1. Get browser websocket url
    res = urllib.request.urlopen("http://127.0.0.1:9222/json/version")
    ver = json.loads(res.read())
    browser_ws = ver["webSocketDebuggerUrl"]
    print(f"Connecting to browser CDP: {browser_ws}")

    user_downloads = r"C:\Users\Mohammad Zumaan\Downloads"

    async with websockets.connect(browser_ws) as ws:
        # Reset Browser download behavior
        # In Chrome, behavior='allowAndName' or 'default'
        msg1 = {
            "id": 1,
            "method": "Browser.setDownloadBehavior",
            "params": {
                "behavior": "allowAndName",
                "downloadPath": user_downloads,
                "events": True
            }
        }
        await ws.send(json.dumps(msg1))
        reply1 = await ws.recv()
        print("Browser.setDownloadBehavior (allowAndName):", reply1)

        # Also get all targets/pages and reset Page.setDownloadBehavior
        msg2 = {"id": 2, "method": "Target.getTargets"}
        await ws.send(json.dumps(msg2))
        reply2 = json.loads(await ws.recv())
        
        for t in reply2.get("result", {}).get("targetInfos", []):
            if t.get("type") == "page":
                page_id = t["targetId"]
                print(f"Resetting download behavior for page: {t.get('title')[:30]} ({page_id})")
                attach_msg = {
                    "id": 10,
                    "method": "Target.attachToTarget",
                    "params": {"targetId": page_id, "flatten": True}
                }
                await ws.send(json.dumps(attach_msg))
                attach_res = json.loads(await ws.recv())
                session_id = attach_res.get("result", {}).get("sessionId")
                if session_id:
                    # Send Page.setDownloadBehavior or Browser.setDownloadBehavior via session
                    cmd = {
                        "id": 20,
                        "sessionId": session_id,
                        "method": "Page.setDownloadBehavior",
                        "params": {
                            "behavior": "allow",
                            "downloadPath": user_downloads
                        }
                    }
                    await ws.send(json.dumps(cmd))
                    cmd_res = await ws.recv()
                    print(f"  Page.setDownloadBehavior: {cmd_res}")

asyncio.run(fix_chrome_download_behavior())
