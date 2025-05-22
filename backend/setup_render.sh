#!/bin/bash
set -o errexit

# Script to help diagnose and fix deployment issues on Render

echo "===== Render Setup Helper ====="
echo "Current directory: $(pwd)"
echo "Listing files: $(ls -la)"

# Make sure we have a requirements.txt file
if [ ! -f "requirements.txt" ]; then
    echo "requirements.txt not found in current directory."
    
    # Check if the file exists in a parent or subdirectory
    FOUND_REQ=false
    
    if [ -f "../requirements.txt" ]; then
        echo "Found requirements.txt in parent directory. Copying..."
        cp ../requirements.txt ./
        FOUND_REQ=true
    elif [ -f "backend/requirements.txt" ]; then
        echo "Found requirements.txt in backend/ directory. Copying..."
        cp backend/requirements.txt ./
        FOUND_REQ=true
    fi
    
    # If we couldn't find a requirements file, create a minimal one
    if [ "$FOUND_REQ" = false ]; then
        echo "Creating minimal requirements.txt..."
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
    fi
    
    echo "requirements.txt is now available."
fi

# Make sure essential files are present
for file in wsgi.py settings.py urls.py manage.py; do
    if [ ! -f "$file" ]; then
        echo "$file not found in current directory."
        
        if [ -f "backend/$file" ]; then
            echo "Found $file in backend/ directory. Copying..."
            cp backend/$file ./
        elif [ -f "../$file" ]; then
            echo "Found $file in parent directory. Copying..."
            cp ../$file ./
        else
            echo "ERROR: Could not find $file!"
        fi
    fi
done

# Make sure we can find products and other Django app modules
echo "Setting up Python module structure..."

# Create symbolic links for essential Django app directories
if [ -d "backend/products" ] && [ ! -d "products" ]; then
    echo "Creating symbolic link for products module"
    ln -sf "$(pwd)/backend/products" "$(pwd)/products"
fi

if [ -d "backend/orders" ] && [ ! -d "orders" ]; then
    echo "Creating symbolic link for orders module"
    ln -sf "$(pwd)/backend/orders" "$(pwd)/orders"
fi

if [ -d "backend/cart" ] && [ ! -d "cart" ]; then
    echo "Creating symbolic link for cart module"
    ln -sf "$(pwd)/backend/cart" "$(pwd)/cart"
fi

if [ -d "backend/authentication" ] && [ ! -d "authentication" ]; then
    echo "Creating symbolic link for authentication module"
    ln -sf "$(pwd)/backend/authentication" "$(pwd)/authentication"
fi

if [ -d "backend/payments" ] && [ ! -d "payments" ]; then
    echo "Creating symbolic link for payments module"
    ln -sf "$(pwd)/backend/payments" "$(pwd)/payments"
fi

# Create an empty __init__.py if it doesn't exist to make the directory a Python package
touch __init__.py

# Make sure we have proper permissions
chmod +x build.sh
if [ -f "diagnose.py" ]; then
    chmod +x diagnose.py
fi

if [ -f "manage.py" ]; then
    chmod +x manage.py
fi

echo "Showing final directory structure:"
ls -la

echo "===== Setup completed =====" 