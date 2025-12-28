from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.convoys import router as convoys_router

app = FastAPI(title="Army Convoys Pulse Backend")

# CORS for YOUR frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://army-convoys-pulse.lovable.app", "http://localhost:3000", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convoys_router, prefix="/api/convoys")

@app.get("/")
def root():
    return {"message": "Backend Connected to YOUR Firebase! 🚀", "endpoints": "/api/convoys/"}

@app.get("/docs")
def docs_redirect():
    return {"docs": "http://localhost:8000/docs"}
