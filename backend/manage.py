#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# Monkeypatch SQLite connection to remove SSL parameters
def monkeypatch_sqlite():
    from django.db.backends.sqlite3.base import DatabaseWrapper
    original_get_new_connection = DatabaseWrapper.get_new_connection
    
    def patched_get_new_connection(self, conn_params):
        # Remove SSL parameters that are not supported by SQLite
        if 'sslmode' in conn_params:
            del conn_params['sslmode']
        return original_get_new_connection(self, conn_params)
    
    DatabaseWrapper.get_new_connection = patched_get_new_connection
    print("SQLite connection patched to ignore SSL parameters")

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
        # Apply the monkeypatch after Django is imported but before commands are executed
        monkeypatch_sqlite()
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
