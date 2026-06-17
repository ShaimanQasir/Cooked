import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes import router

app = FastAPI(title=settings.PROJECT_NAME)

# Standard FastAPI CORS implementation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production to specific Django URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Cooked AI Service is running"}
