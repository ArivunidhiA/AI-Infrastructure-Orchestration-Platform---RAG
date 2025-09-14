from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Create FastAPI app
app = FastAPI(
    title="AI Infrastructure Orchestration Platform",
    description="A comprehensive platform for managing AI workloads, monitoring resources, and optimizing costs with RAG-powered knowledge assistance",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# Test workloads endpoint
@app.get("/api/workloads")
async def get_workloads():
    return [
        {
            "id": 1,
            "name": "Test Workload",
            "type": "training",
            "status": "running",
            "cpu_cores": 4,
            "gpu_count": 1,
            "memory_gb": 16.0,
            "cost_per_hour": 2.5,
            "created_at": "2024-01-01T00:00:00Z"
        }
    ]

# Root endpoint - serve React app
@app.get("/")
async def root():
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    else:
        return {
            "message": "AI Infrastructure Orchestration Platform API",
            "version": "1.0.0",
            "docs": "/api/docs",
            "status": "running"
        }

# Serve static files for frontend
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for any unmatched routes"""
        # Skip API routes
        if full_path.startswith("api/"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Serve static files if they exist
        if full_path and os.path.exists(f"static/{full_path}") and not full_path.endswith("/"):
            return FileResponse(f"static/{full_path}")
        else:
            # Serve React app for all other routes (SPA routing)
            return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
