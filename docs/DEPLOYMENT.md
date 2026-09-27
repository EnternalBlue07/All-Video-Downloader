# MEDIAOS Production Deployment Guide

> **Deploying MEDIAOS on Bare-Metal, Linux VPS, Windows Server, and Docker**  
> *Engineered by **Mohammad Zumaan Sayyed***

---

## 1. Quick Start via Docker Compose (Recommended for Servers)

Docker Compose provides a fully isolated environment with pre-installed FFmpeg, Python 3.11, and Nginx.

### Prerequisites
* Docker Engine 24.0+
* Docker Compose v2+

### Step-by-Step Deployment
```bash
# 1. Clone the repository
git clone https://github.com/MohammadZumaan/mediaos.git
cd mediaos

# 2. Copy the sample environment file
cp .env.example .env

# 3. Build and launch services in detached mode
docker-compose up -d --build

# 4. Monitor live service logs
docker-compose logs -f
```

* **Frontend UI:** `http://<your-server-ip>`
* **Backend API:** `http://<your-server-ip>:8000`
* **API Documentation:** `http://<your-server-ip>:8000/docs`

---

## 2. Bare-Metal Linux Deployment (Ubuntu / Debian)

### 2.1. Install System Dependencies
```bash
sudo apt update && sudo apt install -y python3 python3-pip python3-venv ffmpeg nodejs npm
```

### 2.2. Setup Python Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r mediaos_backend/requirements.txt
```

### 2.3. Build Frontend Assets
```bash
cd mediaos-ui
npm install
npm run build
cd ..
```

### 2.4. Systemd Service Configuration
Create `/etc/systemd/system/mediaos-backend.service`:
```ini
[Unit]
Description=MEDIAOS Backend Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/mediaos
ExecStart=/var/www/mediaos/venv/bin/uvicorn mediaos_backend.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mediaos-backend
```

---

## 3. Windows Native Deployment

### 1-Click Launch:
Simply double-click `start_mediaos.bat` or run:
```powershell
.\start_mediaos.ps1
```

### Manual CLI:
```powershell
# In terminal 1 (Backend)
python -m uvicorn mediaos_backend.main:app --host 127.0.0.1 --port 8000 --reload

# In terminal 2 (Frontend)
cd mediaos-ui
npm run dev
```

---

## 4. Reverse Proxy Setup (Nginx with SSL / HTTPS)

```nginx
server {
    listen 80;
    server_name mediaos.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mediaos.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/mediaos.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mediaos.yourdomain.com/privkey.pem;

    # Frontend Single Page App
    location / {
        root /var/www/mediaos/mediaos-ui/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Proxy
    location /ws/ {
        proxy_pass http://127.0.0.1:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```
