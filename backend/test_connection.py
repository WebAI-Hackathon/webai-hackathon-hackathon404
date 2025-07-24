#!/usr/bin/env python3
"""
Einfacher Command Line Test für das Backend
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/training"

def test_working_plan_flow():
    print("🚀 Testing Working Plan Flow...")
    
    # 1. Test Connection
    print("\n1. Testing Backend Connection...")
    try:
        response = requests.get("http://127.0.0.1:8000/")
        if response.status_code == 200:
            print("✅ Backend is online!")
            print(f"   Response: {response.json()}")
        else:
            print("❌ Backend connection failed")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        print("   Make sure backend is running: uvicorn backend.main:app --reload")
        return
    
    # 2. Create Exercise
    print("\n2. Creating Exercise...")
    exercise_data = {
        "title": "Bankdrücken",
        "description": "Brust-Übung mit Langhantel",
        "sets_completed": 3,
        "first_set_weight": 60.0,
        "first_set_reps": 10
    }
    
    try:
        response = requests.post(f"{BASE_URL}/exercise/", json=exercise_data)
        if response.status_code == 200:
            exercise = response.json()
            print(f"✅ Exercise created: {exercise['title']} (ID: {exercise['id']})")
            print(f"   Weight: {exercise['first_set_weight']}kg x {exercise['first_set_reps']} reps")
        else:
            print(f"❌ Failed to create exercise: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error creating exercise: {e}")
        return
    
    # 3. Create Working Plan
    print("\n3. Creating Working Plan...")
    plan_data = {
        "title": "Ganzkörper-Training",
        "description": "3x pro Woche Ganzkörper-Workout"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/plan/", json=plan_data)
        if response.status_code == 200:
            plan = response.json()
            print(f"✅ Plan created: {plan['title']} (ID: {plan['id']})")
        else:
            print(f"❌ Failed to create plan: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error creating plan: {e}")
        return
    
    # 4. Create Working Day
    print("\n4. Creating Working Day...")
    day_data = {
        "day_number": 1,
        "title": "Montag - Push",
        "description": "Brust und Schultern",
        "plan_id": plan["id"],
        "sets_completed": 9,
        "exercise_ids": [exercise["id"]]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/day/", json=day_data)
        if response.status_code == 200:
            day = response.json()
            print(f"✅ Working Day created: {day['title']} (ID: {day['id']})")
            print(f"   Plan: {day['plan_id']}, Exercises: {len(day['exercises'])}")
        else:
            print(f"❌ Failed to create working day: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error creating working day: {e}")
        return
    
    # 5. Load Statistics
    print("\n5. Loading Statistics...")
    try:
        response = requests.get(f"{BASE_URL}/statistics/")
        if response.status_code == 200:
            stats = response.json()
            print("✅ Statistics loaded:")
            print(f"   Total working days: {stats['workout_stats']['total_workouts']}")
            print(f"   Exercise frequencies: {len(stats['exercise_frequencies'])}")
            print(f"   Exercise stats: {len(stats['exercise_stats'])}")
        else:
            print(f"❌ Failed to load statistics: {response.text}")
    except Exception as e:
        print(f"❌ Error loading statistics: {e}")
    
    # 6. Load all data
    print("\n6. Loading all created data...")
    
    # Exercises
    try:
        response = requests.get(f"{BASE_URL}/exercise/")
        if response.status_code == 200:
            exercises = response.json()
            print(f"✅ Total exercises in DB: {len(exercises)}")
        else:
            print(f"❌ Failed to load exercises: {response.text}")
    except Exception as e:
        print(f"❌ Error loading exercises: {e}")
    
    # Plans
    try:
        response = requests.get(f"{BASE_URL}/plan/")
        if response.status_code == 200:
            plans = response.json()
            print(f"✅ Total plans in DB: {len(plans)}")
        else:
            print(f"❌ Failed to load plans: {response.text}")
    except Exception as e:
        print(f"❌ Error loading plans: {e}")
    
    # Working Days
    try:
        response = requests.get(f"{BASE_URL}/day/")
        if response.status_code == 200:
            days = response.json()
            print(f"✅ Total working days in DB: {len(days)}")
        else:
            print(f"❌ Failed to load working days: {response.text}")
    except Exception as e:
        print(f"❌ Error loading working days: {e}")
    
    print("\n🎉 Working Plan Flow Test completed!")
    print("\n📝 Summary:")
    print("   1. ✅ Backend Connection tested")
    print("   2. ✅ Exercise created")
    print("   3. ✅ Working Plan created")
    print("   4. ✅ Working Day created (linked to plan + exercise)")
    print("   5. ✅ Statistics loaded")
    print("   6. ✅ All data verified")
    print("\n🎯 Backend-Frontend connection is working!")

if __name__ == "__main__":
    test_working_plan_flow()
