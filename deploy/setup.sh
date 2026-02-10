#!/usr/bin/env bash
set -euo pipefail

echo "=== Podcast Manager Setup ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root: sudo bash setup.sh"
  exit 1
fi

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_USER="${APP_USER:-$(logname 2>/dev/null || echo $SUDO_USER)}"
NODE_VERSION="22"

echo "App directory: $APP_DIR"
echo "App user: $APP_USER"
echo ""

# 1. Install system dependencies
echo "--- Installing system dependencies ---"
apt-get update -qq

# Node.js (if not installed)
if ! command -v node &> /dev/null; then
  echo "Installing Node.js $NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y -qq nodejs
fi

# PostgreSQL (if not installed)
if ! command -v psql &> /dev/null; then
  echo "Installing PostgreSQL..."
  apt-get install -y -qq postgresql postgresql-contrib
fi

# Nginx (if not installed)
if ! command -v nginx &> /dev/null; then
  echo "Installing nginx..."
  apt-get install -y -qq nginx
fi

echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "psql: $(psql --version)"
echo ""

# 2. Start and configure PostgreSQL
echo "--- Configuring PostgreSQL ---"
systemctl enable postgresql
systemctl start postgresql

# Create database and user if they don't exist
su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='poduser'\" | grep -q 1" || \
  su - postgres -c "psql -c \"CREATE ROLE poduser WITH LOGIN PASSWORD 'podpass' CREATEDB;\""

su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='podcast_manager'\" | grep -q 1" || \
  su - postgres -c "psql -c \"CREATE DATABASE podcast_manager OWNER poduser;\""

echo "Database ready."
echo ""

# 3. Create .env if it doesn't exist
ENV_FILE="$APP_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "--- Creating .env ---"
  cat > "$ENV_FILE" <<EOF
DATABASE_URL="postgresql://poduser:podpass@localhost:5432/podcast_manager"
PORT=3000
UPLOAD_DIR=$APP_DIR/server/uploads
NODE_ENV=production
EOF
  chown "$APP_USER":"$APP_USER" "$ENV_FILE"
fi

# 4. Install npm dependencies
echo "--- Installing dependencies ---"
cd "$APP_DIR"
sudo -u "$APP_USER" npm install --omit=dev 2>&1 | tail -5
echo ""

# 5. Run Prisma migrations
echo "--- Running database migrations ---"
cd "$APP_DIR/server"
sudo -u "$APP_USER" npx prisma migrate deploy
echo ""

# 6. Build server
echo "--- Building server ---"
cd "$APP_DIR/server"
sudo -u "$APP_USER" npx tsc
echo ""

# 7. Build client (base path is set in vite.config.ts)
echo "--- Building client ---"
cd "$APP_DIR/client"
sudo -u "$APP_USER" npx vite build
echo ""

# 8. Create upload directories
echo "--- Creating upload directories ---"
mkdir -p "$APP_DIR/server/uploads/audio" "$APP_DIR/server/uploads/images"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR/server/uploads"
echo ""

# 9. Configure nginx (adds to existing server, doesn't replace)
echo "--- Configuring nginx ---"
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/podmanager
ln -sf /etc/nginx/sites-available/podmanager /etc/nginx/sites-enabled/podmanager
nginx -t && systemctl reload nginx
echo ""

# 10. Configure systemd service
echo "--- Configuring systemd service ---"
NODEJS_PATH=$(which node)
sed "s|__APP_DIR__|$APP_DIR|g; s|__APP_USER__|$APP_USER|g; s|__NODE_PATH__|$NODEJS_PATH|g" \
  "$APP_DIR/deploy/podmanager.service.template" > /etc/systemd/system/podmanager.service
systemctl daemon-reload
systemctl enable podmanager
systemctl restart podmanager
echo ""

echo "=== Setup Complete ==="
echo "The application should be running at http://your-domain/projects/podcast/"
echo ""
echo "Useful commands:"
echo "  systemctl status podmanager    - Check API status"
echo "  journalctl -u podmanager -f    - View API logs"
echo "  systemctl restart podmanager   - Restart API"
