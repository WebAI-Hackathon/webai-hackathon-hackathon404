from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import training

# Erstelle alle Tabellen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Planetic Gym API",
    description="API für Trainingsplanung und Workout-Tracking",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Für Vite Dev Server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(training.router, prefix="/api/training", tags=["Training"])

@app.get("/")
def read_root():
    return {"message": "Planetic Gym API ist online!", "version": "1.0.0"}
