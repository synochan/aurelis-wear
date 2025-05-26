# Aurelis Wear E-commerce Platform

This repository contains the codebase for Aurelis Wear, an e-commerce platform for watches and accessories.

## Project Structure

The project is divided into two main parts:

- **Frontend**: React application deployed on Vercel
- **Backend**: Django REST API deployed on Render with Neon PostgreSQL database

## Architecture Overview

```
├── frontend/            # React frontend (deployed on Vercel)
│   ├── src/             # React source code
│   └── public/          # Static assets
└── backend/             # Django backend (deployed on Render)
    ├── products/        # Products app
    ├── authentication/  # Authentication app
    ├── cart/            # Shopping cart app
    ├── orders/          # Orders app
    └── payments/        # Payments app
```

## Local Development

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables (a `.env` file is already configured in the backend directory)

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```
   python manage.py runserver
   ```

8. Access the API at `http://localhost:8000/api/`

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the frontend at `http://localhost:5173`

## Deployment

### Frontend (Vercel)

The frontend is already deployed on Vercel at: [https://aurelis-wear.vercel.app](https://aurelis-wear.vercel.app)

- The frontend configuration is in `frontend/vercel.json`
- Environment variables are set in the Vercel dashboard

### Backend (Render)

The backend is deployed on Render using either:

1. **Render Blueprint** (recommended): 
   - Uses the `backend/render.yaml` file
   - Automatically provisions both web service and database
   - See [backend README](backend/README.md) for detailed instructions

2. **Manual Deployment**:
   - Create a new Web Service on Render
   - Connect your GitHub repository
   - Set build command to `./build.sh`
   - Set start command to `gunicorn backend.wsgi:application`
   - Add required environment variables (see [backend README](backend/README.md))

## Database (Neon PostgreSQL)

The application uses Neon PostgreSQL for the database. The connection settings are:

- Connection string format: `postgresql://username:password@hostname:port/database?sslmode=require`
- The connection string should be added as `DATABASE_URL` in your environment variables
- Never commit the actual connection string to git - it should stay in `.env` files (which are gitignored)

### Migrating Data from SQLite to Neon

If you have existing data in SQLite that you need to migrate to Neon:

1. Make sure your SQLite database file exists and contains your data
2. Configure your `.env` file with the Neon PostgreSQL connection string
3. Run the migration script:
   ```
   cd backend
   python migrate_to_neon.py
   ```

## Image Storage (Cloudinary)

The application uses Cloudinary for image storage. To set up Cloudinary:

1. Create a Cloudinary account at [https://cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the Cloudinary dashboard
3. Add these credentials to your environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Migrating Images to Cloudinary

If you have local images that need to be uploaded to Cloudinary:

1. Make sure your Cloudinary credentials are set in your environment variables
2. Run the migration script:
   ```
   # On Linux/macOS
   ./migrate-images.sh
   
   # On Windows
   ./migrate-images.ps1
   ```

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