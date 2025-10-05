#!/usr/bin/env python3
"""
DigitalOcean App Platform detection file
This file helps DigitalOcean detect this as a Python project
The actual Django application is in the backend/ directory
"""

import os
import sys

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Change to backend directory
os.chdir(backend_dir)

# Import Django WSGI application
from config.wsgi import application

if __name__ == "__main__":
    print("This is a Django ERP application.")
    print("The main application is located in the backend/ directory.")
    print("Use the backend/manage.py file for Django management commands.")
