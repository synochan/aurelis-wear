# Aurelis Wear Backend API

This is the Django REST Framework backend for the Aurelis Wear e-commerce platform.

## Manual Deployment to Vercel

To deploy this Django backend to Vercel, follow these steps:

### Prerequisites
- A Vercel account
- Git repository with your code

### Deployment Steps

1. **Log in to Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Sign in with your account

2. **Create a new project**:
   - Click "Add New..." → "Project"
   - Import your Git repository or select the backend folder

3. **Configure project**:
   - **Name**: `aurelis-wear-api` (or your preferred name)
   - **Framework Preset**: Select "Other" (since we have our custom vercel.json)
   - **Root Directory**: Select the backend folder (if not already at the repository root)

4. **Configure Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `DJANGO_SETTINGS_MODULE`: `backend.settings`
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.vercel.app,aurelis-wear-api.vercel.app,localhost,127.0.0.1`
   - `FRONTEND_URL`: `https://aurelis-wear.vercel.app`
   - `PYTHON_VERSION`: `3.9`

5. **Deploy**:
   - Click "Deploy"
   - Vercel will use the configuration in `vercel.json` to build and deploy your application

## Important Files

- `wsgi.py` - WSGI application entry point for Vercel
- `vercel.json` - Vercel configuration file
- `requirements.txt` - Python dependencies

## Local Development

To run the backend locally:

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run development server
python manage.py runserver
```

## API Endpoints

- `/api/products/` - Product listing and detail
- `/api/categories/` - Product categories
- `/api/auth/` - Authentication endpoints
- `/api/cart/` - Shopping cart operations
- `/api/orders/` - Order management

## Database

The application is configured to use PostgreSQL in production via the `DATABASE_URL` environment variable.
For local development, it can fall back to SQLite.