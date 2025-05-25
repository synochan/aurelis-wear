# Comprehensive cleanup script for Aurelis Wear codebase

Write-Host "Starting cleanup of Aurelis Wear codebase..." -ForegroundColor Cyan

# Remove Vercel-specific files and directories
Write-Host "Removing Vercel-specific files and directories..." -ForegroundColor Yellow
Remove-Item -Path "backend\.vercel" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend\.vercel-config.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend\.vercelignore" -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".env.vercel" -Force -ErrorAction SilentlyContinue

# Remove redundant API directory (serverless functions no longer needed)
Write-Host "Removing redundant API directory..." -ForegroundColor Yellow
Remove-Item -Path "backend\api" -Recurse -Force -ErrorAction SilentlyContinue

# Remove cache and build artifacts
Write-Host "Removing cache and build files..." -ForegroundColor Yellow
Get-ChildItem -Path "backend" -Filter "__pycache__" -Recurse -Directory | Remove-Item -Recurse -Force
Remove-Item -Path "frontend\.vercel" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "frontend\dist" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Note: 'node_modules' folder was not removed as it's required for development" -ForegroundColor DarkYellow

# Remove SQLite database (since we're using Neon PostgreSQL)
Write-Host "Removing SQLite database..." -ForegroundColor Yellow
Remove-Item -Path "backend\db.sqlite3" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend\*.sqlite3" -Force -ErrorAction SilentlyContinue

# Remove any remaining temp files
Write-Host "Removing temporary files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Include "*.pyc","*.pyo","*.pyd",".DS_Store","*.log" -Recurse -File | Remove-Item -Force

# Remove duplicate configuration files
Write-Host "Removing duplicate configuration files..." -ForegroundColor Yellow
Remove-Item -Path "backend\requirements-minimal.txt" -Force -ErrorAction SilentlyContinue

# Remove diagnose.py as it's not needed for production
Write-Host "Removing diagnostic files..." -ForegroundColor Yellow
Remove-Item -Path "backend\diagnose.py" -Force -ErrorAction SilentlyContinue

Write-Host "Cleanup complete!" -ForegroundColor Green 