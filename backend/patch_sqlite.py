"""
Patch SQLite connections to avoid SSL parameters
"""

import os
from pathlib import Path
import dj_database_url

# Store the original parse function
original_parse = dj_database_url.parse
original_config = dj_database_url.config

# Define a wrapper function for SQLite
def patched_parse(url, **kwargs):
    # If this is a SQLite URL, remove SSL parameters
    if url.startswith('sqlite'):
        if 'ssl_require' in kwargs:
            del kwargs['ssl_require']
        if 'sslmode' in kwargs:
            del kwargs['sslmode']
    
    # Call the original function
    return original_parse(url, **kwargs)

# Define a wrapper for config
def patched_config(env='DATABASE_URL', default=None, **kwargs):
    # Get the URL
    url = os.environ.get(env, default)
    
    # If this is a SQLite URL, remove SSL parameters
    if url and url.startswith('sqlite'):
        if 'ssl_require' in kwargs:
            del kwargs['ssl_require']
        if 'sslmode' in kwargs:
            del kwargs['sslmode']
    
    # Call the original function
    return original_config(env, default, **kwargs)

# Replace the original functions with our patched versions
dj_database_url.parse = patched_parse
dj_database_url.config = patched_config

print("SQLite connection patched to avoid SSL parameters") 