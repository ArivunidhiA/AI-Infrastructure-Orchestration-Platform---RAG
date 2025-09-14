#!/usr/bin/env python3
"""
AI Infrastructure Orchestration Platform - Single Port Startup Script
This script builds the frontend and starts the backend server on a single port.
"""

import os
import subprocess
import sys
import time
from pathlib import Path

def run_command(command, cwd=None, shell=True):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, cwd=cwd, shell=shell, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def main():
    print("🚀 Starting AI Infrastructure Orchestration Platform...")
    print("=" * 60)
    
    # Get the project root directory
    project_root = Path(__file__).parent
    frontend_dir = project_root / "frontend"
    backend_dir = project_root / "backend"
    
    # Check if directories exist
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return 1
    
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return 1
    
    print("📦 Building frontend...")
    success, output = run_command("npm run build", cwd=frontend_dir)
    if not success:
        print(f"❌ Frontend build failed: {output}")
        return 1
    
    print("✅ Frontend built successfully!")
    
    print("📁 Copying frontend build to backend...")
    # Create static directory if it doesn't exist
    static_dir = backend_dir / "static"
    static_dir.mkdir(exist_ok=True)
    
    # Copy build files
    build_dir = frontend_dir / "build"
    if build_dir.exists():
        import shutil
        if static_dir.exists():
            shutil.rmtree(static_dir)
        shutil.copytree(build_dir, static_dir)
        print("✅ Frontend files copied to backend!")
    else:
        print("❌ Build directory not found!")
        return 1
    
    print("🔧 Starting backend server...")
    print("=" * 60)
    print("🌐 Application will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/api/docs")
    print("=" * 60)
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    # Start the backend server
    try:
        os.chdir(backend_dir)
        subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")
        return 0
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
