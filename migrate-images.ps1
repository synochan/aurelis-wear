# PowerShell script to migrate images to Cloudinary

Write-Host "Installing required packages..." -ForegroundColor Green
cd backend
pip install cloudinary django-cloudinary-storage

Write-Host "Running migration script..." -ForegroundColor Green
python migrate_to_cloudinary.py

Write-Host "Migration completed!" -ForegroundColor Green 