#!/bin/bash
set -o errexit

# Debug: Print current directory and list files
echo "Current directory: $(pwd)"
echo "Listing files: $(ls -la)"

# Install dependencies
pip install --upgrade pip

# Try multiple locations for requirements.txt
if [ -f "requirements.txt" ]; then
    echo "Found requirements.txt in current directory"
    pip install -r requirements.txt
elif [ -f "requirements-minimal.txt" ]; then
    echo "Found requirements-minimal.txt in current directory"
    pip install -r requirements-minimal.txt
elif [ -f "backend/requirements.txt" ]; then
    echo "Found requirements.txt in backend/ directory"
    pip install -r backend/requirements.txt
elif [ -f "../requirements.txt" ]; then
    echo "Found requirements.txt in parent directory"
    pip install -r ../requirements.txt
else
    echo "No requirements.txt found. Creating minimal requirements file..."
    cat > requirements.txt << EOL
asgiref==3.8.1
certifi==2024.8.30
dj-database-url==2.3.0
Django==5.2.1
django-cors-headers==4.7.0
django-environ==0.11.2
djangorestframework==3.16.0
djangorestframework-simplejwt==5.3.1
gunicorn==23.0.0
Pillow==10.1.0
psycopg2-binary==2.9.10
python-dotenv==1.1.0
sqlparse==0.5.1
stripe==7.6.0
whitenoise==6.9.0
EOL
    echo "Created minimal requirements file"
    pip install -r requirements.txt
fi

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput 