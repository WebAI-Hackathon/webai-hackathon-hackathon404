import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Grid,
  Stack,
  Progress,
  Input,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { Tool } from "../components/Tool";
import { apiService } from "../services/api";
import type { WorkingDay, Exercise } from "../services/api";

// Frontend Types für Kompatibilität mit der UI
interface FrontendExercise {
  id?: number;
  name: string;
  repetitions: number;
  weight: number;
}

interface WorkoutSession {
  dayId?: number;
  dayTitle?: string;
  totalSetsCompleted?: number;
  exerciseResults: {
    [exerciseId: number]: {
      setsCompleted: number;
      lastWeight?: number;
      lastReps?: number;
    };
  };
}

const LiveWorkout = () => {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [pauseTimer, setPauseTimer] = useState(0);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [exerciseSets, setExerciseSets] = useState<{
    [key: number]: Array<{ reps: number; weight: number }>;
  }>({});
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set()
  );

  // Database related state
  const [workingDay, setWorkingDay] = useState<WorkingDay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession>({
    exerciseResults: {},
  });

  // Mock exercises (fallback)
  const [exercises, setExercises] = useState<FrontendExercise[]>([
    { name: "Jumping Jacks", weight: 0, repetitions: 30 },
    { name: "Push-ups", weight: 0, repetitions: 15 },
    { name: "Squats", weight: 20, repetitions: 12 },
    { name: "Plank", weight: 0, repetitions: 1 },
    { name: "Burpees", weight: 0, repetitions: 10 },
  ]);

  const [editingExercise, setEditingExercise] = useState<number | null>(null);
  const [tempWeight, setTempWeight] = useState(0);
  const [tempReps, setTempReps] = useState(0);

  // Exercise Management State
  const [isManageExercisesOpen, setIsManageExercisesOpen] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseTitle, setNewExerciseTitle] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");
  const [newExerciseWeight, setNewExerciseWeight] = useState(0);
  const [newExerciseReps, setNewExerciseReps] = useState(10);

  // Helper functions
  const convertBackendToFrontend = (
    exercises: Exercise[]
  ): FrontendExercise[] => {
    return exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.title,
      repetitions: exercise.first_set_reps || 10,
      weight: exercise.first_set_weight || 0,
    }));
  };

  // Exercise Management Functions
  const loadAllExercises = async () => {
    try {
      const exercises = await apiService.getExercises();
      setAllExercises(exercises);
    } catch (err) {
      console.error("Error loading exercises:", err);
      setError("Fehler beim Laden der Übungen");
    }
  };

  const createNewExercise = async () => {
    if (!newExerciseTitle.trim()) {
      setError("Übungsname ist erforderlich");
      return;
    }

    try {
      setIsLoading(true);
      const newExercise = await apiService.createExercise({
        title: newExerciseTitle,
        description: newExerciseDescription || undefined,
        first_set_weight: newExerciseWeight,
        first_set_reps: newExerciseReps,
      });

      // Update all exercises list
      await loadAllExercises();

      // Reset form
      setNewExerciseTitle("");
      setNewExerciseDescription("");
      setNewExerciseWeight(0);
      setNewExerciseReps(10);
      setIsAddingExercise(false);

      alert(`Neue Übung "${newExercise.title}" wurde erstellt!`);
    } catch (err) {
      console.error("Error creating exercise:", err);
      setError("Fehler beim Erstellen der Übung");
    } finally {
      setIsLoading(false);
    }
  };

  const addExerciseToWorkingDay = async (exerciseId: number) => {
    if (!workingDay?.id) {
      setError("Kein Training geladen");
      return;
    }

    try {
      setIsLoading(true);
      const updatedDay = await apiService.addExercisesToDay(workingDay.id, [exerciseId]);
      
      // Update working day and exercises
      setWorkingDay(updatedDay);
      const frontendExercises = convertBackendToFrontend(updatedDay.exercises);
      setExercises(frontendExercises);
      
      // Update all exercises list to reflect any changes
      await loadAllExercises();

      const addedExercise = allExercises.find(ex => ex.id === exerciseId);
      alert(`Übung "${addedExercise?.title || 'Unbekannt'}" wurde zum Training hinzugefügt!`);
    } catch (err) {
      console.error("Error adding exercise to day:", err);
      setError("Fehler beim Hinzufügen der Übung");
    } finally {
      setIsLoading(false);
    }
  };

  const removeExerciseFromWorkingDay = async (exerciseId: number) => {
    if (!workingDay?.id) {
      setError("Kein Training geladen");
      return;
    }

    const exerciseToRemove = exercises.find(ex => ex.id === exerciseId);
    const confirmRemove = window.confirm(
      `Möchten Sie die Übung "${exerciseToRemove?.name || 'Unbekannt'}" aus dem Training entfernen?`
    );

    if (!confirmRemove) return;

    try {
      setIsLoading(true);
      const updatedDay = await apiService.removeExercisesFromDay(workingDay.id, [exerciseId]);
      
      // Update working day and exercises
      setWorkingDay(updatedDay);
      const frontendExercises = convertBackendToFrontend(updatedDay.exercises);
      setExercises(frontendExercises);

      // If we removed the current exercise, adjust currentExercise index
      const removedExerciseIndex = exercises.findIndex(ex => ex.id === exerciseId);
      if (removedExerciseIndex === currentExercise && currentExercise > 0) {
        setCurrentExercise(currentExercise - 1);
      } else if (removedExerciseIndex < currentExercise) {
        setCurrentExercise(currentExercise - 1);
      }

      // Clear sets for the removed exercise
      const newSets = { ...exerciseSets };
      delete newSets[removedExerciseIndex];
      setExerciseSets(newSets);

      // Remove from completed exercises
      const newCompleted = new Set(completedExercises);
      newCompleted.delete(removedExerciseIndex);
      setCompletedExercises(newCompleted);

      alert(`Übung "${exerciseToRemove?.name || 'Unbekannt'}" wurde entfernt!`);
    } catch (err) {
      console.error("Error removing exercise from day:", err);
      setError("Fehler beim Entfernen der Übung");
    } finally {
      setIsLoading(false);
    }
  };

  const replaceExerciseInWorkingDay = async (oldExerciseId: number, newExerciseId: number) => {
    if (!workingDay?.id) {
      setError("Kein Training geladen");
      return;
    }

    const oldExercise = exercises.find(ex => ex.id === oldExerciseId);
    const newExercise = allExercises.find(ex => ex.id === newExerciseId);
    
    const confirmReplace = window.confirm(
      `Möchten Sie "${oldExercise?.name || 'Übung'}" durch "${newExercise?.title || 'neue Übung'}" ersetzen?`
    );

    if (!confirmReplace) return;

    try {
      setIsLoading(true);
      
      // Remove old exercise and add new one
      await apiService.removeExercisesFromDay(workingDay.id, [oldExerciseId]);
      const updatedDay = await apiService.addExercisesToDay(workingDay.id, [newExerciseId]);
      
      // Update working day and exercises
      setWorkingDay(updatedDay);
      const frontendExercises = convertBackendToFrontend(updatedDay.exercises);
      setExercises(frontendExercises);

      alert(`Übung "${oldExercise?.name || 'Übung'}" wurde durch "${newExercise?.title || 'neue Übung'}" ersetzt!`);
    } catch (err) {
      console.error("Error replacing exercise:", err);
      setError("Fehler beim Ersetzen der Übung");
    } finally {
      setIsLoading(false);
    }
  };

  // Load workout from database if dayId is provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dayId = urlParams.get("dayId");

    // Always load all exercises for exercise management
    loadAllExercises();

    if (dayId) {
      loadWorkingDay(parseInt(dayId));
    }
  }, []);

  // Function to handle training loading with workout check
  const handleLoadTraining = async () => {
    if (isWorkoutActive) {
      const confirmAction = window.confirm(
        "Ein Workout ist gerade aktiv! Möchten Sie das Workout beenden und ein neues Training laden?\n\nKlicken Sie 'OK', um das Workout zu beenden und ein neues Training zu laden, oder 'Abbrechen', um mit dem aktuellen Workout fortzufahren."
      );
      if (!confirmAction) {
        return; // User cancelled, stay with current workout
      }
      // Stop the current workout first
      await stopWorkout();
    }

    // Now load new training
    const dayId = prompt("Trainingstag-ID aus der Datenbank eingeben:");
    if (dayId) {
      loadWorkingDay(parseInt(dayId));
    }
  };

  const loadWorkingDay = async (dayId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading working day:", dayId);
      const day = await apiService.getWorkingDay(dayId);
      console.log("Loaded working day:", day);

      setWorkingDay(day);
      setWorkoutSession({
        dayId: day.id,
        dayTitle: day.title,
        totalSetsCompleted: 0,
        exerciseResults: {},
      });

      // Convert backend exercises to frontend format
      if (day.exercises && day.exercises.length > 0) {
        const frontendExercises = convertBackendToFrontend(day.exercises);
        setExercises(frontendExercises);
        console.log("Converted exercises:", frontendExercises);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Laden des Trainingstags"
      );
      console.error("Error loading working day:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save workout results to database
  const saveWorkoutResults = async () => {
    if (!workingDay || !workoutSession.dayId) {
      console.log("No working day or session to save");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Calculate total sets completed across all exercises
      const totalSets = Object.values(exerciseSets).reduce(
        (total, sets) => total + sets.length,
        0
      );

      console.log("Saving workout results:", {
        dayId: workoutSession.dayId,
        totalSets,
        exerciseResults: exerciseSets,
      });

      // Update working day
      await apiService.updateWorkingDay(workoutSession.dayId, {
        sets_completed: totalSets,
      });

      // Update each exercise with results
      for (const [exerciseIndex, sets] of Object.entries(exerciseSets)) {
        const exercise = exercises[parseInt(exerciseIndex)];
        if (exercise?.id && sets.length > 0) {
          // Use the best set (highest weight or most reps) as the first set data
          const bestSet = sets.reduce((best, current) => {
            if (current.weight > best.weight) return current;
            if (current.weight === best.weight && current.reps > best.reps)
              return current;
            return best;
          });

          await apiService.updateExercise(exercise.id, {
            sets_completed: sets.length,
            first_set_weight: bestSet.weight,
            first_set_reps: bestSet.reps,
          });

          console.log(`Updated exercise ${exercise.name}:`, {
            sets: sets.length,
            weight: bestSet.weight,
            reps: bestSet.reps,
          });
        }
      }

      console.log("Workout results saved successfully!");
      return true;
    } catch (err) {
      console.error("Error saving workout results:", err);
      setError("Fehler beim Speichern der Trainingsergebnisse");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete workout function for the dedicated button
  const completeWorkout = async () => {
    if (Object.keys(exerciseSets).length === 0) {
      setError("Keine Sätze aufgezeichnet. Führe mindestens einen Satz aus.");
      return;
    }

    if (!workingDay) {
      setError(
        "Kein Training aus der Datenbank geladen. Laden Sie zuerst ein Training, um die Ergebnisse zu speichern."
      );
      return;
    }

    // Clear any previous errors
    setError(null);

    const success = await saveWorkoutResults();
    if (success) {
      setIsWorkoutActive(false);
      setCurrentExercise(0);
      setIsPauseModalOpen(false);

      // Show detailed success message
      const totalSets = Object.values(exerciseSets).reduce(
        (total, sets) => total + sets.length,
        0
      );
      const exerciseCount = Object.keys(exerciseSets).length;

      alert(
        `Workout erfolgreich gespeichert! 🎉\n\n📊 Zusammenfassung:\n• ${totalSets} Sets aufgezeichnet\n• ${exerciseCount} Übungen trainiert\n• Training: ${workingDay.title}`
      );

      // Clear sets after successful save
      setExerciseSets({});
      setCompletedExercises(new Set());

      // Optionally redirect to statistics or home
      // window.location.href = "/statistiken";
    }
  };

  // Pause timer effect
  useEffect(() => {
    let interval: number;
    if (isPauseModalOpen && pauseTimer > 0) {
      interval = setInterval(() => {
        setPauseTimer(pauseTimer - 1);
      }, 1000);
    } else if (isPauseModalOpen && pauseTimer === 0) {
      setIsPauseModalOpen(false);
      setIsWorkoutActive(true);
    }
    return () => clearInterval(interval);
  }, [isPauseModalOpen, pauseTimer]);

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setCurrentExercise(0);
  };

  const pauseWorkout = (pauseTime?: number) => {
    setIsWorkoutActive(false);
    setPauseTimer(pauseTime || 30);
    setIsPauseModalOpen(true);
  };

  const stopWorkout = async () => {
    setIsWorkoutActive(false);
    setCurrentExercise(0);
    setIsPauseModalOpen(false);

    // Save results to database if we have a working day
    if (workingDay && Object.keys(exerciseSets).length > 0) {
      await saveWorkoutResults();
    }
  };

  const completeSet = () => {
    const newSets = { ...exerciseSets };
    if (!newSets[currentExercise]) {
      newSets[currentExercise] = [];
    }
    newSets[currentExercise].push({
      reps: exercises[currentExercise]?.repetitions || 0,
      weight: exercises[currentExercise]?.weight || 0,
    });
    setExerciseSets(newSets);
  };

  const nextExercise = () => {
    const newCompleted = new Set(completedExercises);
    newCompleted.add(currentExercise);
    setCompletedExercises(newCompleted);

    if (currentExercise < exercises.length - 1) {
      const nextIdx = currentExercise + 1;
      setCurrentExercise(nextIdx);
    } else {
      // All exercises completed - show completion message
      alert(
        "Alle Übungen abgeschlossen! 🎉 Vergiss nicht, dein Workout zu speichern!"
      );
      // Don't auto-save here, let user decide with the button
    }
  };

  const previousExercise = () => {
    if (currentExercise > 0) {
      const prevIdx = currentExercise - 1;
      setCurrentExercise(prevIdx);

      // Remove from completed if going back
      const newCompleted = new Set(completedExercises);
      newCompleted.delete(prevIdx);
      setCompletedExercises(newCompleted);
    }
  };

  const updateExercise = (index: number, weight: number, reps: number) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], weight, repetitions: reps };
    setExercises(newExercises);
  };

  const editSet = (
    exerciseIndex: number,
    setIndex: number,
    reps: number,
    weight: number
  ) => {
    const newSets = { ...exerciseSets };
    if (newSets[exerciseIndex] && newSets[exerciseIndex][setIndex]) {
      newSets[exerciseIndex][setIndex] = { reps, weight };
      setExerciseSets(newSets);
    }
  };

  const deleteSet = (exerciseIndex: number, setIndex: number) => {
    const newSets = { ...exerciseSets };
    if (newSets[exerciseIndex]) {
      newSets[exerciseIndex].splice(setIndex, 1);
      setExerciseSets(newSets);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const workoutProgressPercentage =
    (completedExercises.size / exercises.length) * 100;

  // VOIX Tool Handlers (behalten für Kompatibilität)
  const handleStartWorkout = (_event: Event) => {
    console.log("VOIX: Starting workout");
    startWorkout();
  };

  const handlePauseWorkout = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const pauseTime = details?.pauseTime || 30;
    console.log("VOIX: Pausing workout for", pauseTime, "seconds");
    pauseWorkout(pauseTime);
  };

  const handleStopWorkout = (_event: Event) => {
    console.log("VOIX: Stopping workout");
    stopWorkout();
  };

  const handleCompleteSet = (_event: Event) => {
    console.log("VOIX: Completing current set");
    completeSet();
  };

  const handleNextExercise = (_event: Event) => {
    console.log("VOIX: Moving to next exercise");
    nextExercise();
  };

  const handlePreviousExercise = (_event: Event) => {
    console.log("VOIX: Moving to previous exercise");
    previousExercise();
  };

  const handleUpdateExercise = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseIndex, weight, reps } = details;
    console.log(
      "VOIX: Updating exercise",
      exerciseIndex,
      "with weight:",
      weight,
      "reps:",
      reps
    );
    if (exerciseIndex >= 0 && exerciseIndex < exercises.length) {
      updateExercise(exerciseIndex, weight || 0, reps || 0);
    }
  };

  const handleJumpToExercise = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseIndex } = details;
    console.log("VOIX: Jumping to exercise", exerciseIndex);
    if (exerciseIndex >= 0 && exerciseIndex < exercises.length) {
      setCurrentExercise(exerciseIndex);
    }
  };

  const handleLoadWorkingDay = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { dayId } = details;
    console.log("VOIX: Loading working day", dayId);
    if (dayId) {
      loadWorkingDay(parseInt(dayId));
    }
  };

  const handleEditSet = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseIndex, setIndex, weight, reps } = details;
    console.log(
      "VOIX: Editing set",
      setIndex,
      "of exercise",
      exerciseIndex,
      "with weight:",
      weight,
      "reps:",
      reps
    );
    if (exerciseIndex >= 0 && exerciseIndex < exercises.length) {
      editSet(exerciseIndex, setIndex, reps || 0, weight || 0);
    }
  };

  const handleDeleteSet = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseIndex, setIndex } = details;
    console.log("VOIX: Deleting set", setIndex, "of exercise", exerciseIndex);
    if (exerciseIndex >= 0 && exerciseIndex < exercises.length) {
      deleteSet(exerciseIndex, setIndex);
    }
  };

  const handleAddCustomSet = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseIndex, weight, reps } = details;
    console.log(
      "VOIX: Adding custom set to exercise",
      exerciseIndex,
      "with weight:",
      weight,
      "reps:",
      reps
    );
    if (exerciseIndex >= 0 && exerciseIndex < exercises.length) {
      const newSets = { ...exerciseSets };
      if (!newSets[exerciseIndex]) {
        newSets[exerciseIndex] = [];
      }
      newSets[exerciseIndex].push({
        reps: reps || exercises[exerciseIndex]?.repetitions || 0,
        weight: weight || exercises[exerciseIndex]?.weight || 0,
      });
      setExerciseSets(newSets);
    }
  };

  const handleAddMultipleSets = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseIndex, count, weight, reps } = details;
    console.log(
      "VOIX: Adding",
      count,
      "sets to exercise",
      exerciseIndex,
      "with weight:",
      weight,
      "reps:",
      reps
    );
    if (exerciseIndex >= 0 && exerciseIndex < exercises.length && count > 0) {
      const newSets = { ...exerciseSets };
      if (!newSets[exerciseIndex]) {
        newSets[exerciseIndex] = [];
      }

      // Füge die angegebene Anzahl von Sets hinzu
      for (let i = 0; i < count; i++) {
        newSets[exerciseIndex].push({
          reps: reps || exercises[exerciseIndex]?.repetitions || 0,
          weight: weight || exercises[exerciseIndex]?.weight || 0,
        });
      }
      setExerciseSets(newSets);
    }
  };

  const handleCompleteMultipleSets = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { count } = details;
    console.log("VOIX: Completing", count, "sets for current exercise");

    if (count > 0) {
      const newSets = { ...exerciseSets };
      if (!newSets[currentExercise]) {
        newSets[currentExercise] = [];
      }

      // Füge die angegebene Anzahl von Sets zur aktuellen Übung hinzu
      for (let i = 0; i < count; i++) {
        newSets[currentExercise].push({
          reps: exercises[currentExercise]?.repetitions || 0,
          weight: exercises[currentExercise]?.weight || 0,
        });
      }
      setExerciseSets(newSets);
    }
  };

  const handleAddSetsToExercise = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseName, sets } = details;
    console.log(
      "VOIX: Adding sets to exercise",
      exerciseName,
      "with sets:",
      sets
    );

    // Finde die Übung basierend auf dem Namen
    const exerciseIndex = exercises.findIndex(
      (exercise) =>
        exercise.name.toLowerCase().includes(exerciseName.toLowerCase()) ||
        exerciseName.toLowerCase().includes(exercise.name.toLowerCase())
    );

    if (exerciseIndex >= 0 && sets && Array.isArray(sets)) {
      // Springe zur Übung
      setCurrentExercise(exerciseIndex);

      // Füge die Sets hinzu
      const newSets = { ...exerciseSets };
      if (!newSets[exerciseIndex]) {
        newSets[exerciseIndex] = [];
      }

      // Füge alle angegebenen Sets hinzu
      sets.forEach((set: { weight?: number; reps?: number }) => {
        newSets[exerciseIndex].push({
          reps: set.reps || exercises[exerciseIndex]?.repetitions || 0,
          weight: set.weight || exercises[exerciseIndex]?.weight || 0,
        });
      });

      setExerciseSets(newSets);
    }
  };

  const handleClearExerciseSets = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseName } = details;
    console.log("VOIX: Clearing all sets for exercise", exerciseName);

    // Finde die Übung basierend auf dem Namen
    const exerciseIndex = exercises.findIndex(
      (exercise) =>
        exercise.name.toLowerCase().includes(exerciseName.toLowerCase()) ||
        exerciseName.toLowerCase().includes(exercise.name.toLowerCase())
    );

    if (exerciseIndex >= 0) {
      // Springe zur Übung
      setCurrentExercise(exerciseIndex);

      // Lösche alle Sets für diese Übung
      const newSets = { ...exerciseSets };
      newSets[exerciseIndex] = [];
      setExerciseSets(newSets);
    }
  };

  // Exercise Management VOIX Handlers
  const handleCreateExercise = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { title, description, weight, reps } = details;
    console.log("VOIX: Creating new exercise", title);
    
    setNewExerciseTitle(title || "");
    setNewExerciseDescription(description || "");
    setNewExerciseWeight(weight || 0);
    setNewExerciseReps(reps || 10);
    setIsAddingExercise(true);
    setIsManageExercisesOpen(true);
  };

  const handleAddExerciseToDay = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseName } = details;
    console.log("VOIX: Adding exercise to day", exerciseName);
    
    // Finde die Übung in allExercises
    const exercise = allExercises.find(ex => 
      ex.title.toLowerCase().includes(exerciseName.toLowerCase()) ||
      exerciseName.toLowerCase().includes(ex.title.toLowerCase())
    );
    
    if (exercise?.id) {
      addExerciseToWorkingDay(exercise.id);
    }
  };

  const handleRemoveExerciseFromDay = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseName } = details;
    console.log("VOIX: Removing exercise from day", exerciseName);
    
    // Finde die Übung in den aktuellen Übungen
    const exercise = exercises.find(ex => 
      ex.name.toLowerCase().includes(exerciseName.toLowerCase()) ||
      exerciseName.toLowerCase().includes(ex.name.toLowerCase())
    );
    
    if (exercise?.id) {
      removeExerciseFromWorkingDay(exercise.id);
    }
  };

  const handleReplaceExercise = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { oldExerciseName, newExerciseName } = details;
    console.log("VOIX: Replacing exercise", oldExerciseName, "with", newExerciseName);
    
    // Finde die alte Übung
    const oldExercise = exercises.find(ex => 
      ex.name.toLowerCase().includes(oldExerciseName.toLowerCase()) ||
      oldExerciseName.toLowerCase().includes(ex.name.toLowerCase())
    );
    
    // Finde die neue Übung
    const newExercise = allExercises.find(ex => 
      ex.title.toLowerCase().includes(newExerciseName.toLowerCase()) ||
      newExerciseName.toLowerCase().includes(ex.title.toLowerCase())
    );
    
    if (oldExercise?.id && newExercise?.id) {
      replaceExerciseInWorkingDay(oldExercise.id, newExercise.id);
    }
  };

  return (
    <Box py={8}>
      {/* VOIX Context Elements */}
      {/* @ts-ignore */}
      <context name="workoutState">
        Workout ist {isWorkoutActive ? "aktiv" : "inaktiv"}. Aktuelle Übung:{" "}
        {currentExercise + 1} von {exercises.length} (
        {exercises[currentExercise]?.name || "keine"}). Pause-Timer:{" "}
        {pauseTimer > 0 ? `${pauseTimer} Sekunden` : "nicht aktiv"}.
        Abgeschlossene Übungen: {completedExercises.size} von {exercises.length}
        .{/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="currentExercise">
        {exercises[currentExercise]
          ? JSON.stringify(exercises[currentExercise])
          : "Keine aktuelle Übung"}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="exerciseList">
        {JSON.stringify(exercises)}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="exerciseSets">
        {JSON.stringify(exerciseSets)}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="workingDay">
        {workingDay
          ? `Training aus der Datenbank geladen: ${workingDay.title} (ID: ${workingDay.id})`
          : "Kein Training aus der Datenbank geladen (Mock-Übungen werden verwendet)"}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="currentExerciseSets">
        Aktuelle Übung ({currentExercise}):{" "}
        {exercises[currentExercise]?.name || "keine"}. Abgeschlossene Sets:{" "}
        {exerciseSets[currentExercise]?.length || 0}. Sets Details:{" "}
        {exerciseSets[currentExercise]
          ? JSON.stringify(exerciseSets[currentExercise])
          : "keine Sets"}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="exerciseManagement">
        Exercise Management ist verfügbar: {workingDay ? "Ja" : "Nein"}. 
        Verfügbare Übungen zum Hinzufügen: {allExercises.filter(ex => !exercises.some(currentEx => currentEx.id === ex.id)).length}.
        Aktuelle Übungen im Training: {exercises.length}.
        Management Panel geöffnet: {isManageExercisesOpen ? "Ja" : "Nein"}.
        Alle verfügbaren Übungen: {JSON.stringify(allExercises.map(ex => ({id: ex.id, title: ex.title})))}.
        {/* @ts-ignore */}
      </context>

      {/* VOIX Tool Elements */}
      <Tool
        name="start_workout"
        description="Startet das Workout"
        onCall={handleStartWorkout}
      />

      <Tool
        name="load_working_day"
        description="Lädt einen Trainingstag aus der Datenbank"
        onCall={handleLoadWorkingDay}
      >
        {/* @ts-ignore */}
        <prop
          name="dayId"
          type="number"
          required
          description="ID des Trainingstags aus der Datenbank"
        />
      </Tool>

      <Tool
        name="pause_workout"
        description="Pausiert das Workout für eine bestimmte Zeit"
        onCall={handlePauseWorkout}
      >
        {/* @ts-ignore */}
        <prop
          name="pauseTime"
          type="number"
          description="Pause-Zeit in Sekunden (Standard: 30)"
        />
      </Tool>

      <Tool
        name="stop_workout"
        description="Stoppt das Workout komplett und speichert die Ergebnisse in der Datenbank"
        onCall={handleStopWorkout}
      />

      <Tool
        name="complete_set"
        description="Markiert den aktuellen Satz als abgeschlossen"
        onCall={handleCompleteSet}
      />

      <Tool
        name="complete_multiple_sets"
        description="Markiert mehrere Sätze der aktuellen Übung als abgeschlossen"
        onCall={handleCompleteMultipleSets}
      >
        {/* @ts-ignore */}
        <prop
          name="count"
          type="number"
          required
          description="Anzahl der Sets die als abgeschlossen markiert werden sollen"
        />
      </Tool>

      <Tool
        name="next_exercise"
        description="Wechselt zur nächsten Übung"
        onCall={handleNextExercise}
      />

      <Tool
        name="previous_exercise"
        description="Wechselt zur vorherigen Übung"
        onCall={handlePreviousExercise}
      />

      <Tool
        name="update_exercise"
        description="Aktualisiert Gewicht und Wiederholungen einer Übung"
        onCall={handleUpdateExercise}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseIndex"
          type="number"
          required
          description="Index der zu aktualisierenden Übung (0-basiert)"
        />
        {/* @ts-ignore */}
        <prop name="weight" type="number" description="Neues Gewicht in kg" />
        {/* @ts-ignore */}
        <prop
          name="reps"
          type="number"
          description="Neue Anzahl Wiederholungen"
        />
      </Tool>

      <Tool
        name="jump_to_exercise"
        description="Springt direkt zu einer bestimmten Übung"
        onCall={handleJumpToExercise}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseIndex"
          type="number"
          required
          description="Index der Übung zu der gesprungen werden soll (0-basiert)"
        />
      </Tool>

      <Tool
        name="edit_set"
        description="Bearbeitet einen bestehenden Satz einer Übung"
        onCall={handleEditSet}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseIndex"
          type="number"
          required
          description="Index der Übung (0-basiert)"
        />
        {/* @ts-ignore */}
        <prop
          name="setIndex"
          type="number"
          required
          description="Index des Satzes (0-basiert)"
        />
        {/* @ts-ignore */}
        <prop name="weight" type="number" description="Neues Gewicht in kg" />
        {/* @ts-ignore */}
        <prop
          name="reps"
          type="number"
          description="Neue Anzahl Wiederholungen"
        />
      </Tool>

      <Tool
        name="delete_set"
        description="Löscht einen bestehenden Satz einer Übung"
        onCall={handleDeleteSet}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseIndex"
          type="number"
          required
          description="Index der Übung (0-basiert)"
        />
        {/* @ts-ignore */}
        <prop
          name="setIndex"
          type="number"
          required
          description="Index des zu löschenden Satzes (0-basiert)"
        />
      </Tool>

      <Tool
        name="add_custom_set"
        description="Fügt einen benutzerdefinierten Satz zu einer Übung hinzu"
        onCall={handleAddCustomSet}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseIndex"
          type="number"
          required
          description="Index der Übung (0-basiert)"
        />
        {/* @ts-ignore */}
        <prop
          name="weight"
          type="number"
          description="Gewicht in kg (verwendet Standard-Gewicht der Übung wenn nicht angegeben)"
        />
        {/* @ts-ignore */}
        <prop
          name="reps"
          type="number"
          description="Anzahl Wiederholungen (verwendet Standard-Wiederholungen der Übung wenn nicht angegeben)"
        />
      </Tool>

      <Tool
        name="add_multiple_sets"
        description="Fügt mehrere Sets zu einer Übung hinzu (z.B. wenn bereits Sets abgeschlossen wurden)"
        onCall={handleAddMultipleSets}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseIndex"
          type="number"
          required
          description="Index der Übung (0-basiert)"
        />
        {/* @ts-ignore */}
        <prop
          name="count"
          type="number"
          required
          description="Anzahl der Sets die hinzugefügt werden sollen"
        />
        {/* @ts-ignore */}
        <prop
          name="weight"
          type="number"
          description="Gewicht in kg (verwendet Standard-Gewicht der Übung wenn nicht angegeben)"
        />
        {/* @ts-ignore */}
        <prop
          name="reps"
          type="number"
          description="Anzahl Wiederholungen (verwendet Standard-Wiederholungen der Übung wenn nicht angegeben)"
        />
      </Tool>

      <Tool
        name="add_sets_to_exercise"
        description="Fügt spezifische Sets zu einer benannten Übung hinzu und springt automatisch zu dieser Übung"
        onCall={handleAddSetsToExercise}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseName"
          type="string"
          required
          description="Name oder Teil des Namens der Übung (z.B. 'squats', 'push-ups')"
        />
        {/* @ts-ignore */}
        <prop
          name="sets"
          type="array"
          required
          description="Array von Sets mit spezifischen Gewichten und Wiederholungen"
        >
          {/* @ts-ignore */}
          <array>
            {/* @ts-ignore */}
            <dict>
              {/* @ts-ignore */}
              <prop
                name="weight"
                type="number"
                description="Gewicht für diesen Satz in kg"
              />
              {/* @ts-ignore */}
              <prop
                name="reps"
                type="number"
                description="Wiederholungen für diesen Satz"
              />
              {/* @ts-ignore */}
            </dict>
            {/* @ts-ignore */}
          </array>
          {/* @ts-ignore */}
        </prop>
      </Tool>

      <Tool
        name="clear_exercise_sets"
        description="Löscht alle Sets einer bestimmten Übung"
        onCall={handleClearExerciseSets}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseName"
          type="string"
          required
          description="Name oder Teil des Namens der Übung (z.B. 'squats', 'push-ups')"
        />
      </Tool>

      {/* Exercise Management Tools */}
      <Tool
        name="create_exercise"
        description="Erstellt eine neue Übung"
        onCall={handleCreateExercise}
      >
        {/* @ts-ignore */}
        <prop
          name="title"
          type="string"
          required
          description="Name der neuen Übung"
        />
        {/* @ts-ignore */}
        <prop
          name="description"
          type="string"
          description="Beschreibung der Übung (optional)"
        />
        {/* @ts-ignore */}
        <prop
          name="weight"
          type="number"
          description="Standard-Gewicht in kg (optional, Standard: 0)"
        />
        {/* @ts-ignore */}
        <prop
          name="reps"
          type="number"
          description="Standard-Wiederholungen (optional, Standard: 10)"
        />
      </Tool>

      <Tool
        name="add_exercise_to_day"
        description="Fügt eine bestehende Übung zum aktuellen Training hinzu"
        onCall={handleAddExerciseToDay}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseName"
          type="string"
          required
          description="Name oder Teil des Namens der Übung die hinzugefügt werden soll"
        />
      </Tool>

      <Tool
        name="remove_exercise_from_day"
        description="Entfernt eine Übung aus dem aktuellen Training"
        onCall={handleRemoveExerciseFromDay}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseName"
          type="string"
          required
          description="Name oder Teil des Namens der Übung die entfernt werden soll"
        />
      </Tool>

      <Tool
        name="replace_exercise"
        description="Ersetzt eine Übung im Training durch eine andere"
        onCall={handleReplaceExercise}
      >
        {/* @ts-ignore */}
        <prop
          name="oldExerciseName"
          type="string"
          required
          description="Name der Übung die ersetzt werden soll"
        />
        {/* @ts-ignore */}
        <prop
          name="newExerciseName"
          type="string"
          required
          description="Name der neuen Übung"
        />
      </Tool>

      <Container maxW="6xl">
        {/* Workout Header */}
        <Stack gap={4} textAlign="center" mb={12}>
          <Heading size="2xl" color="text.primary">
            🏃‍♂️ Live Workout
          </Heading>
          <Text fontSize="lg" color="text.secondary">
            {workingDay
              ? `Training: ${workingDay.title}`
              : "Folge dem Timer und gib dein Bestes!"}
          </Text>

          {/* Database status */}
          {workingDay ? (
            <Text fontSize="sm" color="green.600">
              ✅ Training aus der Datenbank geladen (Ergebnisse werden
              gespeichert)
            </Text>
          ) : (
            <Flex justify="center" gap={4} align="center">
              <Text fontSize="sm" color="orange.600">
                ⚠️ Mock-Training (nicht aus der Datenbank)
              </Text>
              <Button
                size="sm"
                bg="accent.primary"
                color="white"
                _hover={{ bg: "accent.secondary" }}
                onClick={handleLoadTraining}
              >
                📋 Training aus Datenbank laden
              </Button>
            </Flex>
          )}
        </Stack>

        {/* Error Alert */}
        {error && (
          <Box
            bg="red.50"
            border="1px"
            borderColor="red.200"
            p={4}
            mb={6}
            borderRadius="md"
          >
            <Text color="red.600">{error}</Text>
          </Box>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="accent.primary" />
          </Flex>
        ) : (
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
            {/* Main Workout Display */}
            <Box>
              {/* Current Exercise */}
              <Box
                p={8}
                bg="bg.secondary"
                borderColor="accent.primary"
                borderWidth="2px"
                rounded="lg"
                textAlign="center"
                mb={6}
              >
                <Stack gap={6}>
                  <Stack gap={2}>
                    <Heading size="xl" color="text.primary">
                      {exercises[currentExercise]?.name || "Bereit?"}
                    </Heading>
                  </Stack>

                  {/* Exercise Details */}
                  <Box>
                    <Stack gap={4}>
                      <Box>
                        <Stack
                          direction="row"
                          gap={4}
                          justify="center"
                          align="center"
                        >
                          <Box>
                            <Text fontSize="sm" color="text.secondary" mb={1}>
                              Gewicht (kg)
                            </Text>
                            {editingExercise === currentExercise ? (
                              <Input
                                value={tempWeight}
                                onChange={(e) =>
                                  setTempWeight(Number(e.target.value))
                                }
                                onBlur={() => {
                                  updateExercise(
                                    currentExercise,
                                    tempWeight,
                                    tempReps
                                  );
                                  setEditingExercise(null);
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    updateExercise(
                                      currentExercise,
                                      tempWeight,
                                      tempReps
                                    );
                                    setEditingExercise(null);
                                  }
                                }}
                                type="number"
                                w="80px"
                                textAlign="center"
                                autoFocus
                              />
                            ) : (
                              <Text
                                fontSize="lg"
                                color="text.primary"
                                fontWeight="bold"
                                cursor="pointer"
                                onClick={() => {
                                  setEditingExercise(currentExercise);
                                  setTempWeight(
                                    exercises[currentExercise]?.weight || 0
                                  );
                                  setTempReps(
                                    exercises[currentExercise]?.repetitions || 0
                                  );
                                }}
                                _hover={{ color: "accent.primary" }}
                              >
                                {exercises[currentExercise]?.weight || 0} kg
                              </Text>
                            )}
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="text.secondary" mb={1}>
                              Wiederholungen
                            </Text>
                            {editingExercise === currentExercise ? (
                              <Input
                                value={tempReps}
                                onChange={(e) =>
                                  setTempReps(Number(e.target.value))
                                }
                                onBlur={() => {
                                  updateExercise(
                                    currentExercise,
                                    tempWeight,
                                    tempReps
                                  );
                                  setEditingExercise(null);
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    updateExercise(
                                      currentExercise,
                                      tempWeight,
                                      tempReps
                                    );
                                    setEditingExercise(null);
                                  }
                                }}
                                type="number"
                                w="80px"
                                textAlign="center"
                              />
                            ) : (
                              <Text
                                fontSize="lg"
                                color="text.primary"
                                fontWeight="bold"
                                cursor="pointer"
                                onClick={() => {
                                  setEditingExercise(currentExercise);
                                  setTempWeight(
                                    exercises[currentExercise]?.weight || 0
                                  );
                                  setTempReps(
                                    exercises[currentExercise]?.repetitions || 0
                                  );
                                }}
                                _hover={{ color: "accent.primary" }}
                              >
                                {exercises[currentExercise]?.repetitions || 0}
                              </Text>
                            )}
                          </Box>
                        </Stack>
                      </Box>

                      {/* Completed Sets Display */}
                      <Box>
                        <Text fontSize="sm" color="text.secondary" mb={2}>
                          Sets absolviert:{" "}
                          {exerciseSets[currentExercise]?.length || 0}
                        </Text>

                        {exerciseSets[currentExercise] &&
                          exerciseSets[currentExercise].length > 0 && (
                            <Stack gap={2}>
                              {exerciseSets[currentExercise].map(
                                (set, setIndex) => (
                                  <Box
                                    key={setIndex}
                                    p={2}
                                    bg="bg.tertiary"
                                    rounded="md"
                                    borderWidth="1px"
                                    borderColor="border"
                                  >
                                    <Stack
                                      direction="row"
                                      justify="space-between"
                                      align="center"
                                    >
                                      <Text fontSize="sm" color="text.primary">
                                        Set {setIndex + 1}: {set.weight}kg ×{" "}
                                        {set.reps} Wdh.
                                      </Text>
                                      <Stack direction="row" gap={2}>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          color="blue.400"
                                          onClick={() => {
                                            const newWeight = prompt(
                                              `Neues Gewicht für Set ${
                                                setIndex + 1
                                              }:`,
                                              set.weight.toString()
                                            );
                                            const newReps = prompt(
                                              `Neue Wiederholungen für Set ${
                                                setIndex + 1
                                              }:`,
                                              set.reps.toString()
                                            );
                                            if (newWeight && newReps) {
                                              editSet(
                                                currentExercise,
                                                setIndex,
                                                Number(newReps),
                                                Number(newWeight)
                                              );
                                            }
                                          }}
                                        >
                                          ✏️
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          color="red.400"
                                          onClick={() =>
                                            deleteSet(currentExercise, setIndex)
                                          }
                                        >
                                          🗑️
                                        </Button>
                                      </Stack>
                                    </Stack>
                                  </Box>
                                )
                              )}
                            </Stack>
                          )}

                        <Progress.Root
                          value={
                            ((exerciseSets[currentExercise]?.length || 0) / 3) *
                            100
                          }
                          size="lg"
                          colorPalette="green"
                          mt={2}
                        >
                          <Progress.Track bg="bg.tertiary">
                            <Progress.Range bg="green.500" />
                          </Progress.Track>
                        </Progress.Root>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Workout Controls */}
                  <Stack direction="row" gap={4} justify="center" wrap="wrap">
                    {!isWorkoutActive ? (
                      <Button
                        size="lg"
                        bg="accent.primary"
                        color="white"
                        _hover={{ bg: "accent.secondary" }}
                        px={8}
                        py={6}
                        fontSize="lg"
                        fontWeight="bold"
                        onClick={startWorkout}
                      >
                        ▶️ Workout starten
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="lg"
                          bg="green.500"
                          color="white"
                          _hover={{ bg: "green.600" }}
                          px={6}
                          onClick={completeSet}
                        >
                          ✅ Set abgeschlossen
                        </Button>
                        <Button
                          size="lg"
                          bg="gray.500"
                          color="white"
                          _hover={{ bg: "gray.600" }}
                          px={6}
                          onClick={previousExercise}
                          disabled={currentExercise === 0}
                        >
                          ⬅️ Zurück
                        </Button>
                        <Button
                          size="lg"
                          bg="blue.500"
                          color="white"
                          _hover={{ bg: "blue.600" }}
                          px={6}
                          onClick={nextExercise}
                        >
                          ➡️ Nächste Übung
                        </Button>
                        <Button
                          size="lg"
                          bg="yellow.500"
                          color="white"
                          _hover={{ bg: "yellow.600" }}
                          px={6}
                          onClick={() => {
                            const pauseTime = prompt(
                              "Pause-Zeit in Sekunden:",
                              "30"
                            );
                            if (pauseTime) {
                              pauseWorkout(Number(pauseTime));
                            }
                          }}
                        >
                          ⏸️ Pause
                        </Button>
                        <Button
                          size="lg"
                          bg="red.500"
                          color="white"
                          _hover={{ bg: "red.600" }}
                          px={6}
                          onClick={stopWorkout}
                        >
                          ⏹️ Stop
                        </Button>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Box>

              {/* Complete Workout Section - Active Workout */}
              {isWorkoutActive && Object.keys(exerciseSets).length > 0 && (
                <Box
                  p={6}
                  bg="bg.secondary"
                  borderColor="green.200"
                  borderWidth="2px"
                  rounded="lg"
                  mb={6}
                >
                  <Stack gap={4} textAlign="center">
                    <Heading size="md" color="text.primary">
                      🏁 Workout beenden
                    </Heading>
                    <Text color="text.secondary" fontSize="sm">
                      Speichere dein Workout in der Datenbank mit allen Sets,
                      Gewichten und Wiederholungen
                    </Text>
                    <Text color="text.secondary" fontSize="xs">
                      Bisher aufgezeichnet:{" "}
                      {Object.values(exerciseSets).reduce(
                        (total, sets) => total + sets.length,
                        0
                      )}{" "}
                      Sets
                    </Text>
                    <Button
                      size="lg"
                      bg="green.600"
                      color="white"
                      _hover={{ bg: "green.700" }}
                      px={8}
                      py={6}
                      fontSize="lg"
                      fontWeight="bold"
                      onClick={completeWorkout}
                      loading={isLoading}
                    >
                      {isLoading
                        ? "Speichere..."
                        : "🎉 Workout abschließen & speichern"}
                    </Button>
                    {error && (
                      <Text color="red.500" fontSize="sm" mt={2}>
                        {error}
                      </Text>
                    )}
                  </Stack>
                </Box>
              )}

              {/* Save Workout Section - When workout is stopped but has sets */}
              {!isWorkoutActive &&
                Object.keys(exerciseSets).length > 0 &&
                workingDay && (
                  <Box
                    p={6}
                    bg="bg.secondary"
                    borderColor="blue.200"
                    borderWidth="2px"
                    rounded="lg"
                    mb={6}
                  >
                    <Stack gap={4} textAlign="center">
                      <Heading size="md" color="text.primary">
                        💾 Workout speichern
                      </Heading>
                      <Text color="text.secondary" fontSize="sm">
                        Du hast aufgezeichnete Sets. Möchtest du diese in der
                        Datenbank speichern?
                      </Text>
                      <Text color="text.secondary" fontSize="xs">
                        Aufgezeichnet:{" "}
                        {Object.values(exerciseSets).reduce(
                          (total, sets) => total + sets.length,
                          0
                        )}{" "}
                        Sets aus {Object.keys(exerciseSets).length} Übungen
                      </Text>
                      <Button
                        size="lg"
                        bg="blue.600"
                        color="white"
                        _hover={{ bg: "blue.700" }}
                        px={8}
                        py={6}
                        fontSize="lg"
                        fontWeight="bold"
                        onClick={completeWorkout}
                        loading={isLoading}
                      >
                        {isLoading ? "Speichere..." : "💾 Jetzt speichern"}
                      </Button>
                      {error && (
                        <Text color="red.500" fontSize="sm" mt={2}>
                          {error}
                        </Text>
                      )}
                    </Stack>
                  </Box>
                )}

              {/* Workout Progress */}
              <Box
                p={6}
                bg="bg.secondary"
                borderColor="border"
                borderWidth="1px"
                rounded="lg"
                mb={6}
              >
                <Stack gap={4}>
                  <Heading size="md" color="text.primary">
                    Workout Fortschritt (Übungen)
                  </Heading>
                  <Progress.Root
                    value={workoutProgressPercentage}
                    size="lg"
                    colorPalette="orange"
                  >
                    <Progress.Track bg="bg.tertiary">
                      <Progress.Range bg="accent.primary" />
                    </Progress.Track>
                  </Progress.Root>
                  <Text color="text.secondary" textAlign="center">
                    Abgeschlossene Übungen: {completedExercises.size} /{" "}
                    {exercises.length}
                  </Text>
                </Stack>
              </Box>
            </Box>

            {/* Sidebar */}
            <Stack gap={6}>
              {/* Exercises List */}
              <Box
                p={6}
                bg="bg.secondary"
                borderColor="border"
                borderWidth="1px"
                rounded="lg"
              >
                <Heading size="md" color="text.primary" mb={4}>
                  Heutige Übungen
                </Heading>
                <Stack gap={3}>
                  {exercises.map((exercise, index) => {
                    const isActive = index === currentExercise;
                    const isCompleted = completedExercises.has(index);

                    return (
                      <Box
                        key={index}
                        p={4}
                        bg={
                          isActive
                            ? "accent.primary"
                            : isCompleted
                            ? "bg.tertiary"
                            : "bg"
                        }
                        borderColor={isActive ? "accent.primary" : "border"}
                        borderWidth="1px"
                        rounded="md"
                        transition="all 0.3s ease"
                      >
                        <Stack
                          direction="row"
                          justify="space-between"
                          align="center"
                        >
                          <Stack gap={1}>
                            <Text
                              fontWeight="bold"
                              color={isActive ? "white" : "text.primary"}
                              fontSize="sm"
                            >
                              {exercise.name}
                            </Text>
                            <Text
                              color={isActive ? "white" : "text.secondary"}
                              fontSize="xs"
                            >
                              {exercise.weight > 0
                                ? `${exercise.weight}kg`
                                : "Körpergewicht"}{" "}
                              • {exercise.repetitions} Wdh.
                            </Text>
                            <Text
                              color={isActive ? "white" : "text.secondary"}
                              fontSize="xs"
                            >
                              Sets: {exerciseSets[index]?.length || 0}
                            </Text>
                          </Stack>
                          <Text fontSize="lg">
                            {isCompleted ? "✅" : isActive ? "🔥" : "⏳"}
                          </Text>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              {/* Database info */}
              {workingDay && (
                <Box
                  p={4}
                  bg="bg.tertiary"
                  borderColor="green.200"
                  borderWidth="1px"
                  rounded="lg"
                >
                  <Stack gap={2}>
                    <Text fontSize="sm" fontWeight="bold" color="green.700">
                      📊 Datenbank-Training
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      Plan-ID: {workingDay.plan_id}
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      Tag-ID: {workingDay.id}
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      Übungen: {workingDay.exercises.length}
                    </Text>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Grid>
        )}

        {/* Pause Timer Popup */}
        {isPauseModalOpen && (
          <Box
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            bg="rgba(0, 0, 0, 0.8)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="9999"
          >
            <Box
              bg="bg.secondary"
              p={8}
              rounded="lg"
              borderColor="accent.primary"
              borderWidth="2px"
              textAlign="center"
              minW="300px"
            >
              <Stack gap={6}>
                <Heading size="lg" color="text.primary">
                  Pause
                </Heading>
                <Text
                  fontSize="4xl"
                  fontWeight="bold"
                  color="accent.primary"
                  fontFamily="mono"
                >
                  {formatTime(pauseTimer)}
                </Text>
                <Text color="text.secondary">
                  Das Workout wird automatisch fortgesetzt
                </Text>
                <Button
                  bg="accent.primary"
                  color="white"
                  _hover={{ bg: "accent.secondary" }}
                  onClick={() => {
                    setIsPauseModalOpen(false);
                    setIsWorkoutActive(true);
                  }}
                >
                  Pause beenden
                </Button>
              </Stack>
            </Box>

            {/* Exercise Management Section */}
            {workingDay && (
              <Box
                p={6}
                bg="bg.secondary"
                borderColor="blue.200"
                borderWidth="2px"
                rounded="lg"
                mb={6}
              >
                <Stack gap={4}>
                  <Flex justify="space-between" align="center">
                    <Heading size="md" color="text.primary">
                      🔧 Übungen verwalten
                    </Heading>
                    <Button
                      size="sm"
                      bg="blue.500"
                      color="white"
                      _hover={{ bg: "blue.600" }}
                      onClick={() => setIsManageExercisesOpen(!isManageExercisesOpen)}
                    >
                      {isManageExercisesOpen ? "Schließen" : "Verwalten"}
                    </Button>
                  </Flex>

                  {isManageExercisesOpen && (
                    <Stack gap={4}>
                      {/* Add New Exercise Section */}
                      <Box
                        p={4}
                        bg="bg.tertiary"
                        borderColor="green.200"
                        borderWidth="1px"
                        rounded="md"
                      >
                        <Stack gap={3}>
                          <Flex justify="space-between" align="center">
                            <Text fontWeight="bold" color="text.primary">
                              ➕ Neue Übung erstellen
                            </Text>
                            <Button
                              size="sm"
                              bg="green.500"
                              color="white"
                              _hover={{ bg: "green.600" }}
                              onClick={() => setIsAddingExercise(!isAddingExercise)}
                            >
                              {isAddingExercise ? "Abbrechen" : "Hinzufügen"}
                            </Button>
                          </Flex>

                          {isAddingExercise && (
                            <Stack gap={3}>
                              <Input
                                placeholder="Übungsname (z.B. Liegestütze)"
                                value={newExerciseTitle}
                                onChange={(e) => setNewExerciseTitle(e.target.value)}
                                bg="bg"
                              />
                              <Input
                                placeholder="Beschreibung (optional)"
                                value={newExerciseDescription}
                                onChange={(e) => setNewExerciseDescription(e.target.value)}
                                bg="bg"
                              />
                              <Flex gap={2}>
                                <Box>
                                  <Text fontSize="sm" color="text.secondary" mb={1}>
                                    Gewicht (kg)
                                  </Text>
                                  <Input
                                    type="number"
                                    value={newExerciseWeight}
                                    onChange={(e) => setNewExerciseWeight(Number(e.target.value))}
                                    bg="bg"
                                    w="100px"
                                  />
                                </Box>
                                <Box>
                                  <Text fontSize="sm" color="text.secondary" mb={1}>
                                    Wiederholungen
                                  </Text>
                                  <Input
                                    type="number"
                                    value={newExerciseReps}
                                    onChange={(e) => setNewExerciseReps(Number(e.target.value))}
                                    bg="bg"
                                    w="100px"
                                  />
                                </Box>
                              </Flex>
                              <Button
                                bg="green.600"
                                color="white"
                                _hover={{ bg: "green.700" }}
                                onClick={createNewExercise}
                                loading={isLoading}
                                disabled={!newExerciseTitle.trim()}
                              >
                                Übung erstellen
                              </Button>
                            </Stack>
                          )}
                        </Stack>
                      </Box>

                      {/* Available Exercises to Add */}
                      <Box
                        p={4}
                        bg="bg.tertiary"
                        borderColor="blue.200"
                        borderWidth="1px"
                        rounded="md"
                      >
                        <Text fontWeight="bold" color="text.primary" mb={3}>
                          📋 Verfügbare Übungen hinzufügen
                        </Text>
                        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3}>
                          {allExercises
                            .filter(exercise => !exercises.some(ex => ex.id === exercise.id))
                            .map((exercise) => (
                              <Box
                                key={exercise.id}
                                p={3}
                                bg="bg"
                                borderWidth="1px"
                                borderColor="border"
                                rounded="md"
                              >
                                <Stack gap={2}>
                                  <Text fontSize="sm" fontWeight="bold" color="text.primary">
                                    {exercise.title}
                                  </Text>
                                  <Text fontSize="xs" color="text.secondary">
                                    {exercise.first_set_weight || 0}kg • {exercise.first_set_reps || 10} Wdh.
                                  </Text>
                                  <Button
                                    size="sm"
                                    bg="blue.500"
                                    color="white"
                                    _hover={{ bg: "blue.600" }}
                                    onClick={() => addExerciseToWorkingDay(exercise.id!)}
                                  >
                                    ➕ Hinzufügen
                                  </Button>
                                </Stack>
                              </Box>
                            ))}
                        </Grid>
                        {allExercises.filter(exercise => !exercises.some(ex => ex.id === exercise.id)).length === 0 && (
                          <Text color="text.secondary" fontSize="sm" textAlign="center">
                            Alle verfügbaren Übungen sind bereits im Training enthalten.
                          </Text>
                        )}
                      </Box>

                      {/* Current Exercises Management */}
                      <Box
                        p={4}
                        bg="bg.tertiary"
                        borderColor="orange.200"
                        borderWidth="1px"
                        rounded="md"
                      >
                        <Text fontWeight="bold" color="text.primary" mb={3}>
                          🔄 Aktuelle Übungen verwalten
                        </Text>
                        <Stack gap={3}>
                          {exercises.map((exercise, index) => (
                            <Box
                              key={exercise.id || index}
                              p={3}
                              bg="bg"
                              borderWidth="1px"
                              borderColor={index === currentExercise ? "accent.primary" : "border"}
                              rounded="md"
                            >
                              <Stack gap={2}>
                                <Flex justify="space-between" align="center">
                                  <Stack gap={1}>
                                    <Text fontSize="sm" fontWeight="bold" color="text.primary">
                                      {exercise.name}
                                    </Text>
                                    <Text fontSize="xs" color="text.secondary">
                                      {exercise.weight}kg • {exercise.repetitions} Wdh. • Sets: {exerciseSets[index]?.length || 0}
                                    </Text>
                                  </Stack>
                                  <Stack direction="row" gap={1}>
                                    <Button
                                      size="sm"
                                      bg="orange.500"
                                      color="white"
                                      _hover={{ bg: "orange.600" }}
                                      onClick={() => {
                                        const availableExercises = allExercises.filter(ex => 
                                          !exercises.some(currentEx => currentEx.id === ex.id)
                                        );
                                        
                                        if (availableExercises.length === 0) {
                                          alert("Keine verfügbaren Übungen zum Ersetzen.");
                                          return;
                                        }

                                        const exerciseNames = availableExercises.map((ex, idx) => 
                                          `${idx + 1}. ${ex.title}`
                                        ).join('\n');
                                        
                                        const choice = prompt(
                                          `Wählen Sie eine Übung zum Ersetzen:\n${exerciseNames}\n\nGeben Sie die Nummer ein:`
                                        );
                                        
                                        if (choice) {
                                          const choiceIndex = parseInt(choice) - 1;
                                          if (choiceIndex >= 0 && choiceIndex < availableExercises.length) {
                                            const newExercise = availableExercises[choiceIndex];
                                            if (exercise.id && newExercise.id) {
                                              replaceExerciseInWorkingDay(exercise.id, newExercise.id);
                                            }
                                          }
                                        }
                                      }}
                                    >
                                      🔄
                                    </Button>
                                    <Button
                                      size="sm"
                                      bg="red.500"
                                      color="white"
                                      _hover={{ bg: "red.600" }}
                                      onClick={() => {
                                        if (exercise.id) {
                                          removeExerciseFromWorkingDay(exercise.id);
                                        }
                                      }}
                                    >
                                      🗑️
                                    </Button>
                                  </Stack>
                                </Flex>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default LiveWorkout;
