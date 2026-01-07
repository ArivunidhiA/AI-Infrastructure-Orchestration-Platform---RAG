from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from backend.database import create_tables, init_sample_data
from backend.routes import workloads, monitoring, optimization, rag, auth
from backend.config.settings import get_settings
from backend.utils.logging import setup_logging

# Setup logging
logger = setup_logging()

# Get settings
settings = get_settings()

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
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(workloads.router)
app.include_router(monitoring.router)
app.include_router(optimization.router)
app.include_router(rag.router)
app.include_router(auth.router)

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

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check with database connectivity test"""
    try:
        from backend.database import dynamodb_client, TABLES
        # Test DynamoDB connectivity
        table_name = TABLES['workloads']
        dynamodb_client.describe_table(TableName=table_name)
        return {
            "status": "healthy",
            "message": "API is running",
            "database": "connected"
        }
    except Exception as e:
        logger.warning(f"Health check failed: {e}")
        return {
            "status": "degraded",
            "message": "API is running but database connection failed",
            "database": "disconnected",
            "error": str(e)
        }

# Initialize database and sample data
@app.on_event("startup")
async def startup_event():
    """Initialize database and sample data on startup"""
    try:
        logger.info("Starting up application...")
        # Create database tables
        create_tables()
        logger.info("Database tables created successfully")
        
        # Initialize sample data (only in development)
        if settings.environment == "development":
            init_sample_data()
            logger.info("Sample data initialized successfully")
        
    except Exception as e:
        logger.error(f"Error during startup: {e}", exc_info=True)

# Serve static files for frontend
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found", "message": "The requested endpoint does not exist"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": "An unexpected error occurred"}
    )

# Catch-all route for React SPA (must be last and very specific)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve frontend for any unmatched routes"""
    # Only handle non-API routes
    if not full_path.startswith("api/") and not full_path.startswith("static/") and full_path != "health":
        # Serve static files if they exist
        if full_path and os.path.exists(f"static/{full_path}") and not full_path.endswith("/"):
            return FileResponse(f"static/{full_path}")
        else:
            # Serve React app for all other routes (SPA routing)
            return FileResponse("static/index.html")
    
    # For API routes, let them fall through to 404
    raise HTTPException(status_code=404, detail="Not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
