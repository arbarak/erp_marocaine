#!/bin/bash

# Test Production Build Script for ERP Marocaine
# This script tests the production build locally before deployment

set -e

echo "🚀 Testing ERP Marocaine Production Build"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Navigate to frontend directory
cd frontend

print_status "Checking Node.js version..."
node_version=$(node --version)
echo "Node.js version: $node_version"

if [[ ! "$node_version" =~ ^v1[8-9]\. ]] && [[ ! "$node_version" =~ ^v[2-9][0-9]\. ]]; then
    print_warning "Node.js version should be 18 or higher for optimal compatibility"
fi

print_status "Installing dependencies..."
npm ci

print_status "Running type check..."
npm run type-check

print_status "Building for production..."
npm run build:prod

print_status "Checking build output..."
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

# Check if essential files exist
essential_files=("dist/index.html" "dist/assets")
for file in "${essential_files[@]}"; do
    if [ ! -e "$file" ]; then
        print_error "Essential file/directory missing: $file"
        exit 1
    fi
done

print_status "Build output size analysis..."
echo "Build directory size:"
du -sh dist/
echo ""
echo "Asset breakdown:"
find dist/assets -name "*.js" -exec ls -lh {} \; | awk '{print $5 "\t" $9}'
echo ""
find dist/assets -name "*.css" -exec ls -lh {} \; | awk '{print $5 "\t" $9}'

print_status "Starting preview server..."
echo "Starting preview server on http://localhost:4173"
echo "Press Ctrl+C to stop the server"
echo ""
print_warning "Please test the following in your browser:"
echo "  1. Navigate to http://localhost:4173"
echo "  2. Check that the app loads correctly"
echo "  3. Test navigation between pages"
echo "  4. Check browser console for errors"
echo "  5. Verify API calls work (if backend is running)"
echo ""

# Start preview server
npm run preview

print_status "Production build test completed!"
echo ""
echo "Next steps for deployment:"
echo "  1. Commit and push your changes to GitHub"
echo "  2. Configure Netlify with your repository"
echo "  3. Set up environment variables in Netlify"
echo "  4. Deploy your backend to Heroku/Railway/etc."
echo "  5. Update VITE_API_URL in Netlify environment variables"
