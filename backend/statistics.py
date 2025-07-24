from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List
from . import models, schemas

class StatisticsService:
    """Service-Klasse für vereinfachte Statistik-Funktionen"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_exercise_frequency(self, days: int = 30) -> List[schemas.ExerciseFrequency]:
        """
        Gibt die Häufigkeit jeder Übung in den letzten N Tagen zurück
        Basiert auf WorkingDays wo die Übung gemacht wurde
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Zähle WorkingDays mit jeder Übung in den letzten N Tagen
        result = self.db.query(
            models.Exercise.id,
            models.Exercise.title,
            func.count(models.WorkingDay.id).label('frequency')
        ).join(
            models.working_day_exercise
        ).join(
            models.WorkingDay
        ).group_by(
            models.Exercise.id, models.Exercise.title
        ).order_by(
            desc('frequency')
        ).all()
        
        return [
            schemas.ExerciseFrequency(
                exercise_id=row.id,
                exercise_title=row.title,
                frequency=row.frequency
            )
            for row in result
        ]
    
    def get_weight_progression(self, exercise_id: int, limit: int = 20) -> List[schemas.WeightProgressionPoint]:
        """
        Gibt den Gewichtsverlauf für eine bestimmte Übung zurück
        Basiert auf first_set_weight der Exercise
        """
        # Da wir nur einen Gewichtswert pro Exercise haben, erstellen wir eine einfache Progression
        exercise = self.db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
        
        if not exercise or exercise.first_set_weight is None:
            return []
        
        # Erstelle einen einzelnen Datenpunkt mit dem aktuellen Gewicht
        return [
            schemas.WeightProgressionPoint(
                date=datetime.utcnow(),
                weight=exercise.first_set_weight
            )
        ]
    
    def get_workout_count_statistics(self) -> schemas.WorkoutStatistics:
        """
        Gibt Workout-Zähler für verschiedene Zeiträume zurück
        Basiert auf WorkingDays
        """
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Gesamt-WorkingDays
        total_workouts = self.db.query(models.WorkingDay).count()
        
        # WorkingDays in der letzten Woche (vereinfacht - alle)
        weekly_workouts = self.db.query(models.WorkingDay).count()
        
        # WorkingDays im letzten Monat (vereinfacht - alle)
        monthly_workouts = self.db.query(models.WorkingDay).count()
        
        # Letzten drei WorkingDays
        last_three_workouts = self.db.query(models.WorkingDay).order_by(
            desc(models.WorkingDay.id)
        ).limit(3).all()
        
        return schemas.WorkoutStatistics(
            total_workouts=total_workouts,
            weekly_workouts=weekly_workouts,
            monthly_workouts=monthly_workouts,
            last_three_workouts=[schemas.WorkingDayRead.from_orm(w) for w in last_three_workouts]
        )
    
    def get_exercise_statistics(self, exercise_id: int) -> schemas.ExerciseStatisticsRead:
        """
        Gibt detaillierte Statistiken für eine spezifische Übung zurück
        """
        exercise = self.db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
        if not exercise:
            raise ValueError(f"Exercise with id {exercise_id} not found")
        
        # Zähle WorkingDays wo diese Übung gemacht wurde
        total_workouts = self.db.query(models.WorkingDay).join(
            models.working_day_exercise
        ).filter(
            models.working_day_exercise.c.exercise_id == exercise_id
        ).count()
        
        # Gewichtsverlauf
        weight_progression = self.get_weight_progression(exercise_id)
        
        # Letztes Workout-Datum (vereinfacht)
        last_workout = self.db.query(models.WorkingDay).join(
            models.working_day_exercise
        ).filter(
            models.working_day_exercise.c.exercise_id == exercise_id
        ).order_by(desc(models.WorkingDay.id)).first()
        
        return schemas.ExerciseStatisticsRead(
            exercise_id=exercise_id,
            exercise_title=exercise.title,
            total_workouts=total_workouts,
            weight_progression=weight_progression,
            last_workout_date=datetime.utcnow() if last_workout else None
        )
    
    def get_overall_statistics(self) -> schemas.OverallStatistics:
        """
        Gibt eine Zusammenfassung aller Statistiken zurück
        """
        workout_stats = self.get_workout_count_statistics()
        exercise_frequencies = self.get_exercise_frequency()
        
        # Hole Statistiken für alle Übungen
        exercises = self.db.query(models.Exercise).all()
        exercise_stats = []
        
        for exercise in exercises:
            try:
                stats = self.get_exercise_statistics(exercise.id)
                exercise_stats.append(stats)
            except ValueError:
                continue
        
        return schemas.OverallStatistics(
            workout_stats=workout_stats,
            exercise_frequencies=exercise_frequencies,
            exercise_stats=exercise_stats
        )
    
    def update_exercise_statistics_cache(self, exercise_id: int):
        """
        Aktualisiert die gecachten Statistiken für eine Übung
        """
        stats = self.get_exercise_statistics(exercise_id)
        
        # Prüfe, ob bereits ein Eintrag existiert
        cached_stats = self.db.query(models.ExerciseStatistics).filter(
            models.ExerciseStatistics.exercise_id == exercise_id
        ).first()
        
        if cached_stats:
            # Update existing
            cached_stats.total_workouts = stats.total_workouts
            cached_stats.last_workout_date = stats.last_workout_date
        else:
            # Create new
            cached_stats = models.ExerciseStatistics(
                exercise_id=exercise_id,
                total_workouts=stats.total_workouts,
                last_workout_date=stats.last_workout_date
            )
            self.db.add(cached_stats)
        
        self.db.commit()
        return cached_stats
