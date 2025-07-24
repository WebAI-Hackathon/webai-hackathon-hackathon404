# 🏋️‍♂️ Planetic Gym Backend - Vereinfachtes Datenmodell

Das Backend wurde vereinfacht, um mit nur 3 Haupttabellen zu arbeiten: **WorkingPlan**, **WorkingDay** und **Exercise**.

## 🚀 Vereinfachtes Datenmodell

### Core Entities

- **WorkingPlan** - Der Trainingsplan (z.B. "Ganzkörper-Training")
- **WorkingDay** - Ein Trainingstag im Plan (z.B. "Montag - Push")
- **Exercise** - Eine Übung mit ihren durchgeführten Werten

### Statistiken die verfügbar sind:

- ✅ **Wie oft welche Übung gemacht wurde** - basiert auf WorkingDays
- ✅ **Gewicht vom ersten Satz** - gespeichert in Exercise.first_set_weight
- ✅ **Anzahl der Workouts** (WorkingDays)
- ✅ **Workout Verlauf** (letzten WorkingDays)

## 📊 Datenmodell Details

### Exercise

```python
class Exercise:
    id: int
    title: str                    # "Bankdrücken"
    description: str             # "Brust-Übung mit der Langhantel"
    sets_completed: int          # Anzahl der Sets die gemacht wurde
    first_set_weight: float      # Gewicht vom ersten Satz (in kg)
    first_set_reps: int          # Wiederholungen vom ersten Satz
```

### WorkingDay

```python
class WorkingDay:
    id: int
    day_number: int              # 1-7 für Wochentage
    title: str                   # "Montag - Push"
    description: str             # "Brust und Schultern"
    plan_id: int                 # Referenz zum WorkingPlan
    sets_completed: int          # Anzahl der Sets die am WorkingDay gemacht wurden
    exercises: List[Exercise]    # Many-to-many zu Exercises
```

### WorkingPlan

```python
class WorkingPlan:
    id: int
    title: str                   # "Ganzkörper-Training"
    description: str             # "3x pro Woche Ganzkörper-Workout"
    created_at: datetime
    days: List[WorkingDay]       # Ein Plan kann mehrere Trainingstage haben
```

## 📊 API Endpunkte

### Grundlegende CRUD

```
POST /api/training/exercise/        # Exercise erstellen
GET  /api/training/exercise/        # Alle Exercises
GET  /api/training/exercise/{id}    # Einzelne Exercise

POST /api/training/plan/           # Plan erstellen
GET  /api/training/plan/           # Alle Pläne
GET  /api/training/plan/{id}       # Einzelner Plan

POST /api/training/day/            # WorkingDay erstellen
GET  /api/training/day/            # Alle WorkingDays
GET  /api/training/day/{id}        # Einzelner WorkingDay
```

### Statistiken

```
GET /api/training/statistics/                           # Alle Statistiken
GET /api/training/statistics/exercise-frequency         # Exercise Häufigkeit
GET /api/training/statistics/weight-progression/{id}    # Gewichtsverlauf
GET /api/training/statistics/workout-count              # WorkingDay Zähler
GET /api/training/statistics/exercise/{id}              # Exercise Statistiken
```

## 🧪 Backend testen

```bash
# Backend starten
uvicorn backend.main:app --reload

# Test ausführen
python test_backend.py
```

Das Test-Script erstellt:

- 3 Sample-Exercises (Bankdrücken, Kniebeugen, Klimmzüge) mit Gewicht/Reps
- 1 Trainingsplan ("Ganzkörper-Training")
- 3 WorkingDays (Montag-Push, Mittwoch-Pull, Freitag-Legs)
- Testet alle Statistics-Endpunkte

## 💡 Änderungen

### Entfernt

- ❌ `Workout` und `WorkoutExercise` Tabellen
- ❌ `muscle_group`, `equipment` aus Exercise
- ❌ `default_sets`, `default_reps` aus Exercise
- ❌ `max_weight`, `last_weight`, `updated_at` aus ExerciseStatistics

### Hinzugefügt

- ✅ `sets_completed`, `first_set_weight`, `first_set_reps` in Exercise
- ✅ `sets_completed` in WorkingDay
- ✅ `created_at` in WorkingPlan

### Vereinfacht

- ✅ Statistiken basieren auf WorkingDays statt Workouts
- ✅ Gewichtsprogression basiert auf Exercise.first_set_weight
- ✅ Weniger komplexe Relationships

## 🎯 Frontend Integration

Du kannst jetzt folgende Daten anzeigen:

```typescript
// Exercise mit Gewicht/Reps erstellen
const exercise = {
  title: "Bankdrücken",
  description: "Brust-Übung",
  sets_completed: 3,
  first_set_weight: 60.0,
  first_set_reps: 10,
};

// WorkingDay mit Exercises erstellen
const workingDay = {
  day_number: 1,
  title: "Montag - Push",
  plan_id: 1,
  sets_completed: 9,
  exercise_ids: [1, 2], // Bankdrücken + andere Exercise
};

// Statistiken abrufen
const stats = await fetch("/api/training/statistics/").then((r) => r.json());
```

Das vereinfachte Backend ist jetzt bereit! 🚀
