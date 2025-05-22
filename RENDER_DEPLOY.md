# Deploying to Render

This document guides you through deploying the Aurelis Wear Shop backend on Render.com and the frontend on Vercel.

## Backend Deployment on Render

### Prerequisites
- A [Render account](https://render.com/register)
- Your project code in a Git repository

### Deployment Steps

#### Option 1: Deploy using render.yaml (Infrastructure as Code)

1. Login to [Render Dashboard](https://dashboard.render.com/)
2. Click on "New" and select "Blueprint"
3. Connect your Git repository
4. Render will automatically detect the `render.yaml` file and configure your services
5. Review the settings and click "Apply"
6. Wait for the deployment to complete

#### Option 2: Manual Setup

1. Login to [Render Dashboard](https://dashboard.render.com/)
2. Create a PostgreSQL Database:
   - Click on "New" and select "PostgreSQL"
   - Name your database (e.g., "aurelis-db")
   - Choose the Free plan for development or a paid plan for production
   - Click "Create Database"
   - Save the "Internal Database URL" for later use

3. Create a Web Service:
   - Click on "New" and select "Web Service"
   - Connect your Git repository
   - Give the service a name (e.g., "aurelis-backend")
   - Set the Root Directory to "backend"
   - Set the Build Command to `pip install -r requirements.txt`
   - Set the Start Command to `gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT`
   - Select a Free or paid instance type
   - Click "Create Web Service"

4. Configure Environment Variables:
   - In your web service, go to "Environment" tab
   - Add the following environment variables:
     - `DATABASE_URL`: Copy the Internal Database URL from your PostgreSQL instance
     - `SECRET_KEY`: Generate a secure random string
     - `DEBUG`: Set to "False"
     - `ALLOWED_HOSTS`: Set to ".onrender.com,localhost,127.0.0.1"
     - `CORS_ALLOWED_ORIGINS`: Set to your frontend URL (e.g., "https://aurelis-wear-shop.vercel.app")

5. Initial Database Setup:
   - Go to the "Shell" tab in your web service
   - Run migrations:
     ```
     python manage.py migrate
     ```
   - Create a superuser (optional):
     ```
     python manage.py createsuperuser
     ```

## Frontend Deployment on Vercel

### Prerequisites
- A [Vercel account](https://vercel.com/signup)

### Deployment Steps

1. Login to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - Root Directory: `./` (project root)
   - Framework Preset: `Vite`
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

5. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL (e.g., "https://aurelis-backend.onrender.com")

6. Click "Deploy"

## Connecting Frontend to Backend

1. Ensure your backend's CORS settings in `settings.py` include your frontend domain
2. Make sure all API requests from the frontend include the correct base URL
3. Update frontend environment variables to point to the backend

## Testing Your Deployment

1. Visit your frontend URL on Vercel
2. Try accessing the API endpoints on your Render backend
3. Test authentication, product browsing, and cart functionality

## Troubleshooting

### Backend Issues
- Check Render logs for any errors
- Verify environment variables are properly set
- Make sure database migrations were applied
- Test the API directly using a tool like Postman

### Frontend Issues
- Check browser console for API connection errors
- Verify environment variables in Vercel
- Check CORS errors in browser network tab

## Production Considerations

1. **Database Backups**: Set up regular database backups
2. **Scaling**: Monitor performance and scale as needed
3. **SSL**: Ensure SSL is enabled for both frontend and backend
4. **Monitoring**: Set up monitoring for both services
5. **Custom Domain**: Configure custom domains for both services 