#!/bin/sh

# Install curl and wait for PocketBase to be ready
apk add --no-cache curl

# Create superuser using PocketBase CLI directly
/pb/pocketbase superuser upsert "${POCKETBASE_ADMIN_EMAIL:-admin@example.com}" "${POCKETBASE_ADMIN_PASSWORD:-password123}" --dir=/pb/pb_data

echo "Waiting for PocketBase to start..."
while ! curl -s http://pocketbase:8080/api/health > /dev/null; do
  sleep 2
done

echo "PocketBase is ready."