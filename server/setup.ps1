# Warehouse Setup PowerShell Script
Write-Host "🔍 Creating Database..." -ForegroundColor Cyan
Invoke-Expression "psql -U postgres -c 'CREATE DATABASE warehouse_db;'"

Write-Host "📄 Running Schema..." -ForegroundColor Cyan
Invoke-Expression "psql -U postgres -d warehouse_db -f schema.sql"

Write-Host "🌱 Seeding Data..." -ForegroundColor Cyan
& node seed.js

Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
& npm run dev
