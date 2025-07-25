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
import {
  FaPlay,
  FaPause,
  FaStop,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaRunning,
  FaClipboardList,
  FaSave,
  FaTrophy,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFire,
  FaClock,
  FaChartBar,
  FaTimes,
  FaCalendarAlt,
  FaDumbbell,
} from "react-icons/fa";
import { Tool } from "../components/Tool";
import RunningAnimation from "../components/RunningAnimation";
import { apiService } from "../services/api";
import type { WorkingDay, Exercise, WorkingPlan } from "../services/api";

// Frontend Types for UI compatibility
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
  const [isPauseInputModalOpen, setIsPauseInputModalOpen] = useState(false);
  const [customPauseTime, setCustomPauseTime] = useState("30");
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

  // Training selection modal state
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<WorkingPlan[]>([]);
  const [availableDays, setAvailableDays] = useState<WorkingDay[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkingPlan | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

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

  // Exercise Management State (for VOIX only)
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);

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
      setError("Error loading exercises");
    }
  };

  const createNewExercise = async (
    title: string,
    description?: string,
    weight?: number,
    reps?: number
  ) => {
    if (!title.trim()) {
      setError("Exercise name is required");
      return;
    }

    try {
      setIsLoading(true);
      const newExercise = await apiService.createExercise({
        title: title,
        description: description || undefined,
        first_set_weight: weight || 0,
        first_set_reps: reps || 10,
      });

      // Update all exercises list
      await loadAllExercises();

      alert(`New exercise "${newExercise.title}" has been created!`);
      return newExercise;
    } catch (err) {
      console.error("Error creating exercise:", err);
      setError("Error creating exercise");
    } finally {
      setIsLoading(false);
    }
  };

  const addExerciseToWorkingDay = async (exerciseId: number) => {
    if (!workingDay?.id) {
      setError("No workout loaded");
      return;
    }

    try {
      setIsLoading(true);
      const updatedDay = await apiService.addExercisesToDay(workingDay.id, [
        exerciseId,
      ]);

      // Update working day and exercises
      setWorkingDay(updatedDay);
      const frontendExercises = convertBackendToFrontend(updatedDay.exercises);
      setExercises(frontendExercises);

      // Update all exercises list to reflect any changes
      await loadAllExercises();

      const addedExercise = allExercises.find((ex) => ex.id === exerciseId);
      alert(
        `Exercise "${
          addedExercise?.title || "Unknown"
        }" has been added to the workout!`
      );
    } catch (err) {
      console.error("Error adding exercise to day:", err);
      setError("Error adding exercise");
    } finally {
      setIsLoading(false);
    }
  };

  const removeExerciseFromWorkingDay = async (exerciseId: number) => {
    if (!workingDay?.id) {
      setError("No workout loaded");
      return;
    }

    const exerciseToRemove = exercises.find((ex) => ex.id === exerciseId);
    const confirmRemove = window.confirm(
      `Do you want to remove the exercise "${
        exerciseToRemove?.name || "Unknown"
      }" from the workout?`
    );

    if (!confirmRemove) return;

    try {
      setIsLoading(true);
      const updatedDay = await apiService.removeExercisesFromDay(
        workingDay.id,
        [exerciseId]
      );

      // Update working day and exercises
      setWorkingDay(updatedDay);
      const frontendExercises = convertBackendToFrontend(updatedDay.exercises);
      setExercises(frontendExercises);

      // If we removed the current exercise, adjust currentExercise index
      const removedExerciseIndex = exercises.findIndex(
        (ex) => ex.id === exerciseId
      );
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

      alert(
        `Exercise "${exerciseToRemove?.name || "Unknown"}" has been removed!`
      );
    } catch (err) {
      console.error("Error removing exercise from day:", err);
      setError("Error removing exercise");
    } finally {
      setIsLoading(false);
    }
  };

  const replaceExerciseInWorkingDay = async (
    oldExerciseId: number,
    newExerciseId: number
  ) => {
    if (!workingDay?.id) {
      setError("No workout loaded");
      return;
    }

    const oldExercise = exercises.find((ex) => ex.id === oldExerciseId);
    const newExercise = allExercises.find((ex) => ex.id === newExerciseId);

    const confirmReplace = window.confirm(
      `Do you want to replace "${oldExercise?.name || "Exercise"}" with "${
        newExercise?.title || "new exercise"
      }"?`
    );

    if (!confirmReplace) return;

    try {
      setIsLoading(true);

      // Remove old exercise and add new one
      await apiService.removeExercisesFromDay(workingDay.id, [oldExerciseId]);
      const updatedDay = await apiService.addExercisesToDay(workingDay.id, [
        newExerciseId,
      ]);

      // Update working day and exercises
      setWorkingDay(updatedDay);
      const frontendExercises = convertBackendToFrontend(updatedDay.exercises);
      setExercises(frontendExercises);

      alert(
        `Exercise "${
          oldExercise?.name || "Exercise"
        }" has been replaced with "${newExercise?.title || "new exercise"}"!`
      );
    } catch (err) {
      console.error("Error replacing exercise:", err);
      setError("Error replacing exercise");
    } finally {
      setIsLoading(false);
    }
  };

  // Load workout from database if dayId is provided
  useEffect(() => {
    // Check for dayId in localStorage first, then URL as fallback
    const storedDayId = localStorage.getItem("selectedDayId");
    const urlParams = new URLSearchParams(window.location.search);
    const urlDayId = urlParams.get("dayId");

    const dayId = storedDayId || urlDayId;

    // Always load all exercises for exercise management
    loadAllExercises();

    // Load available trainings for VOIX context
    loadAvailableTrainings();

    if (dayId) {
      loadWorkingDay(parseInt(dayId));
      // Clear the stored dayId after using it
      if (storedDayId) {
        localStorage.removeItem("selectedDayId");
      }
    }
  }, []);

  // Function to load all available training plans and days
  const loadAvailableTrainings = async () => {
    setIsLoadingPlans(true);
    setError(null);

    try {
      // Load all plans and days in parallel
      const [plans, days] = await Promise.all([
        apiService.getWorkingPlans(),
        apiService.getWorkingDays(),
      ]);

      setAvailablePlans(plans);
      setAvailableDays(days);
    } catch (err) {
      console.error("Error loading trainings:", err);
      setError("Failed to load available trainings");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // Function to handle training loading with workout check
  const handleLoadTraining = async () => {
    if (isWorkoutActive) {
      const confirmAction = window.confirm(
        "A workout is currently active! Do you want to end the workout and load a new training?\n\nClick 'OK' to end the workout and load a new training, or 'Cancel' to continue with the current workout."
      );
      if (!confirmAction) {
        return; // User cancelled, stay with current workout
      }
      // Stop the current workout first
      await stopWorkout();
    }

    // Load available trainings and open modal
    await loadAvailableTrainings();
    setIsTrainingModalOpen(true);
  };

  // Function to select and load a specific training day
  const selectTrainingDay = async (dayId: number) => {
    setIsTrainingModalOpen(false);
    setSelectedPlan(null);
    await loadWorkingDay(dayId);
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
        err instanceof Error ? err.message : "Error loading training day"
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
      setError("Error saving workout results");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete workout function for the dedicated button
  const completeWorkout = async () => {
    if (Object.keys(exerciseSets).length === 0) {
      setError("No sets recorded. Complete at least one set.");
      return;
    }

    if (!workingDay) {
      setError(
        "No training loaded from database. Load a training first to save results."
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
        `Workout successfully saved! 🎉\n\n📊 Summary:\n• ${totalSets} sets recorded\n• ${exerciseCount} exercises trained\n• Training: ${workingDay.title}`
      );

      // Clear sets after successful save
      setExerciseSets({});
      setCompletedExercises(new Set());

      // Optionally redirect to statistics or home
      // window.location.href = "/#/statistiken";
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
      alert("All exercises completed! 🎉 Don't forget to save your workout!");
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
  const handleCreateExercise = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { title, description, weight, reps } = details;
    console.log("VOIX: Creating new exercise", title);

    if (!title) {
      setError("Exercise name is required for VOIX command");
      return;
    }

    await createNewExercise(title, description, weight, reps);
  };

  const handleAddExerciseToDay = (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { exerciseName } = details;
    console.log("VOIX: Adding exercise to day", exerciseName);

    // Finde die Übung in allExercises
    const exercise = allExercises.find(
      (ex) =>
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
    const exercise = exercises.find(
      (ex) =>
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
    console.log(
      "VOIX: Replacing exercise",
      oldExerciseName,
      "with",
      newExerciseName
    );

    // Finde die alte Übung
    const oldExercise = exercises.find(
      (ex) =>
        ex.name.toLowerCase().includes(oldExerciseName.toLowerCase()) ||
        oldExerciseName.toLowerCase().includes(ex.name.toLowerCase())
    );

    // Finde die neue Übung
    const newExercise = allExercises.find(
      (ex) =>
        ex.title.toLowerCase().includes(newExerciseName.toLowerCase()) ||
        newExerciseName.toLowerCase().includes(ex.title.toLowerCase())
    );

    if (oldExercise?.id && newExercise?.id) {
      replaceExerciseInWorkingDay(oldExercise.id, newExercise.id);
    }
  };

  // Training Selection VOIX Handlers
  const handleLoadTrainingByName = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { planName, dayName, dayNumber } = details;
    console.log("VOIX: Loading training by name", {
      planName,
      dayName,
      dayNumber,
    });

    // Load available trainings first and get the fresh data
    setIsLoadingPlans(true);
    setError(null);

    try {
      const [plans, days] = await Promise.all([
        apiService.getWorkingPlans(),
        apiService.getWorkingDays(),
      ]);

      console.log("Loaded plans:", plans);
      console.log("Loaded days:", days);

      // Update state
      setAvailablePlans(plans);
      setAvailableDays(days);

      let targetDay: WorkingDay | null = null;

      if (planName && (dayName || dayNumber)) {
        // Find specific day in specific plan
        const plan = plans.find(
          (p) =>
            p.title.toLowerCase().includes(planName.toLowerCase()) ||
            planName.toLowerCase().includes(p.title.toLowerCase())
        );

        console.log("Found plan:", plan);

        if (plan) {
          if (dayNumber) {
            // Find by day number
            targetDay =
              days.find(
                (day) => day.plan_id === plan.id && day.day_number === dayNumber
              ) || null;
          } else if (dayName) {
            // Find by day name
            targetDay =
              days.find(
                (day) =>
                  day.plan_id === plan.id &&
                  (day.title.toLowerCase().includes(dayName.toLowerCase()) ||
                    dayName.toLowerCase().includes(day.title.toLowerCase()))
              ) || null;
          }
        }
      } else if (dayName && !planName) {
        // Find day by name across all plans
        targetDay =
          days.find(
            (day) =>
              day.title.toLowerCase().includes(dayName.toLowerCase()) ||
              dayName.toLowerCase().includes(day.title.toLowerCase())
          ) || null;
      }

      console.log("Found target day:", targetDay);

      if (targetDay?.id) {
        console.log("VOIX: Found training day:", targetDay.title);
        await selectTrainingDay(targetDay.id);
      } else {
        const errorMessage = `Training not found. Plan: "${
          planName || "any"
        }", Day: "${dayName || dayNumber || "any"}"`;
        console.log("VOIX Error:", errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error loading trainings for VOIX:", err);
      setError("Failed to load available trainings");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleOpenTrainingSelection = async (_event: Event) => {
    console.log("VOIX: Opening training selection");
    await handleLoadTraining();
  };

  const handleListAvailableTrainings = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    const { planName } = details;
    console.log("VOIX: Listing available trainings", { planName });

    try {
      const [plans, days] = await Promise.all([
        apiService.getWorkingPlans(),
        apiService.getWorkingDays(),
      ]);

      setAvailablePlans(plans);
      setAvailableDays(days);

      if (planName) {
        // List days in specific plan
        const plan = plans.find(
          (p) =>
            p.title.toLowerCase().includes(planName.toLowerCase()) ||
            planName.toLowerCase().includes(p.title.toLowerCase())
        );

        if (plan) {
          const planDays = days.filter((day) => day.plan_id === plan.id);
          const daysList = planDays
            .map((day) => `Day ${day.day_number}: ${day.title}`)
            .join(", ");
          alert(
            `Available days in "${plan.title}":\n${daysList || "No days found"}`
          );
        } else {
          setError(`Plan "${planName}" not found`);
        }
      } else {
        // List all plans
        const plansList = plans
          .map(
            (plan) =>
              `${plan.title} (${
                days.filter((day) => day.plan_id === plan.id).length
              } days)`
          )
          .join("\n");

        const individualDays = days.filter((day) => !day.plan_id);
        const individualDaysList = individualDays
          .map((day) => day.title)
          .join("\n");

        alert(
          `Available training plans:\n${
            plansList || "No plans found"
          }\n\nIndividual days:\n${individualDaysList || "No individual days"}`
        );
      }
    } catch (err) {
      console.error("Error loading trainings for listing:", err);
      setError("Failed to load available trainings");
    }
  };

  return (
    <Box py={8}>
      {/* VOIX Context Elements */}
      {/* @ts-ignore */}
      <context name="workoutState">
        Workout is {isWorkoutActive ? "active" : "inactive"}. Current exercise:{" "}
        {currentExercise + 1} of {exercises.length} (
        {exercises[currentExercise]?.name || "none"}). Pause timer:{" "}
        {pauseTimer > 0 ? `${pauseTimer} seconds` : "not active"}. Completed
        exercises: {completedExercises.size} of {exercises.length}.
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="currentExercise">
        {exercises[currentExercise]
          ? JSON.stringify(exercises[currentExercise])
          : "No current exercise"}
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
          ? `Training loaded from database: ${workingDay.title} (ID: ${workingDay.id})`
          : "No training loaded from database (using mock exercises)"}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="currentExerciseSets">
        Current exercise ({currentExercise}):{" "}
        {exercises[currentExercise]?.name || "none"}. Completed sets:{" "}
        {exerciseSets[currentExercise]?.length || 0}. Sets details:{" "}
        {exerciseSets[currentExercise]
          ? JSON.stringify(exerciseSets[currentExercise])
          : "no sets"}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="exerciseManagement">
        Exercise Management is available: {workingDay ? "Yes" : "No"}. Available
        exercises to add:{" "}
        {
          allExercises.filter(
            (ex) => !exercises.some((currentEx) => currentEx.id === ex.id)
          ).length
        }
        . Current exercises in training: {exercises.length}. All available
        exercises:{" "}
        {JSON.stringify(
          allExercises.map((ex) => ({ id: ex.id, title: ex.title }))
        )}
        . VOIX can create, add, remove, and replace exercises without UI
        interaction.
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="availableTrainings">
        Available training plans: {availablePlans.length}. Plans:{" "}
        {JSON.stringify(
          availablePlans.map((plan) => ({
            id: plan.id,
            title: plan.title,
            dayCount: availableDays.filter((day) => day.plan_id === plan.id)
              .length,
          }))
        )}
        . Available training days: {availableDays.length}. Days:{" "}
        {JSON.stringify(
          availableDays.map((day) => ({
            id: day.id,
            title: day.title,
            dayNumber: day.day_number,
            planId: day.plan_id,
            exerciseCount: day.exercises?.length || 0,
          }))
        )}
        . VOIX can load trainings by saying things like "nimm Tag 3 aus dem Push
        Pull Plan" or "lade Brust Training" or "öffne Training Auswahl".
        {/* @ts-ignore */}
      </context>

      {/* VOIX Tool Elements */}
      <Tool
        name="start_workout"
        description="Starts the workout"
        onCall={handleStartWorkout}
      />

      <Tool
        name="load_working_day"
        description="Loads a training day from the database"
        onCall={handleLoadWorkingDay}
      >
        {/* @ts-ignore */}
        <prop
          name="dayId"
          type="number"
          required
          description="ID of the training day from the database"
        />
      </Tool>

      <Tool
        name="pause_workout"
        description="Pauses the workout for a specific time"
        onCall={handlePauseWorkout}
      >
        {/* @ts-ignore */}
        <prop
          name="pauseTime"
          type="number"
          description="Pause time in seconds (default: 30)"
        />
      </Tool>

      <Tool
        name="stop_workout"
        description="Stops the workout completely and saves results to database"
        onCall={handleStopWorkout}
      />

      <Tool
        name="complete_set"
        description="Marks the current set as completed"
        onCall={handleCompleteSet}
      />

      <Tool
        name="complete_multiple_sets"
        description="Marks multiple sets of the current exercise as completed"
        onCall={handleCompleteMultipleSets}
      >
        {/* @ts-ignore */}
        <prop
          name="count"
          type="number"
          required
          description="Number of sets to mark as completed"
        />
      </Tool>

      <Tool
        name="next_exercise"
        description="Switches to the next exercise"
        onCall={handleNextExercise}
      />

      <Tool
        name="previous_exercise"
        description="Switches to the previous exercise"
        onCall={handlePreviousExercise}
      />

      <Tool
        name="update_exercise"
        description="Updates weight and repetitions of an exercise"
        onCall={handleUpdateExercise}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseIndex"
          type="number"
          required
          description="Index of the exercise to update (0-based)"
        />
        {/* @ts-ignore */}
        <prop name="weight" type="number" description="New weight in kg" />
        {/* @ts-ignore */}
        <prop
          name="reps"
          type="number"
          description="New number of repetitions"
        />
      </Tool>

      <Tool
        name="jump_to_exercise"
        description="Jumps directly to a specific exercise"
        onCall={handleJumpToExercise}
      >
        {/* @ts-ignore */}
        <prop
          name="exerciseIndex"
          type="number"
          required
          description="Index of the exercise to jump to (0-based)"
        />
      </Tool>

      <Tool
        name="edit_set"
        description="Edits an existing set of an exercise"
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

      {/* Training Selection Tools */}
      <Tool
        name="load_training_by_name"
        description="Lädt ein Training anhand des Plan- und Tagesnamens oder der Tagesnummer"
        onCall={handleLoadTrainingByName}
      >
        {/* @ts-ignore */}
        <prop
          name="planName"
          type="string"
          description="Name oder Teil des Namens des Trainingsplans (z.B. 'Push Pull', 'Ganzkörper')"
        />
        {/* @ts-ignore */}
        <prop
          name="dayName"
          type="string"
          description="Name oder Teil des Namens des Trainingstages (z.B. 'Push Day', 'Brust Training')"
        />
        {/* @ts-ignore */}
        <prop
          name="dayNumber"
          type="number"
          description="Nummer des Trainingstages im Plan (z.B. 1, 2, 3)"
        />
      </Tool>

      <Tool
        name="open_training_selection"
        description="Öffnet das Trainingsauswahl-Menü"
        onCall={handleOpenTrainingSelection}
      />

      <Tool
        name="list_available_trainings"
        description="Zeigt verfügbare Trainingspläne und -tage an"
        onCall={handleListAvailableTrainings}
      >
        {/* @ts-ignore */}
        <prop
          name="planName"
          type="string"
          description="Name des Plans um nur dessen Tage anzuzeigen (optional)"
        />
      </Tool>

      <Container maxW="6xl">
        {/* Back to Training Plans Button */}
        <Flex justify="flex-start" mb={6}>
          <Button
            size="sm"
            bg="orange.500"
            color="white"
            _hover={{ bg: "orange.600" }}
            onClick={() => (window.location.href = "/#/trainingsplan")}
          >
            <Flex align="center" gap={2}>
              <FaArrowLeft />
              Back to Training Plans
            </Flex>
          </Button>
        </Flex>

        {/* Workout Header */}
        <Stack gap={4} textAlign="center" mb={12}>
          <Heading size="2xl" color="text.primary">
            <Flex
              align="center"
              justify="center"
              gap={isWorkoutActive ? 0.5 : 3}
            >
              {isWorkoutActive ? <RunningAnimation size={55} /> : <FaRunning />}
              Live Workout
            </Flex>
          </Heading>
          <Text fontSize="lg" color="text.secondary">
            {workingDay
              ? `Training: ${workingDay.title}`
              : "Follow the timer and give your best!"}
          </Text>

          {/* Database status */}
          {workingDay ? (
            <Text fontSize="sm" color="green.600">
              <Flex align="center" justify="center" gap={2}>
                <FaCheckCircle />
                Training loaded from database (results will be saved)
              </Flex>
            </Text>
          ) : (
            <Flex justify="center" gap={4} align="center">
              <Text fontSize="sm" color="orange.600">
                <Flex align="center" gap={2}>
                  <FaExclamationTriangle />
                  Mock training (not from database)
                </Flex>
              </Text>
              <Button
                size="sm"
                bg="accent.primary"
                color="white"
                _hover={{ bg: "accent.secondary" }}
                onClick={handleLoadTraining}
              >
                <Flex align="center" gap={2}>
                  <FaClipboardList />
                  Load Training from Database
                </Flex>
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
                      {exercises[currentExercise]?.name || "Ready?"}
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
                              Weight (kg)
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
                              Repetitions
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
                          Sets completed:{" "}
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
                        <Flex align="center" gap={2}>
                          <FaPlay />
                          Start Workout
                        </Flex>
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
                          <Flex align="center" gap={2}>
                            <FaCheck />
                            Set Completed
                          </Flex>
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
                          <Flex align="center" gap={2}>
                            <FaArrowLeft />
                            Back
                          </Flex>
                        </Button>
                        <Button
                          size="lg"
                          bg="blue.500"
                          color="white"
                          _hover={{ bg: "blue.600" }}
                          px={6}
                          onClick={nextExercise}
                        >
                          <Flex align="center" gap={2}>
                            <FaArrowRight />
                            Next Exercise
                          </Flex>
                        </Button>
                        <Button
                          size="lg"
                          bg="yellow.500"
                          color="white"
                          _hover={{ bg: "yellow.600" }}
                          px={6}
                          onClick={() => setIsPauseInputModalOpen(true)}
                        >
                          <Flex align="center" gap={2}>
                            <FaPause />
                            Pause
                          </Flex>
                        </Button>
                        <Button
                          size="lg"
                          bg="red.500"
                          color="white"
                          _hover={{ bg: "red.600" }}
                          px={6}
                          onClick={stopWorkout}
                        >
                          <Flex align="center" gap={2}>
                            <FaStop />
                            Stop
                          </Flex>
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
                      <Flex align="center" justify="center" gap={2}>
                        <FaTrophy />
                        Finish Workout
                      </Flex>
                    </Heading>
                    <Text color="text.secondary" fontSize="sm">
                      Save your workout to the database with all sets, weights
                      and repetitions
                    </Text>
                    <Text color="text.secondary" fontSize="xs">
                      Recorded so far:{" "}
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
                      <Flex align="center" justify="center" gap={2}>
                        {isLoading ? (
                          <>
                            <Spinner size="sm" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaTrophy />
                            Complete & Save Workout
                          </>
                        )}
                      </Flex>
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
                        <Flex align="center" justify="center" gap={2}>
                          <FaSave />
                          Save Workout
                        </Flex>
                      </Heading>
                      <Text color="text.secondary" fontSize="sm">
                        You have recorded sets. Do you want to save them to the
                        database?
                      </Text>
                      <Text color="text.secondary" fontSize="xs">
                        Recorded:{" "}
                        {Object.values(exerciseSets).reduce(
                          (total, sets) => total + sets.length,
                          0
                        )}{" "}
                        Sets from {Object.keys(exerciseSets).length} exercises
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
                        <Flex align="center" justify="center" gap={2}>
                          {isLoading ? (
                            <>
                              <Spinner size="sm" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave />
                              Save Now
                            </>
                          )}
                        </Flex>
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
                    Workout Progress (Exercises)
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
                    Completed exercises: {completedExercises.size} /{" "}
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
                  Today's Exercises
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
                                : "Bodyweight"}{" "}
                              • {exercise.repetitions} reps
                            </Text>
                            <Text
                              color={isActive ? "white" : "text.secondary"}
                              fontSize="xs"
                            >
                              Sets: {exerciseSets[index]?.length || 0}
                            </Text>
                          </Stack>
                          <Box color={isActive ? "white" : "text.secondary"}>
                            {isCompleted ? (
                              <FaCheck />
                            ) : isActive ? (
                              <FaFire />
                            ) : (
                              <FaClock />
                            )}
                          </Box>
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
                      <Flex align="center" gap={2}>
                        <FaChartBar />
                        Database Training
                      </Flex>
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      Plan ID: {workingDay.plan_id}
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      Day ID: {workingDay.id}
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      Exercises: {workingDay.exercises.length}
                    </Text>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Grid>
        )}

        {/* Training Selection Modal */}
        {isTrainingModalOpen && (
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
            p={4}
          >
            <Box
              bg="bg.secondary"
              p={6}
              rounded="lg"
              borderColor="accent.primary"
              borderWidth="2px"
              maxW="800px"
              maxH="80vh"
              w="full"
              overflow="hidden"
            >
              <Stack gap={6} h="full">
                {/* Modal Header */}
                <Stack direction="row" justify="space-between" align="center">
                  <Heading size="lg" color="text.primary">
                    <Flex align="center" gap={2}>
                      <FaClipboardList />
                      Select Training
                    </Flex>
                  </Heading>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTrainingModalOpen(false)}
                    bg="orange.500"
                    color="black"
                    _hover={{ bg: "orange.600", color: "black" }}
                    borderRadius="md"
                    fontWeight="bold"
                  >
                    <FaTimes />
                  </Button>
                </Stack>

                {/* Loading State */}
                {isLoadingPlans ? (
                  <Flex justify="center" py={12}>
                    <Stack align="center" gap={4}>
                      <Spinner size="xl" color="accent.primary" />
                      <Text color="text.secondary">Loading trainings...</Text>
                    </Stack>
                  </Flex>
                ) : (
                  <Box overflow="auto" flex="1">
                    {/* Plans Selection */}
                    {!selectedPlan ? (
                      <Stack gap={4}>
                        <Text color="text.secondary" fontSize="sm">
                          Choose a training plan to see available days:
                        </Text>

                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: "repeat(2, 1fr)",
                          }}
                          gap={4}
                        >
                          {availablePlans.map((plan) => (
                            <Box
                              key={plan.id}
                              p={4}
                              bg="bg.tertiary"
                              borderColor="border"
                              borderWidth="1px"
                              rounded="md"
                              cursor="pointer"
                              transition="all 0.2s"
                              _hover={{
                                borderColor: "accent.primary",
                                bg: "bg",
                              }}
                              onClick={() => setSelectedPlan(plan)}
                            >
                              <Stack gap={2}>
                                <Text fontWeight="bold" color="text.primary">
                                  <Flex align="center" gap={2}>
                                    <FaCalendarAlt />
                                    {plan.title}
                                  </Flex>
                                </Text>
                                {plan.description && (
                                  <Text fontSize="sm" color="text.secondary">
                                    {plan.description}
                                  </Text>
                                )}
                                <Text fontSize="xs" color="text.secondary">
                                  {plan.days?.length || 0} training days
                                </Text>
                              </Stack>
                            </Box>
                          ))}
                        </Grid>

                        {/* Direct Day Selection (for days without plans) */}
                        {availableDays.some((day) => !day.plan_id) && (
                          <Box mt={6}>
                            <Text color="text.secondary" fontSize="sm" mb={4}>
                              Or choose from individual training days:
                            </Text>

                            <Grid
                              templateColumns={{
                                base: "1fr",
                                md: "repeat(2, 1fr)",
                              }}
                              gap={3}
                            >
                              {availableDays
                                .filter((day) => !day.plan_id)
                                .map((day) => (
                                  <Box
                                    key={day.id}
                                    p={3}
                                    bg="bg.tertiary"
                                    borderColor="border"
                                    borderWidth="1px"
                                    rounded="md"
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    _hover={{
                                      borderColor: "accent.primary",
                                      bg: "bg",
                                    }}
                                    onClick={() => selectTrainingDay(day.id!)}
                                  >
                                    <Stack gap={1}>
                                      <Text
                                        fontWeight="bold"
                                        color="text.primary"
                                        fontSize="sm"
                                      >
                                        <Flex align="center" gap={2}>
                                          <FaDumbbell />
                                          {day.title}
                                        </Flex>
                                      </Text>
                                      {day.description && (
                                        <Text
                                          fontSize="xs"
                                          color="text.secondary"
                                        >
                                          {day.description}
                                        </Text>
                                      )}
                                      <Text
                                        fontSize="xs"
                                        color="text.secondary"
                                      >
                                        {day.exercises?.length || 0} exercises
                                      </Text>
                                    </Stack>
                                  </Box>
                                ))}
                            </Grid>
                          </Box>
                        )}
                      </Stack>
                    ) : (
                      /* Day Selection within Plan */
                      <Stack gap={4}>
                        <Flex align="center" gap={2}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPlan(null)}
                            bg="orange.500"
                            color="black"
                            _hover={{ bg: "orange.600", color: "black" }}
                            borderRadius="md"
                            fontWeight="bold"
                          >
                            <FaArrowLeft />
                          </Button>
                          <Text color="text.secondary" fontSize="sm">
                            Training days in:{" "}
                            <Text
                              as="span"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              {selectedPlan.title}
                            </Text>
                          </Text>
                        </Flex>

                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: "repeat(2, 1fr)",
                          }}
                          gap={4}
                        >
                          {availableDays
                            .filter((day) => day.plan_id === selectedPlan.id)
                            .sort((a, b) => a.day_number - b.day_number)
                            .map((day) => (
                              <Box
                                key={day.id}
                                p={4}
                                bg="bg.tertiary"
                                borderColor="border"
                                borderWidth="1px"
                                rounded="md"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{
                                  borderColor: "accent.primary",
                                  bg: "bg",
                                }}
                                onClick={() => selectTrainingDay(day.id!)}
                              >
                                <Stack gap={2}>
                                  <Text fontWeight="bold" color="text.primary">
                                    <Flex align="center" gap={2}>
                                      <FaDumbbell />
                                      Day {day.day_number}: {day.title}
                                    </Flex>
                                  </Text>
                                  {day.description && (
                                    <Text fontSize="sm" color="text.secondary">
                                      {day.description}
                                    </Text>
                                  )}
                                  <Text fontSize="xs" color="text.secondary">
                                    {day.exercises?.length || 0} exercises
                                  </Text>
                                </Stack>
                              </Box>
                            ))}
                        </Grid>

                        {availableDays.filter(
                          (day) => day.plan_id === selectedPlan.id
                        ).length === 0 && (
                          <Box p={8} textAlign="center">
                            <Text color="text.secondary">
                              No training days found for this plan.
                            </Text>
                          </Box>
                        )}
                      </Stack>
                    )}

                    {/* Empty State */}
                    {availablePlans.length === 0 &&
                      availableDays.length === 0 &&
                      !isLoadingPlans && (
                        <Box p={8} textAlign="center">
                          <Stack gap={4} align="center">
                            <FaExclamationTriangle size={48} color="orange" />
                            <Text color="text.primary" fontWeight="bold">
                              No Trainings Available
                            </Text>
                            <Text color="text.secondary" fontSize="sm">
                              Create some training plans and days first to use
                              this feature.
                            </Text>
                          </Stack>
                        </Box>
                      )}
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
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
                  The workout will continue automatically
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
                  <Flex align="center" gap={2}>
                    <FaPlay />
                    End Pause
                  </Flex>
                </Button>
              </Stack>
            </Box>
          </Box>
        )}

        {/* Pause Time Input Modal */}
        {isPauseInputModalOpen && (
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
            p={4}
          >
            <Box
              bg="bg.secondary"
              p={8}
              rounded="lg"
              borderColor="accent.primary"
              borderWidth="2px"
              textAlign="center"
              minW="400px"
              maxW="500px"
              w="full"
            >
              <Stack gap={6}>
                {/* Modal Header */}
                <Stack direction="row" justify="space-between" align="center">
                  <Heading size="lg" color="text.primary">
                    <Flex align="center" gap={2}>
                      <FaPause />
                      Set Pause Time
                    </Flex>
                  </Heading>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPauseInputModalOpen(false)}
                    bg="orange.500"
                    color="black"
                    _hover={{ bg: "orange.600", color: "black" }}
                    borderRadius="md"
                    fontWeight="bold"
                  >
                    <FaTimes />
                  </Button>
                </Stack>

                <Text color="text.secondary" fontSize="sm">
                  Choose how long you want to pause your workout
                </Text>

                {/* Quick Select Buttons */}
                <Stack gap={3}>
                  <Text color="text.primary" fontSize="sm" fontWeight="bold">
                    Quick Select:
                  </Text>
                  <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    {[30, 60, 90, 120, 180, 300].map((seconds) => (
                      <Button
                        key={seconds}
                        size="md"
                        bg="bg.tertiary"
                        color="text.primary"
                        borderColor="border"
                        borderWidth="1px"
                        _hover={{
                          bg: "accent.primary",
                          color: "white",
                          borderColor: "accent.primary",
                        }}
                        onClick={() => {
                          pauseWorkout(seconds);
                          setIsPauseInputModalOpen(false);
                        }}
                      >
                        {seconds < 60 ? `${seconds}s` : `${seconds / 60}min`}
                      </Button>
                    ))}
                  </Grid>
                </Stack>

                {/* Custom Time Input */}
                <Stack gap={3}>
                  <Text color="text.primary" fontSize="sm" fontWeight="bold">
                    Custom Time:
                  </Text>
                  <Stack direction="row" gap={3} align="center">
                    <Input
                      value={customPauseTime}
                      onChange={(e) => setCustomPauseTime(e.target.value)}
                      placeholder="30"
                      type="number"
                      min="1"
                      max="3600"
                      textAlign="center"
                      fontSize="lg"
                      fontWeight="bold"
                      bg="bg.tertiary"
                      borderColor="border"
                      _focus={{
                        borderColor: "accent.primary",
                        boxShadow:
                          "0 0 0 1px var(--chakra-colors-accent-primary)",
                      }}
                    />
                    <Text color="text.secondary" fontSize="sm">
                      seconds
                    </Text>
                  </Stack>
                  <Button
                    size="lg"
                    bg="accent.primary"
                    color="white"
                    _hover={{ bg: "accent.secondary" }}
                    px={8}
                    onClick={() => {
                      const seconds = Number(customPauseTime);
                      if (seconds > 0) {
                        pauseWorkout(seconds);
                        setIsPauseInputModalOpen(false);
                      }
                    }}
                    disabled={!customPauseTime || Number(customPauseTime) <= 0}
                  >
                    <Flex align="center" gap={2}>
                      Start Pause
                    </Flex>
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default LiveWorkout;
