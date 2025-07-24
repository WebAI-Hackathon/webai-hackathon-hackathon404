from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class WorkingPlan(Base):
    __tablename__ = "working_plan"
    id = Column(Integer, primary_key=True, index=True)

    days = relationship("WorkingDay", back_populates="plan")

class WorkingDay(Base):
    __tablename__ = "working_day"
    id = Column(Integer, primary_key=True, index=True)
    day_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    plan_id = Column(Integer, ForeignKey("working_plan.id"), nullable=False)

    plan = relationship("WorkingPlan", back_populates="days")

class Exercise(Base):
    __tablename__ = "exercise"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)

