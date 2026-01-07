#!/usr/bin/env python3
"""Script to create DynamoDB tables"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.database import create_tables, init_sample_data

if __name__ == "__main__":
    print("Creating DynamoDB tables...")
    create_tables()
    print("✅ Tables created successfully")
    
    # Initialize sample data if in development
    if os.getenv("ENVIRONMENT", "development") == "development":
        print("Initializing sample data...")
        init_sample_data()
        print("✅ Sample data initialized")

