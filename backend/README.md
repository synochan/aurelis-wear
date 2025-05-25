# Aurelis Wear API

This is the backend API for the Aurelis Wear e-commerce platform built with Django REST Framework.

## Tech Stack

- Django 4.2+
- Django REST Framework
- PostgreSQL (Neon)
- JWT Authentication

## Local Development Setup

1. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Make sure your `.env` file is properly set up (see `.env.example` for required variables)

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

7. Access the API at: http://localhost:8000/api/

## Migrating Data from SQLite to Neon PostgreSQL

If you have existing data in a SQLite database that you need to migrate to Neon:

1. Make sure your SQLite database file exists and contains your data
2. Configure your `.env` file with the Neon PostgreSQL connection string
3. Run the migration script:
   ```bash
   python migrate_to_neon.py
   ```
4. Once migration is complete, you can safely delete the SQLite database file

## Deploying to Render

### Method 1: Manual Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - **Name**: aurelis-wear-api
   - **Environment**: Python
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn backend.wsgi:application`

4. Add the following environment variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `SECRET_KEY`: A secure random string
   - `DEBUG`: false
   - `ALLOWED_HOSTS`: `.onrender.com,aurelis-wear-api.onrender.com`
   - `PYTHON_VERSION`: 3.11.7
   - `FRONTEND_URL`: https://aurelis-wear.vercel.app

5. Deploy the service

### Method 2: Using render.yaml Blueprint

1. Make sure your repository has the `render.yaml` file (already included)
2. Go to the Render Dashboard → "Blueprint" section
3. Click "New Blueprint Instance"
4. Connect your GitHub repository
5. Configure environment variables as needed
6. Deploy the blueprint

### Important Files for Render Deployment

- `build.sh`: Script that Render runs during the build process
- `Procfile`: Tells Render how to run the application
- `render.yaml`: Blueprint configuration for deployment
- `requirements.txt`: Lists required Python packages
- `runtime.txt`: Specifies Python version

### After Deployment

1. Verify the API is working by visiting: https://aurelis-wear-api.onrender.com/api/
2. Update your frontend to connect to the new API endpoint
3. Test the complete flow of your application

## API Documentation

The API provides the following endpoints:

- `/api/products/` - Product listing and details
- `/api/auth/` - Authentication endpoints (register, login, etc.)
- `/api/cart/` - Shopping cart management
- `/api/orders/` - Order processing and history
- `/api/payments/` - Payment processing (if using)

## Security Notes

- Ensure all sensitive information is stored in environment variables, not in code
- The PostgreSQL connection string includes your database password, keep it secure
- Review CORS settings to ensure only trusted origins can access your API
- Set DEBUG=False in production to avoid leaking sensitive information