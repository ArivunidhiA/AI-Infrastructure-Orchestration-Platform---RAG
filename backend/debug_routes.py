from fastapi import FastAPI
from routes import workloads, monitoring, optimization, rag

# Create FastAPI app
app = FastAPI()

# Include routers
app.include_router(workloads.router)
app.include_router(monitoring.router)
app.include_router(optimization.router)
app.include_router(rag.router)

print("All routes in app:")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"  {route.methods} {route.path}")

# Test the workloads endpoint
from fastapi.testclient import TestClient
client = TestClient(app)

print("\nTesting workloads endpoint:")
response = client.get("/api/workloads")
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
