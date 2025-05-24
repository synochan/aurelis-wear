# Aurelis Wear Shop - Render to Vercel Migration Summary

## Files Removed

1. `backend/render.yaml` - Render-specific deployment configuration
2. `backend/setup_render.sh` - Render setup script
3. `backend/build.sh` - Render build script
4. `RENDER_DEPLOY.md` - Render deployment instructions

## Files Added/Modified

1. `backend/vercel.json` - Added Vercel deployment configuration
2. `api/index.py` - Created Vercel serverless function handler for Django
3. `vercel.json` - Updated root configuration for both frontend and backend
4. `backend/wsgi.py` - Updated to add `app = application` for Vercel compatibility
5. `backend/settings.py` - Updated to support Vercel deployment
   - Added .vercel.app to ALLOWED_HOSTS
   - Updated logging configuration
   - Made security settings more configurable
6. `frontend/src/api/client.ts` - Updated API URL handling for Vercel
7. `frontend/src/api/config.ts` - Updated API URL handling for Vercel
8. `frontend/src/vite-env.d.ts` - Added TypeScript definitions for import.meta.env
9. `VERCEL_DEPLOY.md` - Created new deployment instructions
10. `backend/migrate.py` - Added script to run migrations
11. `backend/load_sample_data.py` - Added script to load sample data

## Database Configuration

The application is now configured to use a Neon PostgreSQL database:

- **Connection String**: `postgresql://aurelis_owner:npg_z8KYB6VpXPbd@ep-shy-sun-a1wfphe1-pooler.ap-southeast-1.aws.neon.tech/aurelis?sslmode=require`
- **Database Name**: `aurelis`
- **Username**: `aurelis_owner`

This connection string is set in:
1. The root `vercel.json` file
2. The `backend/vercel.json` file

## Automatic Database Setup

The application now includes automatic database setup functionality:

1. Django migrations run during deployment
2. Migrations also run on first API request
3. Sample data is loaded if the database is empty
4. An admin user is created automatically

## Key Configuration Changes

### API Routing

The application now uses Vercel's routing to direct requests:
- Frontend requests: Served from root path `/`
- Backend API requests: Forwarded to `/api`

### Frontend API Configuration

The frontend has been updated to handle different environments:
- In development: Uses environment variable or localhost
- In production: Uses the same domain with `/api` prefix

### Backend Deployment

The Django backend now runs as a Vercel serverless function:
- WSGI application is wrapped in a handler
- Environment variables are properly configured
- Static files are handled by WhiteNoise

## Next Steps

1. Deploy the application to Vercel
2. Set up a PostgreSQL database for production
3. Configure environment variables in Vercel
4. Test the deployment
5. Set up a custom domain if needed 