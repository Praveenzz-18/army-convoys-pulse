from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.convoys import router as convoys_router
from routes.tracking import router as tracking_router
from routes.optimize import router as optimize_router

app = FastAPI(title="Army Convoys Pulse Backend")

# CORS for YOUR frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convoys_router, prefix="/api/convoys")
app.include_router(tracking_router, prefix="/api/track")
app.include_router(optimize_router, prefix="/api/optimize")

@app.get("/")
def root():
    return {"message": "Backend Connected to YOUR Firebase! 🚀", "endpoints": "/api/convoys/"}

@app.get("/docs")
def docs_redirect():
    return {"docs": "http://localhost:8000/docs"}
