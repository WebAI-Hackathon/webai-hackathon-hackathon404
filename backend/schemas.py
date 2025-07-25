from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# === Exercise ===
class ExerciseBase(BaseModel):
    title: str
    description: Optional[str] = None
    sets_completed: Optional[int] = None
    first_set_weight: Optional[float] = None
    first_set_reps: Optional[int] = None

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sets_completed: Optional[int] = None
    first_set_weight: Optional[float] = None
    first_set_reps: Optional[int] = None

class ExerciseRead(ExerciseBase):
    id: int
    
    class Config:
        from_attributes = True

# === WorkingDay ===
class WorkingDayBase(BaseModel):
    day_number: int
    title: str
    description: Optional[str] = None
    sets_completed: Optional[int] = None

class WorkingDayCreate(WorkingDayBase):
    plan_id: int
    exercise_ids: Optional[List[int]] = []

class WorkingDayUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sets_completed: Optional[int] = None

class WorkingDayRead(WorkingDayBase):
    id: int
    plan_id: int
    exercises: List[ExerciseRead] = []
    
    class Config:
        from_attributes = True

# === WorkingPlan ===
class WorkingPlanBase(BaseModel):
    title: str = "Mein Trainingsplan"
    description: Optional[str] = None

class WorkingPlanCreate(WorkingPlanBase):
    pass

class WorkingPlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class WorkingPlanRead(WorkingPlanBase):
    id: int
    created_at: datetime
    days: List[WorkingDayRead] = []
    
    class Config:
        from_attributes = True

# === Statistics Schemas ===
class WeightProgressionPoint(BaseModel):
    date: datetime
    weight: float

class ExerciseFrequency(BaseModel):
    exercise_id: int
    exercise_title: str
    frequency: int

class ExerciseStatisticsRead(BaseModel):
    exercise_id: int
    exercise_title: str
    total_workouts: int
    weight_progression: List[WeightProgressionPoint] = []
    last_workout_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class WorkoutStatistics(BaseModel):
    total_workouts: int
    weekly_workouts: int
    monthly_workouts: int
    last_three_workouts: List[WorkingDayRead] = []

class OverallStatistics(BaseModel):
    workout_stats: WorkoutStatistics
    exercise_frequencies: List[ExerciseFrequency] = []
    exercise_stats: List[ExerciseStatisticsRead] = []
