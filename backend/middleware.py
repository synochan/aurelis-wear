import logging
import time
import json
import re
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    """Middleware to log all requests and responses"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Code to be executed for each request before the view
        start_time = time.time()
        
        try:
            # Log request details
            headers = {k: v for k, v in request.headers.items()}
            auth_header = headers.get('Authorization', 'No Auth header')
            
            # Log request details
            logger.info(f"[REQUEST] {request.method} {request.path} - Auth: {auth_header}")
            
            if request.path.startswith('/api/cart'):
                try:
                    logger.debug(f"[CART REQUEST] User: {request.user}, Authenticated: {request.user.is_authenticated if hasattr(request, 'user') else 'N/A'}")
                    
                    if request.body:
                        try:
                            body = json.loads(request.body)
                            # Replace any sensitive data
                            if 'password' in body:
                                body['password'] = '***'
                            logger.debug(f"[CART REQUEST BODY] {body}")
                        except:
                            logger.debug(f"[CART REQUEST BODY] Raw: {request.body[:100]}...")
                except Exception as e:
                    logger.error(f"[CART REQUEST ERROR] {str(e)}")
            
            response = self.get_response(request)
            
            # Code to be executed for each request/response after the view
            duration = time.time() - start_time
            status_code = getattr(response, 'status_code', 0)
            
            # Log response details
            log_msg = f"[RESPONSE] {request.method} {request.path} - Status: {status_code}, Duration: {duration:.2f}s"
            
            if status_code >= 400:  # Log errors with higher level
                logger.warning(log_msg)
                if status_code == 500 and hasattr(response, 'content'):
                    logger.error(f"[ERROR RESPONSE] {response.content[:500]}")
            else:
                logger.info(log_msg)
            
            return response
        except Exception as e:
            # Catch any middleware errors to prevent crashing the application
            logger.error(f"[MIDDLEWARE ERROR] {str(e)}")
            # Continue processing the request
            return self.get_response(request)

class CORSMiddleware(MiddlewareMixin):
    """
    Middleware to handle CORS requests.
    This is a fallback in case the serverless handler in index.py doesn't fully handle CORS.
    """
    
    def is_allowed_origin(self, origin):
        """Check if the given origin is allowed"""
        if not origin:
            return False
            
        # Allow localhost on any port
        if origin.startswith('http://localhost:') or origin.startswith('https://localhost:'):
            return True
            
        # Allow aurelis-wear.vercel.app
        if origin == 'https://aurelis-wear.vercel.app':
            return True
            
        # Allow any aurelis-*.vercel.app domain (preview deployments)
        if re.match(r'https://aurelis-[a-z0-9\-]+\.vercel\.app', origin):
            return True
            
        # Allow any *.vercel.app domain as a fallback
        if '.vercel.app' in origin:
            return True
            
        return False
    
    def process_request(self, request):
        """Process the request and handle OPTIONS requests directly"""
        # If this is an OPTIONS request, return a response immediately
        if request.method == 'OPTIONS':
            response = HttpResponse()
            self.add_cors_headers(response, request)
            return response
        return None
    
    def process_response(self, request, response):
        """Add CORS headers to the response"""
        self.add_cors_headers(response, request)
        return response
    
    def add_cors_headers(self, response, request):
        """Add CORS headers to the response based on the request's origin"""
        origin = request.META.get('HTTP_ORIGIN')
        
        # Set the Access-Control-Allow-Origin header based on the origin
        if origin and self.is_allowed_origin(origin):
            response['Access-Control-Allow-Origin'] = origin
            # Important when using specific origins
            response['Vary'] = 'Origin'
        else:
            response['Access-Control-Allow-Origin'] = '*'
            
        # Set other CORS headers
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
        response['Access-Control-Allow-Headers'] = (
            'Content-Type, Authorization, X-Requested-With, Accept, '
            'X-CSRF-Token, Accept-Version, Content-Length, Content-MD5, '
            'Date, X-Api-Version'
        )
        response['Access-Control-Allow-Credentials'] = 'true'
        
        # Only add this for preflight requests
        if request.method == 'OPTIONS':
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
            
        return response 