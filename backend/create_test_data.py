#!/usr/bin/env python3
"""
Script to create test data for the fitness app
"""
import sys
import os
sys.path.append(os.getcwd())

from database import SessionLocal
import models

def create_test_data():
    db = SessionLocal()
    
    try:
        print("Creating test data...")
        
        # Create a workout plan
        plan = models.WorkingPlan(
            title="Mein Trainingsplan",
            description="Ein Testplan für die Demo"
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)
        print(f"✓ Created workout plan: {plan.id}")
        
        # Create exercises
        exercises = [
            models.Exercise(title="Liegestütze", description="Klassische Liegestütze", 
                          sets_completed=3, first_set_weight=0, first_set_reps=15),
            models.Exercise(title="Kniebeugen", description="Bodyweight Squats",
                          sets_completed=3, first_set_weight=0, first_set_reps=20),
            models.Exercise(title="Bankdrücken", description="Mit Langhantel",
                          sets_completed=4, first_set_weight=60, first_set_reps=10),
            models.Exercise(title="Klimmzüge", description="Breiter Griff",
                          sets_completed=3, first_set_weight=0, first_set_reps=8),
            models.Exercise(title="Deadlifts", description="Kreuzheben",
                          sets_completed=3, first_set_weight=80, first_set_reps=6),
        ]
        
        for exercise in exercises:
            db.add(exercise)
        
        db.commit()
        
        for exercise in exercises:
            db.refresh(exercise)
            print(f"✓ Created exercise: {exercise.title} (ID: {exercise.id})")
        
        # Create working days
        days = [
            models.WorkingDay(day_number=1, title="Push Tag", description="Brust, Schultern, Trizeps", 
                            plan_id=plan.id, sets_completed=8),
            models.WorkingDay(day_number=2, title="Pull Tag", description="Rücken, Bizeps",
                            plan_id=plan.id, sets_completed=6),
            models.WorkingDay(day_number=3, title="Leg Tag", description="Beine, Gesäß",
                            plan_id=plan.id, sets_completed=9),
        ]
        
        for day in days:
            db.add(day)
        
        db.commit()
        
        for day in days:
            db.refresh(day)
            print(f"✓ Created working day: {day.title} (ID: {day.id})")
        
        # Associate exercises with days
        # Day 1 (Push): Liegestütze, Bankdrücken
        days[0].exercises.extend([exercises[0], exercises[2]])
        # Day 2 (Pull): Klimmzüge
        days[1].exercises.extend([exercises[3]])
        # Day 3 (Legs): Kniebeugen, Deadlifts
        days[2].exercises.extend([exercises[1], exercises[4]])
        
        db.commit()
        print("✓ Associated exercises with days")
        
        print("\n🎉 Test data created successfully!")
        print(f"Plan ID: {plan.id}")
        print("Working Days:")
        for day in days:
            print(f"  - Day {day.id}: {day.title}")
        print("Exercises:")
        for exercise in exercises:
            print(f"  - Exercise {exercise.id}: {exercise.title}")
            
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        db.rollback()
        
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()
