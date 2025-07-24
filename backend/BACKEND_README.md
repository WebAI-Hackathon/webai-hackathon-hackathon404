# 🏋️‍♂️ Planetic Gym Backend - Statistiken API

Das Backend wurde überarbeitet, um umfassende Statistiken für dein Fitness-Tracking zu bieten.

## 🚀 Hauptmerkmale

### Statistiken die jetzt verfügbar sind:

- ✅ **Wie oft welche Übung gemacht wurde** - Exercise Frequency
- ✅ **Gewicht Steigerung/Senkung für jede Übung** - Weight Progression
- ✅ **Anzahl der Workouts** (wöchentlich, monatlich, gesamt) - Workout Count
- ✅ **Workout Verlauf** (letzten drei Workouts) - Recent Workouts

## 📊 API Endpunkte für Statistiken

### Allgemeine Statistiken

```
GET /api/training/statistics/
```

Gibt eine Zusammenfassung aller Statistiken zurück (Workout-Zähler, Exercise-Häufigkeiten, Exercise-Statistiken)

### Exercise Frequency

```
GET /api/training/statistics/exercise-frequency?days=30
```

Zeigt wie oft jede Übung in den letzten N Tagen gemacht wurde.

**Response:**

```json
[
  {
    "exercise_id": 1,
    "exercise_title": "Bankdrücken",
    "muscle_group": "Brust",
    "frequency": 8
  }
]
```

### Weight Progression

```
GET /api/training/statistics/weight-progression/{exercise_id}?limit=20
```

Gewichtsverlauf für eine bestimmte Übung (chronologisch sortiert).

**Response:**

```json
[
  {
    "date": "2025-07-17T10:30:00Z",
    "weight": 60.0
  },
  {
    "date": "2025-07-20T11:00:00Z",
    "weight": 62.5
  }
]
```

### Workout Count Statistics

```
GET /api/training/statistics/workout-count
```

Workout-Zähler für verschiedene Zeiträume.

**Response:**

```json
{
  "total_workouts": 25,
  "weekly_workouts": 3,
  "monthly_workouts": 12,
  "last_three_workouts": [
    {
      "id": 10,
      "workout_date": "2025-07-24T...",
      "duration_minutes": 65,
      "exercises": [...]
    }
  ]
}
```

### Exercise-specific Statistics

```
GET /api/training/statistics/exercise/{exercise_id}
```

Detaillierte Statistiken für eine bestimmte Übung.

**Response:**

```json
{
  "exercise_id": 1,
  "exercise_title": "Bankdrücken",
  "total_workouts": 8,
  "max_weight": 75.0,
  "last_weight": 72.5,
  "weight_progression": [
    { "date": "2025-07-17T...", "weight": 60.0 },
    { "date": "2025-07-20T...", "weight": 62.5 }
  ],
  "last_workout_date": "2025-07-24T..."
}
```

## 🔧 Backend Änderungen

### Models.py

- ✅ Added `created_at` timestamp to `WorkoutExercise`
- ✅ Added `ExerciseStatistics` table for caching
- ✅ Improved relationships

### Statistics.py

- ✅ Komplett neu geschrieben
- ✅ `StatisticsService` class mit allen nötigen Methoden
- ✅ Typisierte Responses mit Pydantic Schemas

### Schemas.py

- ✅ Neue Statistics Schemas hinzugefügt:
  - `WeightProgressionPoint`
  - `ExerciseFrequency`
  - `ExerciseStatisticsRead`
  - `WorkoutStatistics`
  - `OverallStatistics`

### Training Router

- ✅ Alle Statistics Endpunkte hinzugefügt
- ✅ Workout creation updated statistics automatisch
- ✅ Error handling verbessert

## 🧪 Backend testen

Das Backend kann mit dem Test-Script getestet werden:

```bash
cd /Users/mithu/Documents/Hackathon/WebAI-Hackathon-TUDa/webai-hackathon-hackathon404

# Backend starten (in einem Terminal)
uvicorn backend.main:app --reload

# Test ausführen (in einem anderen Terminal)
python test_backend.py
```

Das Test-Script:

- Erstellt Sample-Übungen (Bankdrücken, Kniebeugen, Klimmzüge)
- Erstellt einen Trainingsplan
- Erstellt mehrere Workouts mit Gewichtssteigerung
- Testet alle Statistics-Endpunkte

## 💡 Frontend Integration

Für das Frontend kannst du jetzt folgende Statistiken anzeigen:

### Dashboard Komponenten

1. **Workout Summary Card**: Zeige weekly/monthly workout counts
2. **Exercise Frequency Chart**: Bar chart der beliebtesten Übungen
3. **Weight Progression Charts**: Line charts für jede Übung
4. **Recent Workouts List**: Zeige die letzten 3 Workouts

### Beispiel API Calls im Frontend:

```typescript
// Alle Statistiken laden
const stats = await fetch("/api/training/statistics/").then((r) => r.json());

// Exercise Frequency für Chart
const frequencies = await fetch(
  "/api/training/statistics/exercise-frequency?days=30"
).then((r) => r.json());

// Weight Progression für bestimmte Übung
const progression = await fetch(
  `/api/training/statistics/weight-progression/${exerciseId}`
).then((r) => r.json());
```

## 🎯 Nächste Schritte

Das Backend ist jetzt bereit! Du kannst:

1. Das Test-Script ausführen um alles zu validieren
2. Mit dem Frontend die Statistics Endpunkte integrieren
3. Charts und Dashboard Komponenten erstellen
4. Weitere Features hinzufügen (z.B. Personal Records, Muscle Group Distribution)

Alle gewünschten Statistiken sind implementiert und funktionsfähig! 🚀
