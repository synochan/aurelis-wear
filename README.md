# Aurelis Wear E-commerce

An e-commerce platform for fashion products built with Django REST Framework backend and React frontend.

## Project Structure

The project is split into two deployable parts:

- **Backend API**: Django REST Framework application in the `backend` folder, deployed to Vercel
- **Frontend**: React application in the `frontend` folder, deployed separately to Vercel

## Deployment

### Backend Deployment (Manual)

The backend should be deployed manually through the Vercel dashboard for proper Django support:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository or select the backend folder
4. Configure project settings:
   - Name: `aurelis-wear-api` (or your preferred name)
   - Framework Preset: Select "Other" (since we have our custom vercel.json)
   - Root Directory: Select the backend folder
5. Set up environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `DJANGO_SETTINGS_MODULE`: `backend.settings`
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.vercel.app,aurelis-wear-api.vercel.app,localhost,127.0.0.1`
   - `FRONTEND_URL`: `https://aurelis-wear.vercel.app`
   - `PYTHON_VERSION`: `3.9`
6. Click "Deploy"

For detailed instructions, see [backend/README.md](backend/README.md)

### Frontend Deployment

The frontend can be deployed using the automated script or manually:

```bash
# Deploy only the frontend
npm run deploy:frontend
```

To deploy the frontend manually:

1. Navigate to the frontend directory
2. Create a separate Vercel project with the frontend directory as the root
3. Deploy using the configuration in `frontend/vercel.json`
4. Make sure the `VITE_API_URL` points to your backend deployment URL

## Troubleshooting

### Build Issues

#### "No output directory named 'dist' found after the build completed"

This error occurs when Vercel cannot find the expected build output directory. To fix this:

1. Ensure `vite.config.ts` explicitly sets the output directory:
   ```typescript
   build: {
     outDir: 'dist',
     emptyOutDir: true
   }
   ```

2. Update build scripts in `frontend/package.json` to specify the output directory:
   ```json
   "build": "vite build --outDir dist",
   "vercel-build": "vite build --outDir dist"
   ```

3. Verify the correct `distDir` is set in `frontend/vercel.json`:
   ```json
   "builds": [
     { 
       "src": "package.json", 
       "use": "@vercel/static-build", 
       "config": { 
         "distDir": "dist"
       } 
     }
   ]
   ```

4. Run the verification script to check if the build process works correctly:
   ```bash
   npm run verify-build
   ```

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `DJANGO_SETTINGS_MODULE`: Set to `backend.settings`
- `DEBUG`: Set to `True` for development, `False` for production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `FRONTEND_URL`: URL of the frontend (set to `https://aurelis-wear.vercel.app` in production)

### Frontend

Required environment variables:

- `VITE_API_URL`: URL of the backend API (set to `https://aurelis-wear-api.vercel.app` in production)

## Features

- User authentication and account management
- Product browsing with filtering and search
- Shopping cart functionality
- Secure checkout with Stripe payments
- Order history and tracking
- Admin dashboard for product management

## Testing Payments

For testing Stripe payments, use the following test card:
- Card number: 4242 4242 4242 4242
- Expiration date: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## License

This project is licensed under the MIT License - see the LICENSE file for details. 