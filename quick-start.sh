#!/bin/bash

# AICOO Remix App - Quick Start Script

echo "🚀 AICOO Shopify Remix App - Quick Start"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your credentials."
        echo ""
    fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing root dependencies..."
    npm install
    echo ""
fi

# Build frontend
echo "🏗️  Building frontend..."
npm run build:frontend
echo ""

# Build Remix
echo "🏗️  Building Remix app..."
npm run build:remix
echo ""

# Copy frontend to public
echo "📁 Copying frontend assets to public..."
npm run copy:frontend
echo ""

# Start server
echo "✅ Build complete! Starting server..."
echo "🌐 App will be available at: http://localhost:8080/app"
echo ""
npm start
