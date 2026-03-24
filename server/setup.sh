# Warehouse Setup Script

echo "🔍 Creating Database..."
psql -U postgres -c "CREATE DATABASE warehouse_db;"

echo "📄 Running Schema..."
psql -U postgres -d warehouse_db -f schema.sql

echo "🌱 Seeding Data..."
node seed.js

echo "🚀 Starting Backend Server..."
npm run dev
