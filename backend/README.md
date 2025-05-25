# Aurelis Wear API

Backend API for the Aurelis Wear e-commerce platform.

## Deployment on Render

### Automatic Deployment

This repository includes a `render.yaml` file that can be used to deploy both the API and database directly from the GitHub repository:

1. Create a new Blueprint on Render
2. Link your GitHub repository
3. Render will automatically create the services defined in the render.yaml file

### Manual Deployment

To deploy manually:

1. Create a new Web Service on Render
2. Link your GitHub repository
3. Set the following configuration:
   - **Environment**: Python
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn backend.wsgi:application`
   - **Plan**: Free (or other as needed)
   - **Advanced**: Check "Auto-Deploy" if desired

4. Add the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection URL (create a PostgreSQL database on Render first)
   - `SECRET_KEY`: A secure random string
   - `ALLOWED_HOSTS`: `.onrender.com,your-app-name.onrender.com`
   - `DEBUG`: false

## Local Development

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file with:
   ```
   SECRET_KEY=your-secret-key
   DEBUG=True
   DATABASE_URL=sqlite:///db.sqlite3
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Run the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

- `/api/products/` - List of products
- `/api/products/featured/` - Featured products
- `/api/auth/register/` - User registration
- `/api/auth/login/` - User login
- `/api/cart/` - Shopping cart operations
- `/api/orders/` - Order operations
- `/api/payments/` - Payment processing

## Frontend Integration

This API is designed to work with the Aurelis Wear frontend deployed on Vercel. Make sure to update the frontend's API URL to point to your Render deployment URL once deployed.