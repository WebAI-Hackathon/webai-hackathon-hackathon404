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
  Badge,
  Input,
} from "@chakra-ui/react";
import { Tool } from "../components/Tool";

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
  const [exercises, setExercises] = useState([
    { name: "Jumping Jacks", weight: 0, reps: 30 },
    { name: "Push-ups", weight: 0, reps: 15 },
    { name: "Squats", weight: 20, reps: 12 },
    { name: "Plank", weight: 0, reps: 1 },
    { name: "Burpees", weight: 0, reps: 10 },
  ]);
  const [editingExercise, setEditingExercise] = useState<number | null>(null);
  const [tempWeight, setTempWeight] = useState(0);
  const [tempReps, setTempReps] = useState(0);

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

  const stopWorkout = () => {
    setIsWorkoutActive(false);
    setCurrentExercise(0);
    setIsPauseModalOpen(false);
  };

  const completeSet = () => {
    const newSets = { ...exerciseSets };
    if (!newSets[currentExercise]) {
      newSets[currentExercise] = [];
    }
    newSets[currentExercise].push({
      reps: exercises[currentExercise]?.reps || 0,
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
      setIsWorkoutActive(false);
      setCurrentExercise(0);
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
    newExercises[index] = { ...newExercises[index], weight, reps };
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

  // VOIX Tool Handlers
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
        reps: reps || exercises[exerciseIndex]?.reps || 0,
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
          reps: reps || exercises[exerciseIndex]?.reps || 0,
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
          reps: exercises[currentExercise]?.reps || 0,
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
          reps: set.reps || exercises[exerciseIndex]?.reps || 0,
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
      <context name="currentExerciseSets">
        Aktuelle Übung ({currentExercise}):{" "}
        {exercises[currentExercise]?.name || "keine"}. Abgeschlossene Sets:{" "}
        {exerciseSets[currentExercise]?.length || 0}. Sets Details:{" "}
        {exerciseSets[currentExercise]
          ? JSON.stringify(exerciseSets[currentExercise])
          : "keine Sets"}
        {/* @ts-ignore */}
      </context>

      {/* VOIX Tool Elements */}
      <Tool
        name="start_workout"
        description="Startet das Workout"
        onCall={handleStartWorkout}
      />

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
        description="Stoppt das Workout komplett"
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
      <Container maxW="6xl">
        {/* Workout Header */}
        <Stack gap={4} textAlign="center" mb={12}>
          <Heading size="2xl" color="text.primary">
            🏃‍♂️ Live Workout
          </Heading>
          <Text fontSize="lg" color="text.secondary">
            Folge dem Timer und gib dein Bestes!
          </Text>
        </Stack>

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
                                  exercises[currentExercise]?.reps || 0
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
                                  exercises[currentExercise]?.reps || 0
                                );
                              }}
                              _hover={{ color: "accent.primary" }}
                            >
                              {exercises[currentExercise]?.reps || 0}
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
                            • {exercise.reps} Wdh.
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
          </Stack>
        </Grid>

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
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default LiveWorkout;
