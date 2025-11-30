#!/bin/bash

echo "=================================="
echo "🌍 One World Backend - Starting..."
echo "=================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    echo "Please check your environment variables in Render."
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

echo "📊 Step 1: Running database migrations..."
node -r dotenv/config src/database/migrate.js
MIGRATE_EXIT=$?
if [ $MIGRATE_EXIT -ne 0 ]; then
    echo "⚠️ Main migration failed (tables might already exist)"
fi
echo ""

echo "⚙️ Step 2: Running settings migrations..."
node -r dotenv/config src/database/migrate-settings.js
SETTINGS_EXIT=$?
if [ $SETTINGS_EXIT -ne 0 ]; then
    echo "⚠️ Settings migration failed (tables might already exist)"
fi
echo ""

echo "🌱 Step 3: Seeding settings..."
node -r dotenv/config src/database/seed-settings.js || echo "⚠️ Settings already seeded"
echo ""

echo "👤 Step 4: Creating admin user..."
node -r dotenv/config src/database/seed-admin.js || echo "⚠️ Admin user already exists"
echo ""

echo "=================================="
echo "✅ Database setup complete!"
echo "🚀 Starting Node.js server..."
echo "=================================="
echo ""
