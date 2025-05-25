# Aurelis Wear E-commerce Platform

This repository contains the codebase for Aurelis Wear, an e-commerce platform for watches and accessories.

## Project Structure

The project is divided into two main parts:

- **Frontend**: React application deployed on Vercel
- **Backend**: Django REST API deployed on Render with Neon PostgreSQL database

## Frontend (Vercel)

The frontend is a React application built with:

- React
- TypeScript
- Tailwind CSS
- Vite

### Frontend Deployment

The frontend is deployed on Vercel at: [https://aurelis-wear.vercel.app](https://aurelis-wear.vercel.app)

## Backend (Render)

The backend is a Django REST API with:

- Django REST Framework
- Neon PostgreSQL database (PostgreSQL on steroids)
- Token authentication

### Backend Deployment

The backend is deployed on Render at: [https://aurelis-wear-api.onrender.com](https://aurelis-wear-api.onrender.com)

## Development Setup

### Frontend Development

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Access the frontend at `http://localhost:5173`

### Backend Development

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables (create a .env file in the backend directory):
   ```
   SECRET_KEY=your-secret-key
   DEBUG=True
   DATABASE_URL=your-neon-postgresql-url
   ```

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Run the development server:
   ```
   python manage.py runserver
   ```

7. Access the API at `http://localhost:8000/api/`

## API Documentation

The API provides endpoints for:

- Products: `/api/products/`
- Authentication: `/api/auth/`
- Shopping Cart: `/api/cart/`
- Orders: `/api/orders/`
- Payments: `/api/payments/`

For detailed API documentation, see the [backend README](backend/README.md).

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