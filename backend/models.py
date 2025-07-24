from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Table, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# Association table for WorkingDay and Exercise (many-to-many)
working_day_exercise = Table(
    'working_day_exercise',
    Base.metadata,
    Column('working_day_id', Integer, ForeignKey('working_day.id'), primary_key=True),
    Column('exercise_id', Integer, ForeignKey('exercise.id'), primary_key=True)
)

class WorkingPlan(Base):
    __tablename__ = "working_plan"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, default="Mein Trainingsplan")
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    days = relationship("WorkingDay", back_populates="plan", cascade="all, delete-orphan")

class WorkingDay(Base):
    __tablename__ = "working_day"
    
    id = Column(Integer, primary_key=True, index=True)
    day_number = Column(Integer, nullable=False)  # 1-7 für Wochentage
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    plan_id = Column(Integer, ForeignKey("working_plan.id"), nullable=False)
    
    # Tatsächlich durchgeführte Werte - Sets die am WorkingDay gemacht wurden
    sets_completed = Column(Integer, nullable=True)  # Anzahl der Sets die gemacht wurde

    # Relationships
    plan = relationship("WorkingPlan", back_populates="days")
    exercises = relationship("Exercise", secondary=working_day_exercise, back_populates="days")

class Exercise(Base):
    __tablename__ = "exercise"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    # Tatsächlich durchgeführte Werte vom ersten Satz
    sets_completed = Column(Integer, nullable=True)  # Anzahl der Sets die gemacht wurde
    first_set_weight = Column(Float, nullable=True)  # Gewicht vom ersten Satz
    first_set_reps = Column(Integer, nullable=True)  # Wiederholungen vom ersten Satz
    
    # Relationships
    days = relationship("WorkingDay", secondary=working_day_exercise, back_populates="exercises")
    statistics = relationship("ExerciseStatistics", back_populates="exercise", uselist=False)

# Exercise Statistics (Caching von häufig abgefragten Statistiken)
class ExerciseStatistics(Base):
    __tablename__ = "exercise_statistics"
    
    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("exercise.id"), nullable=False, unique=True)
    
    # Cached statistics
    total_workouts = Column(Integer, default=0)
    last_workout_date = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    exercise = relationship("Exercise", back_populates="statistics")


