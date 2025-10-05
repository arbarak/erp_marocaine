#!/bin/bash

# Quick setup script for DigitalOcean deployment
# This script helps you prepare the necessary configuration

set -e

echo "🌊 DigitalOcean Deployment Setup for ERP Marocaine"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f ".do/app.yaml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Checking DigitalOcean configuration files..."

# Check required files
files_to_check=(
    ".do/app.yaml"
    "backend/config/settings/digitalocean.py"
    "backend/requirements.txt"
    "backend/deploy.sh"
    "DIGITALOCEAN_DEPLOYMENT.md"
)

all_files_exist=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found: $file"
    else
        print_error "Missing: $file"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    print_error "Some required files are missing. Please ensure all DigitalOcean configuration files are present."
    exit 1
fi

print_status "All DigitalOcean configuration files are present!"

echo ""
print_info "🔧 Next Steps for DigitalOcean Deployment:"
echo ""

echo "1. 🌊 Create DigitalOcean App:"
echo "   - Go to https://cloud.digitalocean.com/apps"
echo "   - Click 'Create App'"
echo "   - Choose 'GitHub' as source"
echo "   - Select repository: erp_marocaine"
echo "   - Set source directory: backend"
echo "   - Choose region: Frankfurt (for Europe)"

echo ""
echo "2. 📝 Set Environment Variables:"
echo "   Copy these variables to DigitalOcean App settings:"
echo ""
echo "   DJANGO_SETTINGS_MODULE=config.settings.digitalocean"
echo "   SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(50))')"
echo "   DEBUG=False"
echo "   PYTHONPATH=/app"
echo "   PYTHONUNBUFFERED=1"

echo ""
print_warning "3. 🌐 Update CORS Settings:"
echo "   After getting your DigitalOcean URL, update these variables:"
echo "   CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app"
echo "   CSRF_TRUSTED_ORIGINS=https://your-frontend.netlify.app"

echo ""
echo "4. 🗄️ Add PostgreSQL Database:"
echo "   - In DigitalOcean App settings, add PostgreSQL database"
echo "   - Choose 'Basic' plan (\$7/month)"
echo "   - DigitalOcean will provide DATABASE_URL automatically"

echo ""
echo "5. 🚀 Deploy and Test:"
echo "   - Click 'Create Resources' to deploy"
echo "   - Monitor build logs for any issues"
echo "   - Test API at: https://your-app.ondigitalocean.app/api/health/"

echo ""
echo "6. 🔗 Update Netlify Frontend:"
echo "   Update Netlify environment variable:"
echo "   VITE_API_URL=https://your-app.ondigitalocean.app"

echo ""
print_info "💰 Estimated Monthly Cost:"
echo "   - DigitalOcean App (Basic): ~\$5/month"
echo "   - PostgreSQL (Basic): ~\$7/month"
echo "   - Total: ~\$12/month"

echo ""
print_info "📖 For detailed instructions, see: DIGITALOCEAN_DEPLOYMENT.md"

echo ""
print_status "Setup check complete! You're ready to deploy to DigitalOcean! 🚀"
