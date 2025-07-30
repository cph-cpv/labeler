#!/bin/sh

# Create superuser if it doesn't exist (only runs on first startup)
if [ ! -f /pb/pb_data/data.db ]; then
    echo "Creating superuser..."
    if ! /pb/pocketbase superuser upsert "admin@example.com" "password123" --dir=/pb/pb_data; then
        echo "ERROR: Failed to create superuser. Check admin email/password format and permissions."
    fi
fi

# Start PocketBase
exec /pb/pocketbase serve --http=0.0.0.0:8080 --dir=/pb/pb_data