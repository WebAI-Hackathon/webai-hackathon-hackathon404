from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class WorkingPlan(Base):
    __tablename__ = "working_plan"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=True)

class WorkingDay(Base):
    __tablename__ = "working_day"
    id = Column(Integer, primary_key=True, index=True)
    day_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    plan_id = Column(Integer, ForeignKey("working_plan.id"), nullable=False)

    plan = relationship("WorkingPlan", back_populates="days")
    exercises = relationship("Exercise", secondary="working_day_exercise", back_populates="days")

class Excercise(Base):
    __tablename__ = "exercise"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    repetitions = Column(Integer, nullable=True) # Number of repetitions for the exercise per set, save the reps of first set
    sets = Column(Integer, nullable=True) # Number of sets for the exercise
    weights = Column(Integer, nullable=True) # save 

    days = relationship("WorkingDay", secondary="working_day_exercise", back_populates="exercises")


