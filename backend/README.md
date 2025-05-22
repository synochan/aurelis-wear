# Aurelis Wear Shop Backend

This is the backend API for the Aurelis Wear Shop, built with Django and Django REST Framework.

## Setup Instructions

1. Install required packages:
   ```
   pip install django djangorestframework django-cors-headers pillow django-filter
   ```

2. Apply migrations:
   ```
   python manage.py migrate
   ```

3. Create a superuser (optional):
   ```
   python manage.py createsuperuser
   ```

4. Load sample data:
   ```
   python sample_data.py
   ```

5. Run the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

### Products
- `GET /api/products/` - List all products
- `GET /api/products/{id}/` - Get product details
- `GET /api/products/featured/` - Get featured products
- `GET /api/categories/` - List all categories
- `GET /api/categories/{slug}/` - Get category details

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login user
- `GET /api/auth/user/` - Get current user profile

### Cart
- `GET /api/cart/` - Get user's cart
- `POST /api/cart/items/` - Add item to cart
- `PATCH /api/cart/items/{id}/` - Update cart item quantity
- `DELETE /api/cart/items/{id}/` - Remove item from cart
- `POST /api/cart/clear/` - Clear cart

## Sample User

For testing, you can use the following credentials:
- Email: test@example.com
- Username: testuser
- Password: password123 