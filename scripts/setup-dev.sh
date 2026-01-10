#!/bin/bash

# Sallie Development Setup Script
echo "🚀 Setting up Sallie Development Environment..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.11+ required"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ required"
    exit 1
fi

# Setup Python environment
echo "📦 Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend
echo "🌐 Setting up frontend..."
cd web
npm install
cd ..

# Setup mobile
echo "📱 Setting up mobile..."
cd mobile/android
./gradlew build
cd ../..

# Setup environment
echo "⚙️ Configuring environment..."
cp .env.example .env
echo "✅ Please edit .env with your API keys"

# Start services
echo "🔥 Starting development services..."
docker-compose up -d postgres redis

echo "✅ Development environment ready!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8742"
echo "📊 API Docs: http://localhost:8742/docs"
