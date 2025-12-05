#!/bin/bash
# Docker cleanup script

echo "🧹 Cleaning up Docker resources..."

# Stop all containers
echo "Stopping containers..."
docker-compose down

# Remove dangling images
echo "Removing dangling images..."
docker image prune -f

# Remove unused volumes (be careful with this!)
read -p "Remove unused volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker volume prune -f
fi

echo "✓ Cleanup complete!"
