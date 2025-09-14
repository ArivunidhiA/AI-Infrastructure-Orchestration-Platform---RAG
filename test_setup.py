#!/usr/bin/env python3
"""
Test script to verify the AI Infrastructure Platform setup
"""

import sys
import os
import subprocess
import time
import requests
from pathlib import Path

def test_backend_imports():
    """Test if backend can be imported successfully"""
    print("🔧 Testing backend imports...")
    try:
        sys.path.append('backend')
        from backend.main import app
        print("✅ Backend imports successful!")
        return True
    except Exception as e:
        print(f"❌ Backend import failed: {e}")
        return False

def test_database_creation():
    """Test database creation and sample data"""
    print("🗄️ Testing database setup...")
    try:
        sys.path.append('backend')
        from backend.database import create_tables, init_sample_data
        
        # Create tables
        create_tables()
        print("✅ Database tables created!")
        
        # Initialize sample data
        init_sample_data()
        print("✅ Sample data initialized!")
        return True
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False

def test_backend_server():
    """Test if backend server can start"""
    print("🚀 Testing backend server startup...")
    try:
        # Start server in background
        process = subprocess.Popen([
            sys.executable, '-m', 'uvicorn', 
            'backend.main:app', '--host', '0.0.0.0', '--port', '8000'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for server to start
        time.sleep(5)
        
        # Test health endpoint
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running!")
            process.terminate()
            return True
        else:
            print(f"❌ Backend server health check failed: {response.status_code}")
            process.terminate()
            return False
    except Exception as e:
        print(f"❌ Backend server test failed: {e}")
        return False

def test_frontend_build():
    """Test if frontend can be built"""
    print("🎨 Testing frontend build...")
    try:
        os.chdir('frontend')
        result = subprocess.run(['npm', 'run', 'build'], 
                              capture_output=True, text=True, timeout=60)
        os.chdir('..')
        
        if result.returncode == 0:
            print("✅ Frontend build successful!")
            return True
        else:
            print(f"❌ Frontend build failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Frontend build test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 AI Infrastructure Platform - Setup Test")
    print("=" * 50)
    
    tests = [
        test_backend_imports,
        test_database_creation,
        test_frontend_build,
        test_backend_server
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The platform is ready to use.")
        print("\n🚀 To start the platform:")
        print("   Backend: cd backend && python -m uvicorn main:app --reload")
        print("   Frontend: cd frontend && npm start")
        print("   Or use: ./start.sh")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
