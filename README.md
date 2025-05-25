# Aurelis Wear E-commerce

An e-commerce platform for fashion products built with Django REST Framework backend and React frontend.

## Project Structure

The project is split into two deployable parts:

- **Backend API**: Django REST Framework application in the `backend` folder, deployed to Vercel
- **Frontend**: React application in the `frontend` folder, deployed separately to Vercel

## Deployment

The project includes deployment scripts to simplify the process of deploying both the frontend and backend to Vercel.

### Automated Deployment

To deploy both frontend and backend in one step:

```bash
node deploy.js
```

This script will:
1. Deploy the backend API to `aurelis-wear-api.vercel.app`
2. Deploy the frontend to `aurelis-wear.vercel.app`

### Manual Deployment

You can also deploy each part separately:

```bash
# Backend deployment only
node deploy-backend.js

# Frontend deployment only  
node deploy-frontend.js
```

### Backend Deployment

The backend is deployed to Vercel with the following configuration:

```
Domain: https://aurelis-wear-api.vercel.app
```

To deploy the backend manually:

1. Navigate to the backend directory
2. Create a Vercel project with the backend directory as the root
3. Deploy using the configuration in `backend/vercel.json`
4. Set the necessary environment variables in the Vercel dashboard

### Frontend Deployment

The frontend is deployed to Vercel with the following configuration:

```
Domain: https://aurelis-wear.vercel.app
```

To deploy the frontend manually:

1. Navigate to the frontend directory
2. Create a separate Vercel project with the frontend directory as the root
3. Deploy using the configuration in `frontend/vercel.json`
4. Make sure the `VITE_API_URL` points to your backend deployment URL

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