# Deploying Aurelis Wear Shop to Vercel

This guide provides instructions for deploying both the frontend and backend of the Aurelis Wear Shop application to Vercel with a Neon PostgreSQL database.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your project code in a Git repository
- [Git](https://git-scm.com/downloads) installed on your local machine
- A Neon PostgreSQL database

## Database Setup with Neon

1. Sign up for a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Create a new database named `aurelis`
4. Get your connection string from the dashboard in the format:
   ```
   postgresql://user:password@endpoint.neon.tech/aurelis?sslmode=require
   ```
5. This connection string will be used as the `DATABASE_URL` environment variable in Vercel

## Deployment Steps

### 1. Prepare Your Project

Make sure your project is ready for deployment:
- All changes are committed to your Git repository
- Frontend and backend are properly configured

### 2. Deploy to Vercel

#### Using Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the project:
   ```
   vercel
   ```

4. Follow the prompts to configure your project

#### Using Vercel Dashboard

1. Login to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: Custom (No Framework)
   - Root Directory: `./` (project root)
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

5. Add Environment Variables:
   - `DATABASE_URL`: Your Neon database connection string
   - `SECRET_KEY`: A secure random string for Django
   - `DEBUG`: Set to "False" for production
   - `DJANGO_ALLOWED_HOSTS`: Add your Vercel domain (e.g., ".vercel.app")
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (if using payment processing)
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (if using payment processing)

6. Click "Deploy"

## Automatic Database Setup

The project is configured to automatically:

1. Run Django migrations to create database schema
2. Create an admin user (username: `admin`, password: `admin123`)
3. Load sample product data if the database is empty

This is done through scripts that run during deployment and on the first function invocation.

## Project Structure

The project is set up to deploy both frontend and backend on a single Vercel deployment:

- Frontend: React application served from `/`
- Backend: Django API served from `/api`

## Testing Your Deployment

1. Visit your Vercel deployment URL
2. Test the frontend functionality
3. Test API endpoints through the frontend
4. Check authentication, product browsing, and shopping cart functionality
5. Access the Django admin at `/api/admin` with the admin credentials

## Troubleshooting

### Frontend Issues

- Check browser console for errors
- Verify environment variables in Vercel
- Make sure build process completes successfully

### Backend Issues

- Check Vercel Function logs for errors
- Verify database connection
- Check CORS configuration

## Production Considerations

1. **Database**: Use a production-ready database service
2. **Static Files**: Configure proper caching for static assets
3. **Media Files**: Use a storage service for user-uploaded files
4. **Monitoring**: Set up monitoring for your application
5. **Custom Domain**: Configure your custom domain in Vercel

## Ongoing Maintenance

- Deploy changes by pushing to your Git repository
- Monitor Vercel dashboard for deployment issues
- Set up automatic preview deployments for pull requests 