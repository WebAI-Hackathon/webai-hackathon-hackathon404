from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models, schemas

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === Exercises ===
@router.post("/exercise/", response_model=schemas.ExerciseRead)
def create_exercise(exercise: schemas.ExerciseCreate, db: Session = Depends(get_db)):
    db_ex = models.Exercise(**exercise.dict())
    db.add(db_ex)
    db.commit()
    db.refresh(db_ex)
    return db_ex

@router.get("/exercise/", response_model=list[schemas.ExerciseRead])
def list_exercises(db: Session = Depends(get_db)):
    return db.query(models.Exercise).all()

# === WorkingPlans ===
@router.post("/plan/", response_model=schemas.WorkingPlanRead)
def create_plan(plan: schemas.WorkingPlanCreate, db: Session = Depends(get_db)):
    db_plan = models.WorkingPlan()
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/plan/", response_model=list[schemas.WorkingPlanRead])
def list_plans(db: Session = Depends(get_db)):
    return db.query(models.WorkingPlan).all()

# === WorkingDays ===
@router.post("/day/", response_model=schemas.WorkingDayRead)
def create_day(day: schemas.WorkingDayCreate, db: Session = Depends(get_db)):
    db_day = models.WorkingDay(**day.dict())
    db.add(db_day)
    db.commit()
    db.refresh(db_day)
    return db_day

@router.get("/day/", response_model=list[schemas.WorkingDayRead])
def list_days(db: Session = Depends(get_db)):
    return db.query(models.WorkingDay).all()

