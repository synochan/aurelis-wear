import logging
import time
import json

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