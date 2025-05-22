from http.server import BaseHTTPRequestHandler
import json

# Sample product data - in production, you would fetch this from a database
PRODUCTS = [
    {
        "id": 1,
        "name": "Classic Cotton T-Shirt",
        "description": "A comfortable, everyday cotton t-shirt.",
        "price": 24.99,
        "category": "t-shirts",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
        "id": 2,
        "name": "Slim Fit Jeans",
        "description": "Modern slim fit jeans with stretch comfort.",
        "price": 59.99,
        "category": "pants",
        "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
        "id": 3,
        "name": "Casual Hoodie",
        "description": "Warm and comfortable hoodie for everyday wear.",
        "price": 49.99,
        "category": "outerwear",
        "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    }
]

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Parse the path to get product ID if present
        path_parts = self.path.split('/')
        if len(path_parts) > 2 and path_parts[2].isdigit():
            # Get a specific product
            product_id = int(path_parts[2])
            product = next((p for p in PRODUCTS if p["id"] == product_id), None)
            
            if product:
                response = {"product": product}
            else:
                response = {"error": "Product not found"}
                self.send_response(404)
        else:
            # Return all products
            response = {"products": PRODUCTS}
        
        self.wfile.write(json.dumps(response).encode())
        return 