#!/bin/bash
# Health check script for the application

HOST="${1:-localhost}"
PORT="${2:-3001}"

echo "🏥 Checking application health at $HOST:$PORT..."

# Check main health endpoint
echo "Checking /health endpoint..."
curl -s "http://$HOST:$PORT/health" | jq '.' || echo "❌ Health endpoint failed"

# Check API endpoints
echo -e "\nChecking /api/weather endpoint..."
curl -s "http://$HOST:$PORT/api/weather" > /dev/null && echo "✓ Weather API responding" || echo "❌ Weather API failed"

echo -e "\nChecking /api/air-quality endpoint..."
curl -s "http://$HOST:$PORT/api/air-quality" > /dev/null && echo "✓ Air Quality API responding" || echo "❌ Air Quality API failed"

echo -e "\nChecking /api/izit/status endpoint..."
curl -s "http://$HOST:$PORT/api/izit/status" > /dev/null && echo "✓ IZIT API responding" || echo "❌ IZIT API failed"

echo -e "\n✓ Health check complete!"
