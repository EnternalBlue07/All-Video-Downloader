<#
.SYNOPSIS
    MEDIAOS PowerShell Launcher
    Built by Mohammad Zumaan Sayyed
#>

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   MEDIAOS - Neural Media Intelligence & Operating System" -ForegroundColor Cyan
Write-Host "   Crafted by Mohammad Zumaan Sayyed" -ForegroundColor DarkCyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $ScriptDir

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Python was not found in your PATH." -ForegroundColor Red
    exit 1
}

Write-Host "[*] Executing MediaOS Python orchestrator..." -ForegroundColor Green
python run_mediaos.py
