# Aurelis Wear Shop

An e-commerce platform for fashion products built with React (frontend) and Django (backend).

## Features

- User authentication
- Product browsing with filtering by category
- Product detail views
- Shopping cart functionality
- Order management

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Shadcn UI components
- React Query for data fetching
- Axios for API calls
- Vite for fast development and building

### Backend
- Django for the API
- Django REST Framework
- PostgreSQL database
- Token-based authentication

## Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aurelis-wear-shop.git
cd aurelis-wear-shop
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Create an admin user
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Create environment files:
   - In the frontend directory, create `.env.local`:
   ```
   VITE_API_URL=http://localhost:8000
   ```

   - In the backend directory, create `.env`:
   ```
   DEBUG=True
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgres://user:password@localhost:5432/aurelis
   ```

### Running the Application

#### Using Root Script (Recommended)
From the root directory, you can run both frontend and backend concurrently:
```bash
npm install  # Install root dependencies (one-time)
npm run dev  # Start both frontend and backend
```

#### Running Separately
1. Start the backend:
```bash
cd backend
python manage.py runserver
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api/
   - Admin interface: http://localhost:8000/admin/

## API Endpoints

- `GET /api/products/` - List all products
- `GET /api/products/{id}/` - Get product details
- `GET /api/products/?is_featured=true` - Get featured products
- `GET /api/products/?category=men` - Filter products by category

- `GET /api/cart/` - Get current user's cart
- `POST /api/cart/items/` - Add item to cart
- `PATCH /api/cart/items/{id}/` - Update cart item
- `DELETE /api/cart/items/{id}/` - Remove cart item
- `POST /api/cart/clear/` - Clear cart

## Troubleshooting

### Common Issues

1. **Network Error when accessing API**:
   - Ensure the backend server is running
   - Check that the API URL in `.env.local` matches your backend server address

2. **Authentication Issues**:
   - Verify your token is valid
   - Check your login credentials

3. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check database credentials in your environment variables

4. **Missing dev script error**:
   - Run commands from the correct directory
   - Make sure you've installed dependencies with `npm install`

## License

This project is licensed under the MIT License - see the LICENSE file for details. 