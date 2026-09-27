#!/usr/bin/env bash
# ==============================================================================
# MEDIAOS Bash Launcher for Linux / macOS
# Built by Mohammad Zumaan Sayyed
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo -e "\033[1;36m======================================================================\033[0m"
echo -e "\033[1;36m   MEDIAOS - Neural Media Intelligence & Operating System\033[0m"
echo -e "\033[0;36m   Crafted by Mohammad Zumaan Sayyed\033[0m"
echo -e "\033[1;36m======================================================================\033[0m"
echo ""

if ! command -v python3 &> /dev/null; then
    echo -e "\033[1;31m[ERROR] python3 is not installed or not in your PATH.\033[0m"
    exit 1
fi

python3 run_mediaos.py
