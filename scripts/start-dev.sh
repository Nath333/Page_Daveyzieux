#!/bin/bash
# Development startup script

echo "🚀 Starting Brico_Dave_Html in development mode..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✓ Created .env file. Please update it with your credentials."
    fi
fi

# Start the development server
echo "✓ Starting server..."
npm start
