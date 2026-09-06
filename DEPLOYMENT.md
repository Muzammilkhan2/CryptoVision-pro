# 🚀 CryptoVision Pro - Deployment Guide

## Prerequisites

- A VPS or cloud server (Ubuntu 22.04+ recommended) with at least 2GB RAM and 2 CPUs
- Docker Engine >= 24 and Docker Compose >= 2 installed
- A domain name pointing to your server's IP
- GitHub repository with this project

---

## Option 1: Docker Compose on a VPS (Recommended for Full Control)

### 1. Prepare Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker

# Install Docker Compose
sudo apt install docker-compose-plugin -y
```

### 2. Clone the Repository

```bash
git clone https://github.com/<your-username>/cryptovision-pro.git
cd cryptovision-pro
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env
```

Update these values in `.env`:

```bash
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://postgres:your_secure_password_here@postgres:5432/cryptovision?schema=public

REDIS_PASSWORD=your_redis_password_here
REDIS_URL=redis://:your_redis_password_here@redis:6379

JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

IMAGE_TAG=latest
CADDY_DOMAIN=yourdomain.com

# Optional third-party API keys
COINGECKO_API_KEY=
ETHERSCAN_API_KEY=
WHALE_ALERT_API_KEY=
```

### 4. Run Database Migrations

```bash
# Start only database services first
docker compose -f infra/docker/docker-compose.prod.yml up -d postgres redis

# Wait 10 seconds for DB to be ready
sleep 10

# Run migrations
docker compose -f infra/docker/docker-compose.prod.yml run --rm api npx prisma migrate deploy
```

### 5. Deploy All Services

```bash
docker compose -f infra/docker/docker-compose.prod.yml up -d
```

### 6. Verify Deployment

```bash
# Check all containers are running
docker compose -f infra/docker/docker-compose.prod.yml ps

# Test API health
curl https://yourdomain.com/api/v1/health

# View logs if needed
docker compose -f infra/docker/docker-compose.prod.yml logs -f api
docker compose -f infra/docker/docker-compose.prod.yml logs -f web
```

---

## Option 2: Fly.io (Managed Container Platform)

### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. Launch the App

```bash
cd cryptovision-pro
fly launch
```

Follow the prompts. Fly will detect the Dockerfiles and create:
- A PostgreSQL cluster
- A Redis instance
- App instances for API and Web

### 3. Set Secrets

```bash
fly secrets set \
  JWT_ACCESS_SECRET=your_access_secret \
  JWT_REFRESH_SECRET=your_refresh_secret \
  COINGECKO_API_KEY=your_key \
  DATABASE_URL=$(fly postgres attach -a cryptovision-pro-api cryptovision-pro-db) \
  REDIS_URL=$(fly redis attach -a cryptovision-pro-api cryptovision-pro-redis)
```

### 4. Deploy

```bash
fly deploy
```

---

## Option 3: Render.com (Full-Stack Platform)

### 1. Push to GitHub

Ensure your project is on GitHub (already done).

### 2. Create Services on Render

- **PostgreSQL**: New → PostgreSQL → name: `cryptovision-db`
- **Redis**: New → Redis → name: `cryptovision-redis`
- **Web Service (API)**: New → Web Service → connect repo → Build Command: `npm run build --workspace=apps/api` → Start Command: `npm run start:prod --workspace=apps/api`
- **Static Site (Web)**: New → Static Site → Build Command: `npm run build --workspace=apps/web` → Publish Directory: `apps/web/dist`

### 3. Set Environment Variables

For each service, add the required env vars from `.env.example`.

---

## Option 4: GitHub Actions CI/CD (Already Configured)

The repository includes `.github/workflows/ci.yml` which:

1. Runs lint and tests on every PR
2. Builds Docker images for API and Web
3. Pushes images to GitHub Container Registry (GHCR)
4. Deploys via SSH to your server on push to `main`

### Required GitHub Secrets

Go to **Repository Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|---|---|
| `DEPLOY_HOST` | Your server IP or domain |
| `DEPLOY_USER` | SSH user (e.g., `ubuntu`) |
| `DEPLOY_SSH_KEY` | Private SSH key for server access |
| `DEPLOY_PORT` | SSH port (default: `22`) |
| `DEPLOY_ENV_BASE64` | Base64-encoded `.env` file content for production |

---

## Post-Deployment Checklist

- [ ] SSL certificate is valid (HTTPS working)
- [ ] `/api/v1/health` returns `{"status":"ok"}`
- [ ] Frontend loads at your domain
- [ ] Database migrations applied
- [ ] Redis connection working
- [ ] WebSocket connections establish (check browser DevTools → Network → WS)
- [ ] Error tracking (Sentry) configured if applicable
- [ ] Backups configured for PostgreSQL
- [ ] Firewall allows only ports 22, 80, 443

---

## Updating the Deployment

### Docker Compose (Option 1)

```bash
cd /opt/cryptovision-pro
git pull origin main
docker compose -f infra/docker/docker-compose.prod.yml up -d --build
```

### Fly.io (Option 2)

```bash
fly deploy
```

### Render (Option 3)

Render auto-deploys on push to `main`.

---

## Troubleshooting

### Container won't start
```bash
docker compose -f infra/docker/docker-compose.prod.yml logs <service-name>
```

### Database connection errors
Verify `DATABASE_URL` matches the Docker service name (`postgres`) and credentials.

### Redis connection errors
Verify `REDIS_URL` includes the password: `redis://:password@redis:6379`

### Prisma migration fails
Ensure the database container is healthy before running migrations:
```bash
docker compose -f infra/docker/docker-compose.prod.yml ps postgres
```

---

## Security Notes

- Never commit `.env` to version control
- Use strong, unique secrets for JWT and database passwords
- Restrict database and Redis ports to `127.0.0.1` in production
- Keep Docker images updated regularly
- Enable firewall (UFW/iptables) on your VPS
