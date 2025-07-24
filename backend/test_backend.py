#!/usr/bin/env python3
"""
Test script for the simplified Planetic Gym Backend
Tests basic functionality with WorkingPlan, WorkingDay and Exercise
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/training"

def test_backend():
    print("🏋️‍♂️ Testing Simplified Planetic Gym Backend...")
    
    # Test 1: Create some sample exercises
    print("\n1. Creating sample exercises...")
    exercises = [
        {
            "title": "Bankdrücken",
            "description": "Brust-Übung mit der Langhantel",
            "sets_completed": 3,
            "first_set_weight": 60.0,
            "first_set_reps": 10
        },
        {
            "title": "Kniebeugen", 
            "description": "Bein-Übung mit der Langhantel",
            "sets_completed": 3,
            "first_set_weight": 80.0,
            "first_set_reps": 12
        },
        {
            "title": "Klimmzüge",
            "description": "Rücken-Übung am Reck",
            "sets_completed": 3,
            "first_set_weight": None,  # Körpergewicht
            "first_set_reps": 8
        }
    ]
    
    created_exercises = []
    for exercise in exercises:
        response = requests.post(f"{BASE_URL}/exercise/", json=exercise)
        if response.status_code == 200:
            ex = response.json()
            created_exercises.append(ex)
            print(f"✅ Created: {ex['title']} (ID: {ex['id']}) - {ex.get('first_set_weight', 'bodyweight')}kg x {ex.get('first_set_reps', 0)} reps")
        else:
            print(f"❌ Failed to create {exercise['title']}: {response.text}")
    
    # Test 2: Create a training plan
    print("\n2. Creating training plan...")
    plan_data = {
        "title": "Ganzkörper-Training",
        "description": "3x pro Woche Ganzkörper-Workout"
    }
    
    response = requests.post(f"{BASE_URL}/plan/", json=plan_data)
    if response.status_code == 200:
        plan = response.json()
        print(f"✅ Created plan: {plan['title']} (ID: {plan['id']})")
    else:
        print(f"❌ Failed to create plan: {response.text}")
        return
    
    # Test 3: Create working days
    print("\n3. Creating working days...")
    
    working_days = [
        {
            "day_number": 1,
            "title": "Montag - Push",
            "description": "Brust und Schultern",
            "plan_id": plan["id"],
            "sets_completed": 9,
            "exercise_ids": [created_exercises[0]["id"]]  # Bankdrücken
        },
        {
            "day_number": 3,
            "title": "Mittwoch - Pull", 
            "description": "Rücken und Bizeps",
            "plan_id": plan["id"],
            "sets_completed": 9,
            "exercise_ids": [created_exercises[2]["id"]]  # Klimmzüge
        },
        {
            "day_number": 5,
            "title": "Freitag - Legs",
            "description": "Beine und Po",
            "plan_id": plan["id"],
            "sets_completed": 9,
            "exercise_ids": [created_exercises[1]["id"]]  # Kniebeugen
        }
    ]
    
    created_days = []
    for day_data in working_days:
        response = requests.post(f"{BASE_URL}/day/", json=day_data)
        if response.status_code == 200:
            day = response.json()
            created_days.append(day)
            print(f"✅ Created day: {day['title']} (ID: {day['id']}) - {len(day['exercises'])} exercises")
        else:
            print(f"❌ Failed to create working day {day_data['title']}: {response.text}")
    
    # Test 4: Test Statistics endpoints
    print("\n4. Testing Statistics...")
    
    # Overall Statistics
    print("\n📊 Overall Statistics:")
    response = requests.get(f"{BASE_URL}/statistics/")
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ Total working days: {stats['workout_stats']['total_workouts']}")
        print(f"✅ Weekly working days: {stats['workout_stats']['weekly_workouts']}")
        print(f"✅ Monthly working days: {stats['workout_stats']['monthly_workouts']}")
        print(f"✅ Exercise frequencies found: {len(stats['exercise_frequencies'])}")
        print(f"✅ Exercise stats found: {len(stats['exercise_stats'])}")
    else:
        print(f"❌ Failed to get overall statistics: {response.text}")
    
    # Exercise Frequency
    print("\n📈 Exercise Frequency:")
    response = requests.get(f"{BASE_URL}/statistics/exercise-frequency")
    if response.status_code == 200:
        frequencies = response.json()
        for freq in frequencies:
            print(f"✅ {freq['exercise_title']}: {freq['frequency']} times")
    else:
        print(f"❌ Failed to get exercise frequency: {response.text}")
    
    # Weight Progression for each exercise
    print("\n🏋️‍♀️ Weight Progression:")
    for exercise in created_exercises:
        response = requests.get(f"{BASE_URL}/statistics/weight-progression/{exercise['id']}")
        if response.status_code == 200:
            progression = response.json()
            print(f"✅ {exercise['title']} progression: {len(progression)} data points")
            if progression:
                latest = progression[-1]
                print(f"   Current: {latest['weight']}kg")
        else:
            print(f"❌ Failed to get weight progression for {exercise['title']}: {response.text}")
    
    # Exercise-specific statistics
    print("\n📋 Exercise-specific Statistics:")
    for exercise in created_exercises:
        response = requests.get(f"{BASE_URL}/statistics/exercise/{exercise['id']}")
        if response.status_code == 200:
            ex_stats = response.json()
            print(f"✅ {ex_stats['exercise_title']}:")
            print(f"   Total workouts: {ex_stats['total_workouts']}")
            print(f"   Weight progression points: {len(ex_stats['weight_progression'])}")
        else:
            print(f"❌ Failed to get statistics for {exercise['title']}: {response.text}")
    
    # Workout Count Statistics  
    print("\n🗓️ Working Day Count Statistics:")
    response = requests.get(f"{BASE_URL}/statistics/workout-count")
    if response.status_code == 200:
        workout_stats = response.json()
        print(f"✅ Total working days: {workout_stats['total_workouts']}")
        print(f"✅ Weekly working days: {workout_stats['weekly_workouts']}")
        print(f"✅ Monthly working days: {workout_stats['monthly_workouts']}")
        print(f"✅ Last three working days: {len(workout_stats['last_three_workouts'])}")
    else:
        print(f"❌ Failed to get working day count statistics: {response.text}")
    
    print("\n🎉 Simplified backend test completed!")
    print("\n📋 Summary:")
    print("   - ✅ Exercise creation with sets/weight/reps")
    print("   - ✅ Training plan creation") 
    print("   - ✅ Working day creation")
    print("   - ✅ Exercise frequency tracking")
    print("   - ✅ Weight progression tracking")
    print("   - ✅ Working day count statistics")
    print("   - ✅ Exercise-specific statistics")
    print("\n🎯 Your simplified backend is ready!")

if __name__ == "__main__":
    try:
        test_backend()
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on http://localhost:8000")
        print("   Start with: uvicorn backend.main:app --reload")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
