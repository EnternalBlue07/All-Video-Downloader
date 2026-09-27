#!/usr/bin/env python3
"""
==============================================================================
   MEDIAOS UNIFIED LAUNCH ORCHESTRATOR
   The Autonomous AI Media Intelligence & Transcoding Operating System
   Built by Mohammad Zumaan Sayyed
==============================================================================
"""

import os
import sys
import time
import socket
import signal
import shutil
import webbrowser
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "mediaos_backend"
UI_DIR = ROOT_DIR / "mediaos-ui"

BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 8000
UI_PORT = 5173

# Color palette for modern terminal UX
class C:
    CYAN = "\033[96m"
    MAGENTA = "\033[95m"
    BLUE = "\033[94m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

BANNER = f"""{C.CYAN}{C.BOLD}
  ███╗   ███╗███████╗██████╗ ██╗ █████╗  ██████╗ ███████╗
  ████╗ ████║██╔════╝██╔══██╗██║██╔══██╗██╔═══██╗██╔════╝
  ██╔████╔██║█████╗  ██║  ██║██║███████║██║   ██║███████╗
  ██║╚██╔╝██║██╔══╝  ██║  ██║██║██╔══██║██║   ██║╚════██║
  ██║ ╚═╝ ██║███████╗██████╔╝██║██║  ██║╚██████╔╝███████║
  ╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
{C.RESET}{C.MAGENTA}  Neural Media Intelligence, Semantic Search & Clip Studio{C.RESET}
{C.DIM}  Architected & Crafted by {C.BOLD}Mohammad Zumaan Sayyed{C.RESET}
"""

# Ensure UTF-8 output on Windows terminals
if sys.platform.startswith("win"):
    try:
        if sys.stdout.encoding.lower() != "utf-8":
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def print_step(title: str):
    print(f"\n{C.BLUE}[*]{C.RESET} {C.BOLD}{title}{C.RESET}")

def print_success(msg: str):
    mark = "✓" if sys.stdout.encoding and "utf" in sys.stdout.encoding.lower() else "[OK]"
    print(f" {C.GREEN}{mark}{C.RESET} {msg}")

def print_warn(msg: str):
    print(f" {C.YELLOW}[!]{C.RESET} {msg}")

def print_error(msg: str):
    mark = "✗" if sys.stdout.encoding and "utf" in sys.stdout.encoding.lower() else "[ERR]"
    print(f" {C.RED}{mark}{C.RESET} {msg}")


def check_port(host: str, port: int) -> bool:
    """Returns True if the port is in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def run_preflight_checks():
    print_step("Running Pre-flight Environment Checks...")
    
    # 1. Python version
    py_ver = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    if sys.version_info >= (3, 9):
        print_success(f"Python Runtime: {py_ver} (compatible)")
    else:
        print_error(f"Python {py_ver} is too old. MEDIAOS requires Python 3.9+")
        sys.exit(1)
        
    # 2. Node & NPM
    node_bin = shutil.which("node")
    npm_bin = shutil.which("npm")
    if node_bin and npm_bin:
        print_success(f"Node.js Runtime: {node_bin}")
        print_success(f"NPM Package Manager: {npm_bin}")
    else:
        print_warn("Node.js / NPM not found on PATH. Frontend will need to be started manually.")

    # 3. FFmpeg
    ffmpeg_bin = shutil.which("ffmpeg")
    if ffmpeg_bin:
        print_success(f"FFmpeg Transcoder: {ffmpeg_bin}")
    else:
        print_warn("FFmpeg not detected on PATH. Ingestion will fall back to container-level processing.")

    # 4. yt-dlp core
    try:
        sys.path.insert(0, str(ROOT_DIR))
        import yt_dlp
        print_success(f"yt-dlp Core Engine: Loaded ({getattr(yt_dlp, '__version__', 'internal')})")
    except Exception as e:
        print_warn(f"Failed to import internal yt_dlp core: {e}")

    # 5. Database Initialization
    try:
        sys.path.insert(0, str(BACKEND_DIR))
        from db import init_db
        init_db()
        print_success("SQLite Database & WAL Storage: Ready & Verified")
    except Exception as e:
        print_error(f"Failed to initialize database: {e}")
        sys.exit(1)

def main():
    # Setup ANSI colors for Windows cmd/powershell
    if os.name == "nt":
        os.system("color")

    print(BANNER)
    run_preflight_checks()

    # Check port conflicts
    if check_port(BACKEND_HOST, BACKEND_PORT):
        print_warn(f"Port {BACKEND_PORT} is already busy. An instance of MediaOS backend may already be running.")
    if check_port("localhost", UI_PORT):
        print_warn(f"Port {UI_PORT} is already busy. Vite dev server or another app is listening.")

    print_step("Launching MEDIAOS Ecosystem Services...")

    processes = []

    try:
        # Start Backend (FastAPI via Uvicorn)
        print(f" {C.CYAN}→{C.RESET} Starting Backend API on http://{BACKEND_HOST}:{BACKEND_PORT}...")
        backend_cmd = [
            sys.executable,
            "-m", "uvicorn",
            "mediaos_backend.main:app",
            "--host", BACKEND_HOST,
            "--port", str(BACKEND_PORT),
            "--reload"
        ]
        
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=str(ROOT_DIR),
            env=os.environ.copy()
        )
        processes.append(("Backend", backend_proc))
        print_success("Backend Service spawned in background.")

        # Start Frontend (Vite)
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        if shutil.which(npm_cmd):
            print(f" {C.CYAN}→{C.RESET} Starting Frontend UI on http://localhost:{UI_PORT}...")
            frontend_proc = subprocess.Popen(
                [npm_cmd, "run", "dev"],
                cwd=str(UI_DIR),
                env=os.environ.copy()
            )
            processes.append(("Frontend UI", frontend_proc))
            print_success("Frontend UI Service spawned in background.")
        else:
            print_warn("Skipping automatic frontend start (npm not found).")

        # Wait briefly for services to spin up
        time.sleep(2.5)

        # Open browser
        target_url = f"http://localhost:{UI_PORT}"
        print(f"\n{C.GREEN}{C.BOLD}🚀 MEDIAOS is live!{C.RESET}")
        print(f"   • Frontend UI:    {C.CYAN}{target_url}{C.RESET}")
        print(f"   • Backend API:    {C.CYAN}http://{BACKEND_HOST}:{BACKEND_PORT}{C.RESET}")
        print(f"   • Interactive API:{C.CYAN}http://{BACKEND_HOST}:{BACKEND_PORT}/docs{C.RESET}")
        print(f"\n{C.DIM}Press Ctrl+C at any time to cleanly stop all services.{C.RESET}\n")

        try:
            webbrowser.open(target_url)
        except Exception:
            pass

        # Supervise child processes
        while True:
            for name, proc in processes:
                poll = proc.poll()
                if poll is not None:
                    print_error(f"{name} exited unexpectedly with code {poll}!")
                    return
            time.sleep(1)

    except KeyboardInterrupt:
        print(f"\n\n{C.YELLOW}[!] Shutting down MEDIAOS services gracefully...{C.RESET}")
        for name, proc in processes:
            try:
                print(f"   • Terminating {name} (PID: {proc.pid})...")
                proc.terminate()
                proc.wait(timeout=3)
            except Exception:
                proc.kill()
        print(f"{C.GREEN}✓ All services stopped cleanly. Goodbye!{C.RESET}\n")

if __name__ == "__main__":
    main()
