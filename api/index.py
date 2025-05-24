"""
Proxy file to forward requests to the backend handler.
This file exists solely to satisfy Vercel's serverless function pattern.
"""

import os
import sys

# Add the parent directory to the path so we can import from backend
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

# Import the handler from the backend module
try:
    from backend.index import handler
except ImportError:
    # Fallback import for older structure
    from backend import handler 