#!/bin/sh

# Docker entrypoint script for React frontend
# This script handles environment variable injection and nginx startup

set -e

# Default values
API_URL=${API_URL:-"http://localhost:8000"}
APP_ENV=${APP_ENV:-"production"}
APP_VERSION=${APP_VERSION:-"1.0.0"}

echo "Starting ERP Frontend..."
echo "Environment: $APP_ENV"
echo "API URL: $API_URL"
echo "Version: $APP_VERSION"

# Create runtime configuration file
cat > /usr/share/nginx/html/config.js << EOF
window.ENV = {
  API_URL: '$API_URL',
  APP_ENV: '$APP_ENV',
  APP_VERSION: '$APP_VERSION',
  FEATURES: {
    AI_ML: true,
    ANALYTICS: true,
    STREAMING: true,
    GOVERNANCE: true
  }
};
EOF

echo "Runtime configuration created"

# Test nginx configuration
nginx -t

echo "Nginx configuration is valid"

# Start nginx
exec "$@"
