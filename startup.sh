#!/bin/bash

echo "=================================="
echo "🌍 One World Backend - Starting..."
echo "=================================="
echo ""

echo "📊 Step 1: Running database migrations..."
node src/database/migrate.js
if [ $? -eq 0 ]; then
    echo "✅ Main migration successful"
else
    echo "❌ Main migration failed"
    exit 1
fi
echo ""

echo "⚙️ Step 2: Running settings migrations..."
node src/database/migrate-settings.js
if [ $? -eq 0 ]; then
    echo "✅ Settings migration successful"
else
    echo "❌ Settings migration failed"
    exit 1
fi
echo ""

echo "🌱 Step 3: Seeding settings..."
node src/database/seed-settings.js
if [ $? -eq 0 ]; then
    echo "✅ Settings seeded successfully"
else
    echo "⚠️ Settings seeding failed (might already exist)"
fi
echo ""

echo "👤 Step 4: Creating admin user..."
node src/database/seed-admin.js
if [ $? -eq 0 ]; then
    echo "✅ Admin user created"
else
    echo "⚠️ Admin user creation failed (might already exist)"
fi
echo ""

echo "=================================="
echo "✅ Database setup complete!"
echo "🚀 Starting Node.js server..."
echo "=================================="
echo ""

# Start the server
node src/server.js
