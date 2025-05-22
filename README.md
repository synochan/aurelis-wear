# Aurelis Wear Shop

A modern e-commerce platform for a fashion brand built with Django REST Framework (backend) and React (frontend).

## Features

- User authentication and account management
- Product browsing with filtering and search
- Shopping cart functionality
- Secure checkout with Stripe payments
- Order history and tracking
- Admin dashboard for product management

## Tech Stack

### Backend
- Django & Django REST Framework
- PostgreSQL (production) / SQLite (development)
- Stripe API integration
- WhiteNoise for static files
- Gunicorn for production deployment

### Frontend
- React with TypeScript
- Tailwind CSS with ShadcnUI components
- React Router for navigation
- React Query for data fetching
- Stripe Elements for payment processing

## Local Development

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables (create a `.env` file):
   ```
   DEBUG=True
   SECRET_KEY=your_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Load sample data (optional):
   ```bash
   python manage.py runscript sample_data
   ```

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create a `.env` file):
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Backend Deployment (Render)

1. Create a Render account at [https://render.com](https://render.com)

2. Connect your GitHub repository

3. Create a new Web Service:
   - Use the `render.yaml` configuration file
   - Set the required environment variables:
     - `SECRET_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_PUBLISHABLE_KEY`
     - `FRONTEND_URL`

4. Render will automatically deploy the application

### Frontend Deployment (Vercel)

1. Create a Vercel account at [https://vercel.com](https://vercel.com)

2. Connect your GitHub repository

3. Create a new project:
   - Framework preset: Vite
   - Root directory: frontend
   - Build command: npm run build
   - Output directory: dist
   - Set the required environment variables:
     - `VITE_API_URL` (URL of your Render backend with `/api` suffix)

4. Vercel will automatically deploy the application

## Testing Payments

For testing Stripe payments, use the following test card:
- Card number: 4242 4242 4242 4242
- Expiration date: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## License

This project is licensed under the MIT License - see the LICENSE file for details. 