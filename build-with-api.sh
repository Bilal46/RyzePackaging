#!/bin/bash

# Build script with API URL configuration
# Usage: ./build-with-api.sh [API_URL]
# Example: ./build-with-api.sh https://api.yourdomain.com/api

echo "🚀 Building with API Configuration..."
echo ""

if [ -z "$1" ]; then
    echo "⚠️  No API URL provided. Using default: http://localhost:3001/api"
    echo ""
    echo "Usage: ./build-with-api.sh [API_URL]"
    echo "Example: ./build-with-api.sh https://api.yourdomain.com/api"
    echo ""
    API_URL="http://localhost:3001/api"
else
    API_URL="$1"
    echo "✅ Using API URL: $API_URL"
    echo ""
fi

# Set environment variable and build
export VITE_API_URL="$API_URL"
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Upload 'dist/' folder contents to cPanel public_html/"
echo "2. Make sure backend API is deployed and running"
echo "3. Test admin panel - changes should sync to frontend"
echo ""
echo "🔗 API URL used: $API_URL"
echo ""

