#!/usr/bin/env python3
"""
Quick backend test script
"""
import sys
import os

# Add current directory to Python path
sys.path.append(os.getcwd())

try:
    print("Testing imports...")
    import models
    print("✓ models imported successfully")
    
    import schemas
    print("✓ schemas imported successfully")
    
    import database
    print("✓ database imported successfully")
    
    import statistics_service
    print("✓ statistics_service imported successfully")
    
    from routers import training
    print("✓ training router imported successfully")
    
    print("\nAll imports successful! Backend should start correctly.")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("This might be causing the backend startup issues.")
    
except Exception as e:
    print(f"❌ Unexpected error: {e}")
