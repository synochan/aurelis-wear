# Files to Clean Up

After switching to manual backend deployment via the Vercel dashboard, the following files are no longer needed and can be safely removed:

## Files to Remove

1. `deploy-backend.js` - Replaced by manual deployment through Vercel dashboard
2. `deploy.js` - Combined deployment script is no longer needed
3. `api/` directory - The proxy setup is no longer needed as we're directly using wsgi.py
4. `backend/index.py` - Not needed as we're using wsgi.py directly
5. `vercel-build.sh` - No longer needed for manual deployment

## Files to Keep

1. `deploy-frontend.js` - Still useful for frontend deployment
2. `verify-build.js` - Still useful for verifying frontend builds
3. `frontend/` directory - Contains the React frontend application
4. `backend/` directory - Contains the Django backend application

## Manual Deployment Steps

1. Remove the unnecessary files listed above
2. Push your changes to your Git repository
3. Follow the backend deployment instructions in the README.md

Now the project structure is cleaner and focused on the manual deployment approach for the backend, which is more reliable for Django applications on Vercel. 