# Aurelis Wear Deployment Guide

This guide will help you fix the 404 errors on both the frontend and backend deployments.

## Frontend Deployment (404 Fix)

### Option 1: Deploy via the Vercel Dashboard

1. **Log in to Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Sign in with your account

2. **Configure the Frontend Project**
   - Find your frontend project
   - Go to "Settings" → "General"
   - Under "Build & Development Settings":
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Set Environment Variables**
   - Go to "Settings" → "Environment Variables"
   - Add `VITE_API_URL` with value `https://aurelis-wear-api.vercel.app`

4. **Redeploy**
   - Go to "Deployments"
   - Click on the three dots next to your latest deployment → "Redeploy"

### Option 2: Deploy via CLI

Run the following command to deploy the frontend:

```bash
cd frontend
vercel --prod
```

When prompted, use these settings:
- Build Command: `npm run build`
- Output Directory: `dist`

## Backend Deployment (404 Fix)

### Option 1: Deploy via the Vercel Dashboard

1. **Log in to Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Sign in with your account

2. **Configure the Backend Project**
   - Find your backend project
   - Go to "Settings" → "General"
   - Under "Build & Development Settings":
     - Framework Preset: Other
     - Build Command: `./build.sh`
     - Output Directory: (leave empty)

3. **Set Environment Variables**
   - Go to "Settings" → "Environment Variables"
   - Add the following variables:
     - `DJANGO_SETTINGS_MODULE`: `backend.settings`
     - `ALLOWED_HOSTS`: `.vercel.app,aurelis-wear-api.vercel.app,localhost,127.0.0.1`
     - `FRONTEND_URL`: `https://aurelis-wear.vercel.app`
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `DEBUG`: `False`

4. **Redeploy**
   - Go to "Deployments"
   - Click on the three dots next to your latest deployment → "Redeploy"

### Option 2: Deploy via CLI

```bash
cd backend
vercel --prod
```

## Verifying the Deployments

After deploying, test both sites by visiting:
- Frontend: https://aurelis-wear.vercel.app
- Backend: https://aurelis-wear-api.vercel.app/api/products/

If you still see 404 errors, check these common issues:

### Frontend 404 Troubleshooting
- Verify your `frontend/vercel.json` has the correct rewrites configuration
- Check that the build is generating files in the `dist` directory
- Make sure the index.html file is in the root of the build output

### Backend 404 Troubleshooting
- Ensure `wsgi.py` is correctly configured with both `application` and `app` variables
- Check that your `vercel.json` routes all requests to `wsgi.py`
- Verify that Django's `ALLOWED_HOSTS` setting includes your Vercel domain

## Important Files to Check

### Frontend Files
- `frontend/vercel.json`
- `frontend/vite.config.ts`
- `frontend/package.json` (build scripts)

### Backend Files
- `backend/vercel.json`
- `backend/wsgi.py`
- `backend/settings.py` (ALLOWED_HOSTS and CORS settings)
- `backend/build.sh`
- `backend/manifest.py` 