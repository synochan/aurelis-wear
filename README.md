# Aurelis Wear E-commerce

An e-commerce platform for fashion products built with Django REST Framework backend and React frontend.

## Project Structure

The project is split into two deployable parts:

- **Backend API**: Django REST Framework application in the `backend` folder, deployed to Vercel
- **Frontend**: React application in the `frontend` folder, deployed separately to Vercel

## Deployment

### Backend Deployment

The backend is deployed to Vercel with the following configuration:

```
Domain: https://aurelis-wear-api.vercel.app
```

To deploy the backend:

1. Navigate to the backend directory
2. Create a Vercel project with the backend directory as the root
3. Deploy using the configuration in `backend/vercel.json`
4. Set the necessary environment variables in the Vercel dashboard

### Frontend Deployment

The frontend is deployed to Vercel with the following configuration:

```
Domain: https://aurelis-wear.vercel.app
```

To deploy the frontend:

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

### Frontend

Required environment variables:

- `VITE_API_URL`: URL of the backend API

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