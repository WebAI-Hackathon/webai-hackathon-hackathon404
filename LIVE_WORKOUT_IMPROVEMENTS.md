# Live Workout - Datenbank-Integration

## Was wurde verbessert

Die LiveWorkout-Seite wurde erweitert, um mit der Datenbank zu arbeiten und die Trainingsergebnisse zu speichern.

### ✅ Neue Features

1. **Training aus Datenbank laden**

   - Trainingstage können über die URL-Parameter geladen werden: `/live-workout?dayId=123`
   - Button "Training aus Datenbank laden" für manuelle Auswahl
   - Übungen werden automatisch aus der Datenbank konvertiert

2. **Trainingsergebnisse speichern**

   - Alle Sets werden automatisch in der Datenbank gespeichert
   - Workout-Statistiken werden aktualisiert
   - Automatisches Speichern beim Workout-Abschluss

3. **Nahtlose Integration**
   - Fallback auf Mock-Daten wenn keine Datenbank-Verbindung
   - VOIX-Tools für Sprachsteuerung bleiben funktional
   - UI zeigt Status der Datenbank-Verbindung an

### 🔄 Backend-Erweiterungen

1. **Update-Endpunkte hinzugefügt**

   ```
   PUT /api/training/day/{day_id} - Working Day aktualisieren
   PUT /api/training/exercise/{exercise_id} - Exercise aktualisieren
   ```

2. **Neue Schemas**

   - `WorkingDayUpdate` - für Trainingstag-Updates
   - `ExerciseUpdate` - für Übungs-Updates

3. **Automatische Statistik-Updates**
   - ExerciseStatistics werden automatisch aktualisiert
   - Workout-Counter werden erhöht

### 🎯 Workflow

1. **Training starten von Trainingsplan**

   - Klick auf "Training starten" → Weiterleitung mit `dayId`
   - Automatisches Laden der Übungen aus der Datenbank

2. **Live Workout durchführen**

   - Normale Workout-Funktionen (Sets, Timer, etc.)
   - Alle Aktionen werden lokal gespeichert

3. **Ergebnisse speichern**
   - Automatisches Speichern beim "Stop" oder Workout-Ende
   - Working Day `sets_completed` wird aktualisiert
   - Jede Exercise bekommt `sets_completed`, `first_set_weight`, `first_set_reps`

### 🛠️ Verwendung

#### Aus Trainingsplan starten

```tsx
// Button in Trainingsplan.tsx leitet weiter mit dayId
window.location.href = `/live-workout?dayId=${day.id}`;
```

#### Manuell Training laden

- Button "📋 Training aus Datenbank laden"
- Eingabe der Trainingstag-ID
- Oder VOIX-Befehl: "Load working day with ID 123"

#### VOIX-Integration

```typescript
// Neue VOIX-Tools
load_working_day(dayId: number)
stop_workout // Speichert automatisch in Datenbank
```

### 📊 Datenbank-Struktur

Die bestehende Datenbank-Struktur wurde beibehalten:

- `WorkingPlan` → `WorkingDay` → `Exercise`
- `sets_completed` Felder für Tracking
- `ExerciseStatistics` für aggregierte Daten

### 🎨 UI-Verbesserungen

- Status-Anzeige: Datenbank vs. Mock-Training
- Grüne Bestätigung bei erfolgreichem Laden
- Error-Handling mit Benutzer-Feedback
- Loading-States für bessere UX

### 🔧 API-Service Erweiterung

```typescript
// Neue Methoden in api.ts
updateWorkingDay(dayId, updates);
updateExercise(exerciseId, updates);
```

Die Implementierung ist vollständig rückwärtskompatibel - bestehende Mock-Workouts funktionieren weiterhin ohne Datenbank-Verbindung.
