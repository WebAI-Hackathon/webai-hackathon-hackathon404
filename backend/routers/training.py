from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List
from database import SessionLocal
import models, schemas
import sys
import os

# Add parent directory to path for statistics import
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from statistics_service import StatisticsService

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

@router.get("/exercise/", response_model=List[schemas.ExerciseRead])
def list_exercises(db: Session = Depends(get_db)):
    return db.query(models.Exercise).all()

@router.get("/exercise/{exercise_id}", response_model=schemas.ExerciseRead)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise

# === WorkingPlans ===
@router.post("/plan/", response_model=schemas.WorkingPlanRead)
def create_plan(plan: schemas.WorkingPlanCreate, db: Session = Depends(get_db)):
    db_plan = models.WorkingPlan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/plan/", response_model=List[schemas.WorkingPlanRead])
def list_plans(db: Session = Depends(get_db)):
    return db.query(models.WorkingPlan).all()

@router.get("/plan/{plan_id}", response_model=schemas.WorkingPlanRead)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(models.WorkingPlan).filter(models.WorkingPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.delete("/plan/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(models.WorkingPlan).filter(models.WorkingPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # SQLAlchemy wird automatisch alle abhängigen WorkingDays löschen
    # dank cascade="all, delete-orphan" in der Beziehungsdefinition
    db.delete(plan)
    db.commit()
    return {"message": "Plan successfully deleted"}

# === WorkingDays ===
@router.post("/day/", response_model=schemas.WorkingDayRead)
def create_day(day: schemas.WorkingDayCreate, db: Session = Depends(get_db)):
    # Erstelle den WorkingDay
    day_data = day.dict(exclude={'exercise_ids'})
    db_day = models.WorkingDay(**day_data)
    db.add(db_day)
    db.commit()
    db.refresh(db_day)
    
    # Füge Übungen hinzu, falls vorhanden
    if day.exercise_ids:
        exercises = db.query(models.Exercise).filter(models.Exercise.id.in_(day.exercise_ids)).all()
        db_day.exercises.extend(exercises)
        db.commit()
        db.refresh(db_day)
    
    return db_day

@router.get("/day/", response_model=List[schemas.WorkingDayRead])
def list_days(db: Session = Depends(get_db)):
    return db.query(models.WorkingDay).all()

@router.get("/day/{day_id}", response_model=schemas.WorkingDayRead)
def get_day(day_id: int, db: Session = Depends(get_db)):
    day = db.query(models.WorkingDay).filter(models.WorkingDay.id == day_id).first()
    if not day:
        raise HTTPException(status_code=404, detail="Working day not found")
    return day

@router.delete("/day/{day_id}")
def delete_day(day_id: int, db: Session = Depends(get_db)):
    day = db.query(models.WorkingDay).filter(models.WorkingDay.id == day_id).first()
    if not day:
        raise HTTPException(status_code=404, detail="Working day not found")
    
    # Entferne alle Verbindungen zu Übungen (many-to-many)
    day.exercises.clear()
    
    # Lösche den Tag
    db.delete(day)
    db.commit()
    return {"message": "Working day successfully deleted"}

# Update WorkingDay (for completed sets)
@router.put("/day/{day_id}", response_model=schemas.WorkingDayRead)
def update_day(day_id: int, day_update: schemas.WorkingDayUpdate, db: Session = Depends(get_db)):
    db_day = db.query(models.WorkingDay).filter(models.WorkingDay.id == day_id).first()
    if not db_day:
        raise HTTPException(status_code=404, detail="Working day not found")
    
    for field, value in day_update.dict(exclude_unset=True).items():
        setattr(db_day, field, value)
    
    db.commit()
    db.refresh(db_day)
    return db_day

# Update Exercise (for completed sets and workout results)
@router.put("/exercise/{exercise_id}", response_model=schemas.ExerciseRead)
def update_exercise(exercise_id: int, exercise_update: schemas.ExerciseUpdate, db: Session = Depends(get_db)):
    db_exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not db_exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    for field, value in exercise_update.dict(exclude_unset=True).items():
        setattr(db_exercise, field, value)
    
    # Update statistics if this was a workout completion
    if exercise_update.sets_completed is not None or exercise_update.first_set_weight is not None:
        stats = db.query(models.ExerciseStatistics).filter(
            models.ExerciseStatistics.exercise_id == exercise_id
        ).first()
        
        if not stats:
            stats = models.ExerciseStatistics(exercise_id=exercise_id)
            db.add(stats)
        
        # Update total workouts if sets were completed
        if exercise_update.sets_completed is not None and exercise_update.sets_completed > 0:
            stats.total_workouts = (stats.total_workouts or 0) + 1
            stats.last_workout_date = func.now()
    
    db.commit()
    db.refresh(db_exercise)
    return db_exercise

# Add exercises to a WorkingDay
@router.post("/day/{day_id}/exercises", response_model=schemas.WorkingDayRead)
def add_exercises_to_day(day_id: int, exercise_ids: List[int], db: Session = Depends(get_db)):
    db_day = db.query(models.WorkingDay).filter(models.WorkingDay.id == day_id).first()
    if not db_day:
        raise HTTPException(status_code=404, detail="Working day not found")
    
    # Get existing exercise IDs to avoid duplicates
    existing_exercise_ids = [ex.id for ex in db_day.exercises]
    
    # Add only new exercises
    new_exercise_ids = [ex_id for ex_id in exercise_ids if ex_id not in existing_exercise_ids]
    if new_exercise_ids:
        new_exercises = db.query(models.Exercise).filter(models.Exercise.id.in_(new_exercise_ids)).all()
        db_day.exercises.extend(new_exercises)
        db.commit()
        db.refresh(db_day)
    
    return db_day

# Remove exercises from a WorkingDay
@router.delete("/day/{day_id}/exercises", response_model=schemas.WorkingDayRead)
def remove_exercises_from_day(day_id: int, exercise_ids: List[int], db: Session = Depends(get_db)):
    db_day = db.query(models.WorkingDay).filter(models.WorkingDay.id == day_id).first()
    if not db_day:
        raise HTTPException(status_code=404, detail="Working day not found")
    
    # Remove exercises from the WorkingDay
    exercises_to_remove = [ex for ex in db_day.exercises if ex.id in exercise_ids]
    for exercise in exercises_to_remove:
        db_day.exercises.remove(exercise)
    
    db.commit()
    db.refresh(db_day)
    return db_day

# === Statistics ===
@router.get("/statistics/", response_model=schemas.OverallStatistics)
def get_statistics(db: Session = Depends(get_db)):
    # Simple implementation without external service for now
    total_workouts = db.query(models.WorkingDay).count()
    exercises = db.query(models.Exercise).all()
    
    # Create basic statistics
    workout_stats = schemas.WorkoutStatistics(
        total_workouts=total_workouts,
        weekly_workouts=total_workouts,  # Simplified
        monthly_workouts=total_workouts,  # Simplified
        last_three_workouts=[]
    )
    
    exercise_frequencies = []
    exercise_stats = []
    
    for exercise in exercises:
        # Basic frequency counting
        frequency = db.query(models.WorkingDay).join(
            models.working_day_exercise
        ).filter(
            models.working_day_exercise.c.exercise_id == exercise.id
        ).count()
        
        if frequency > 0:
            exercise_frequencies.append(schemas.ExerciseFrequency(
                exercise_id=exercise.id,
                exercise_title=exercise.title,
                frequency=frequency
            ))
        
        exercise_stats.append(schemas.ExerciseStatisticsRead(
            exercise_id=exercise.id,
            exercise_title=exercise.title,
            total_workouts=frequency,
            weight_progression=[],
            last_workout_date=None
        ))
    
    return schemas.OverallStatistics(
        workout_stats=workout_stats,
        exercise_frequencies=exercise_frequencies,
        exercise_stats=exercise_stats
    )

@router.get("/statistics/exercise/{exercise_id}", response_model=schemas.ExerciseStatisticsRead)
def get_exercise_statistics(exercise_id: int, db: Session = Depends(get_db)):
    stats_service = StatisticsService(db)
    stats_service = StatisticsService(db)
    try:
        return stats_service.get_exercise_statistics(exercise_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/statistics/exercise-frequency", response_model=List[schemas.ExerciseFrequency])
def get_exercise_frequency(days: int = 30, db: Session = Depends(get_db)):
    """Häufigkeit der Übungen in den letzten N Tagen"""
    stats_service = StatisticsService(db)
    return stats_service.get_exercise_frequency(days)

@router.get("/statistics/weight-progression/{exercise_id}", response_model=List[schemas.WeightProgressionPoint])
def get_weight_progression(exercise_id: int, limit: int = 20, db: Session = Depends(get_db)):
    """Gewichtsverlauf für eine bestimmte Übung"""
    stats_service = StatisticsService(db)
    return stats_service.get_weight_progression(exercise_id, limit)

@router.get("/statistics/workout-count", response_model=schemas.WorkoutStatistics)
def get_workout_statistics(db: Session = Depends(get_db)):
    """Working Day Zähler für verschiedene Zeiträume"""
    stats_service = StatisticsService(db)
    return stats_service.get_workout_count_statistics()