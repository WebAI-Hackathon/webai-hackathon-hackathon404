from pydantic import BaseModel
from typing import List, Optional

# === Exercise ===
class ExerciseBase(BaseModel):
    title: str
    description: str

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseRead(ExerciseBase):
    id: int
    class Config:
        orm_mode = True

# === WorkingDay ===
class WorkingDayBase(BaseModel):
    day_number: int
    title: str
    plan_id: int

class WorkingDayCreate(WorkingDayBase):
    pass

class WorkingDayRead(WorkingDayBase):
    id: int
    class Config:
        orm_mode = True

# === WorkingPlan ===
class WorkingPlanCreate(BaseModel):
    pass  # aktuell keine Felder

class WorkingPlanRead(BaseModel):
    id: int
    class Config:
        orm_mode = True
