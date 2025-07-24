import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Grid,
  Stack,
  Badge,
  Card,
  Flex,
  Input,
  Textarea,
  Spinner,
} from "@chakra-ui/react";
import { Tool } from "../components/Tool";
import { apiService } from "../services/api";
import type { WorkingPlan } from "../services/api";

// Frontend Types (für Kompatibilität mit der bestehenden UI)
interface FrontendExercise {
  name: string;
  repetitions: number;
  weight: number;
}

interface TrainingDay {
  id: string;
  name: string;
  focus: string;
  exercises: FrontendExercise[];
  duration: number;
}

interface TrainingWeek {
  id: string;
  name: string;
  description: string;
  days: TrainingDay[];
}

const Trainingsplan = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showNewWeekDialog, setShowNewWeekDialog] = useState(false);
  const [showNewDayDialog, setShowNewDayDialog] = useState(false);
  const [showEditDayDialog, setShowEditDayDialog] = useState(false);
  const [currentWeekId, setCurrentWeekId] = useState<string>("");
  const [editingDay, setEditingDay] = useState<TrainingDay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWeekData, setNewWeekData] = useState({
    name: "",
    description: "",
  });
  const [newDayData, setNewDayData] = useState({
    name: "",
    focus: "",
    exercises: [{ name: "", repetitions: 10, weight: 0 }] as FrontendExercise[],
    duration: 30,
  });

  const [trainingWeeks, setTrainingWeeks] = useState<TrainingWeek[]>([]);

  // Hilfsfunktionen für die Datenkonvertierung zwischen Frontend und Backend
  const convertBackendToFrontend = (
    workingPlans: WorkingPlan[]
  ): TrainingWeek[] => {
    return workingPlans.map((plan) => ({
      id: plan.id?.toString() || "",
      name: plan.title,
      description: plan.description || "",
      days: plan.days.map((day) => ({
        id: day.id?.toString() || "",
        name: day.title,
        focus: day.description || "Ganzkörper",
        duration: 30, // Default duration, kann später erweitert werden
        exercises: day.exercises.map((exercise) => ({
          name: exercise.title,
          repetitions: exercise.first_set_reps || 10,
          weight: exercise.first_set_weight || 0,
        })),
      })),
    }));
  };

  // Daten neu laden
  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading training plans from database...");
      const plans = await apiService.getWorkingPlans();
      console.log("Loaded plans from database:", plans);
      const frontendData = convertBackendToFrontend(plans);
      console.log("Converted to frontend format:", frontendData);
      setTrainingWeeks(frontendData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Laden der Trainingspläne"
      );
      console.error("Error loading training plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Daten vom Backend laden
  useEffect(() => {
    refreshData();
  }, []);

  const addNewDay = (weekId: string) => {
    setCurrentWeekId(weekId);
    setNewDayData({
      name: "",
      focus: "",
      exercises: [
        { name: "", repetitions: 10, weight: 0 },
      ] as FrontendExercise[],
      duration: 30,
    });
    setShowNewDayDialog(true);
  };

  const createNewDay = async () => {
    try {
      const targetWeek = trainingWeeks.find((w) => w.id === currentWeekId);
      if (!targetWeek) return;

      // Erstelle Übungen im Backend
      const exercisePromises = newDayData.exercises
        .filter((ex) => ex.name.trim() !== "")
        .map(async (exercise) => {
          return await apiService.createExercise({
            title: exercise.name,
            first_set_reps: exercise.repetitions,
            first_set_weight: exercise.weight,
          });
        });

      const createdExercises = await Promise.all(exercisePromises);
      const exerciseIds = createdExercises.map((ex) => ex.id!);

      // Erstelle WorkingDay im Backend
      await apiService.createWorkingDay({
        day_number: targetWeek.days.length + 1,
        title: newDayData.name || `Tag ${targetWeek.days.length + 1}`,
        description: newDayData.focus || "Ganzkörper",
        plan_id: parseInt(currentWeekId),
        exercise_ids: exerciseIds,
      });

      setShowNewDayDialog(false);
      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error creating new day:", error);
      setError("Fehler beim Erstellen des neuen Trainingstags");
    }
  };

  const addNewWeek = () => {
    setNewWeekData({
      name: "",
      description: "",
    });
    setShowNewWeekDialog(true);
  };

  const createNewWeek = async () => {
    try {
      await apiService.createWorkingPlan({
        title: newWeekData.name || `Woche ${trainingWeeks.length + 1}`,
        description: newWeekData.description || "Neue Trainingswoche",
      });

      setShowNewWeekDialog(false);
      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error creating new week:", error);
      setError("Fehler beim Erstellen der neuen Trainingswoche");
    }
  };

  const editDay = (day: TrainingDay) => {
    setEditingDay(day);
    setNewDayData({
      name: day.name,
      focus: day.focus,
      exercises: [...day.exercises],
      duration: day.duration,
    });
    setShowEditDayDialog(true);
  };

  const updateDay = async () => {
    if (!editingDay) return;

    // Für jetzt nur Frontend State ändern, da Backend keine Update Endpoints hat
    setTrainingWeeks((weeks) =>
      weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          day.id === editingDay.id
            ? {
                ...day,
                name: newDayData.name || day.name,
                focus: newDayData.focus || day.focus,
                exercises: newDayData.exercises.filter(
                  (ex) => ex.name.trim() !== ""
                ),
                duration: newDayData.duration,
              }
            : day
        ),
      }))
    );
    setShowEditDayDialog(false);
    setEditingDay(null);
  };

  // VOIX Tool Handlers
  const handleCreateWeek = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    try {
      await apiService.createWorkingPlan({
        title: details.name || `Woche ${trainingWeeks.length + 1}`,
        description: details.description || "Neue Trainingswoche",
      });

      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error creating new week:", error);
      setError("Fehler beim Erstellen der neuen Trainingswoche");
    }
  };

  const handleCreateDay = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    try {
      const targetWeek = trainingWeeks.find((w) => w.id === details.weekId);
      if (!targetWeek) return;

      // Erstelle Übungen falls vorhanden
      let exerciseIds: number[] = [];
      if (details.exercises && details.exercises.length > 0) {
        const exercisePromises = details.exercises
          .filter((ex: any) => ex.name && ex.name.trim() !== "")
          .map(async (exercise: any) => {
            return await apiService.createExercise({
              title: exercise.name,
              first_set_reps: exercise.repetitions || 10,
              first_set_weight: exercise.weight || 0,
            });
          });
        const createdExercises = await Promise.all(exercisePromises);
        exerciseIds = createdExercises.map((ex) => ex.id!);
      }

      // Erstelle WorkingDay im Backend
      await apiService.createWorkingDay({
        day_number: targetWeek.days.length + 1,
        title: details.name || `Tag ${targetWeek.days.length + 1}`,
        description: details.focus || "Ganzkörper",
        plan_id: parseInt(details.weekId),
        exercise_ids: exerciseIds,
      });

      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error creating new day:", error);
      setError("Fehler beim Erstellen des neuen Trainingstags");
    }
  };

  const handleEditDay = (event: Event) => {
    const details = (event as CustomEvent).detail;
    setTrainingWeeks((weeks) =>
      weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          day.id === details.dayId
            ? {
                ...day,
                name: details.name || day.name,
                focus: details.focus || day.focus,
                exercises: details.exercises || day.exercises,
                duration: details.duration || day.duration,
              }
            : day
        ),
      }))
    );
  };

  const handleDeleteDay = (event: Event) => {
    const details = (event as CustomEvent).detail;
    setTrainingWeeks((weeks) =>
      weeks.map((week) => ({
        ...week,
        days: week.days.filter((day) => day.id !== details.dayId),
      }))
    );
  };

  const handleDeleteWeek = (event: Event) => {
    const details = (event as CustomEvent).detail;
    setTrainingWeeks((weeks) =>
      weeks.filter((week) => week.id !== details.weekId)
    );
  };

  const handleStartWorkout = (event: Event) => {
    const details = (event as CustomEvent).detail;
    // Navigation logic could be implemented here
    window.location.href = `/live-workout?dayId=${details.dayId}`;
  };

  return (
    <Box py={8}>
      {/* VOIX Context Elements */}
      {/* @ts-ignore */}
      <context name="trainingWeeks">
        {JSON.stringify(trainingWeeks)}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="selectedDay">
        {selectedDay || "none"}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="appState">
        Die App zeigt aktuell {trainingWeeks.length} Trainingswochen an.
        {selectedDay
          ? `Tag ${selectedDay} ist ausgewählt.`
          : "Kein Tag ausgewählt."}
        {showNewWeekDialog ? "Dialog für neue Woche ist geöffnet." : ""}
        {showNewDayDialog ? "Dialog für neuen Tag ist geöffnet." : ""}
        {showEditDayDialog ? "Dialog für Tag-Bearbeitung ist geöffnet." : ""}
        {/* @ts-ignore */}
      </context>

      {/* VOIX Tool Elements */}
      <Tool
        name="create_training_week"
        description="Erstellt eine neue Trainingswoche mit Namen und Beschreibung"
        onCall={handleCreateWeek}
      >
        {/* @ts-ignore */}
        <prop
          name="name"
          type="string"
          required
          description="Name der neuen Trainingswoche"
        />
        {/* @ts-ignore */}
        <prop
          name="description"
          type="string"
          description="Beschreibung der Trainingswoche"
        />
      </Tool>

      <Tool
        name="create_training_day"
        description="Erstellt einen neuen Trainingstag in einer bestimmten Woche"
        onCall={handleCreateDay}
      >
        {/* @ts-ignore */}
        <prop
          name="weekId"
          type="string"
          required
          description="ID der Woche, zu der der Tag hinzugefügt werden soll"
        />
        {/* @ts-ignore */}
        <prop
          name="name"
          type="string"
          required
          description="Name des Trainingstags"
        />
        {/* @ts-ignore */}
        <prop
          name="focus"
          type="string"
          required
          description="Trainingsfokus (z.B. Oberkörper, Unterkörper, Ganzkörper)"
        />
        {/* @ts-ignore */}
        <prop
          name="duration"
          type="number"
          description="Dauer in Minuten (Standard: 30)"
        />
        {/* @ts-ignore */}
        <prop name="exercises" type="array" description="Liste der Übungen">
          {/* @ts-ignore */}
          <array>
            {/* @ts-ignore */}
            <dict>
              {/* @ts-ignore */}
              <prop
                name="name"
                type="string"
                required
                description="Name der Übung"
              />
              {/* @ts-ignore */}
              <prop
                name="repetitions"
                type="number"
                required
                description="Anzahl Wiederholungen"
              />
              {/* @ts-ignore */}
              <prop
                name="weight"
                type="number"
                description="Gewicht in kg (Standard: 0)"
              />
              {/* @ts-ignore */}
            </dict>
            {/* @ts-ignore */}
          </array>
          {/* @ts-ignore */}
        </prop>
      </Tool>

      <Tool
        name="edit_training_day"
        description="Bearbeitet einen bestehenden Trainingstag"
        onCall={handleEditDay}
      >
        {/* @ts-ignore */}
        <prop
          name="dayId"
          type="string"
          required
          description="ID des zu bearbeitenden Trainingstags"
        />
        {/* @ts-ignore */}
        <prop
          name="name"
          type="string"
          description="Neuer Name des Trainingstags"
        />
        {/* @ts-ignore */}
        <prop name="focus" type="string" description="Neuer Trainingsfokus" />
        {/* @ts-ignore */}
        <prop
          name="duration"
          type="number"
          description="Neue Dauer in Minuten"
        />
        {/* @ts-ignore */}
        <prop
          name="exercises"
          type="array"
          description="Neue Liste der Übungen"
        >
          {/* @ts-ignore */}
          <array>
            {/* @ts-ignore */}
            <dict>
              {/* @ts-ignore */}
              <prop
                name="name"
                type="string"
                required
                description="Name der Übung"
              />
              {/* @ts-ignore */}
              <prop
                name="repetitions"
                type="number"
                required
                description="Anzahl Wiederholungen"
              />
              {/* @ts-ignore */}
              <prop name="weight" type="number" description="Gewicht in kg" />
              {/* @ts-ignore */}
            </dict>
            {/* @ts-ignore */}
          </array>
          {/* @ts-ignore */}
        </prop>
      </Tool>

      <Tool
        name="delete_training_day"
        description="Löscht einen Trainingstag"
        onCall={handleDeleteDay}
      >
        {/* @ts-ignore */}
        <prop
          name="dayId"
          type="string"
          required
          description="ID des zu löschenden Trainingstags"
        />
      </Tool>

      <Tool
        name="delete_training_week"
        description="Löscht eine Trainingswoche"
        onCall={handleDeleteWeek}
      >
        {/* @ts-ignore */}
        <prop
          name="weekId"
          type="string"
          required
          description="ID der zu löschenden Trainingswoche"
        />
      </Tool>

      <Tool
        name="start_workout"
        description="Startet ein Training für einen bestimmten Tag"
        onCall={handleStartWorkout}
      >
        {/* @ts-ignore */}
        <prop
          name="dayId"
          type="string"
          required
          description="ID des Trainingstags, der gestartet werden soll"
        />
      </Tool>

      <Container maxW="6xl">
        <Stack gap={4} textAlign="center" mb={12}>
          <Heading size="2xl" color="text.primary">
            📋 Deine Trainingspläne
          </Heading>
          <Text fontSize="lg" color="text.secondary">
            Verwalte deine Trainingswochen und -tage (Daten aus der Datenbank)
          </Text>
          {trainingWeeks.length > 0 && (
            <Text fontSize="sm" color="green.600">
              ✅ {trainingWeeks.length} Trainingsplan
              {trainingWeeks.length !== 1 ? "e" : ""} aus der Datenbank geladen
            </Text>
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

        <Flex justify="center" mb={8}>
          <Button
            onClick={addNewWeek}
            bg="accent.primary"
            color="white"
            _hover={{ bg: "accent.secondary" }}
            size="lg"
            px={8}
            loading={isLoading}
          >
            ➕ Neue Trainingswoche hinzufügen
          </Button>
        </Flex>

        {/* Loading State */}
        {isLoading ? (
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="accent.primary" />
          </Flex>
        ) : trainingWeeks.length === 0 ? (
          /* Empty State - Keine Daten in der Datenbank */
          <Box textAlign="center" py={12}>
            <Text fontSize="xl" color="text.secondary" mb={4}>
              🏋️‍♂️ Keine Trainingspläne in der Datenbank gefunden
            </Text>
            <Text color="text.secondary" mb={6}>
              Erstelle deinen ersten Trainingsplan, um ihn in der Datenbank zu
              speichern!
            </Text>
            <Button
              onClick={addNewWeek}
              bg="accent.primary"
              color="white"
              _hover={{ bg: "accent.secondary" }}
              size="lg"
            >
              ➕ Ersten Trainingsplan erstellen
            </Button>
          </Box>
        ) : (
          /* Training Plans aus der Datenbank */
          <Stack gap={8}>
            {trainingWeeks.map((week) => (
              <Card.Root key={week.id} bg="bg.secondary" p={6}>
                <Stack gap={6}>
                  <Flex justify="space-between" align="center">
                    <Stack gap={2}>
                      <Heading size="lg" color="text.primary">
                        {week.name}
                      </Heading>
                      <Text color="text.secondary">{week.description}</Text>
                    </Stack>
                    <Button
                      onClick={() => addNewDay(week.id)}
                      bg="accent.primary"
                      color="white"
                      _hover={{ bg: "accent.secondary" }}
                      size="sm"
                    >
                      ➕ Tag hinzufügen
                    </Button>
                  </Flex>

                  {week.days.length > 0 ? (
                    <Grid
                      templateColumns={{
                        base: "1fr",
                        md: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)",
                      }}
                      gap={4}
                    >
                      {week.days.map((day) => (
                        <Card.Root
                          key={day.id}
                          bg="bg"
                          borderColor={
                            selectedDay === day.id ? "accent.primary" : "border"
                          }
                          borderWidth="2px"
                          cursor="pointer"
                          transition="all 0.3s ease"
                          _hover={{
                            borderColor: "accent.primary",
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                          }}
                          onClick={() =>
                            setSelectedDay(
                              selectedDay === day.id ? null : day.id
                            )
                          }
                        >
                          <Card.Body p={4}>
                            <Stack gap={3}>
                              <Flex justify="space-between" align="center">
                                <Heading size="md" color="text.primary">
                                  {day.name}
                                </Heading>
                                <Text fontSize="sm" color="text.secondary">
                                  ⏱️ {day.duration}min
                                </Text>
                              </Flex>

                              <Badge
                                colorPalette="orange"
                                variant="outline"
                                alignSelf="flex-start"
                              >
                                {day.focus}
                              </Badge>

                              <Box>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="text.primary"
                                  mb={2}
                                >
                                  Übungen:
                                </Text>
                                <Stack gap={1}>
                                  {day.exercises.map((exercise, index) => (
                                    <Text
                                      key={index}
                                      fontSize="sm"
                                      color="text.secondary"
                                    >
                                      • {exercise.name} ({exercise.repetitions}x
                                      {exercise.weight > 0
                                        ? `, ${exercise.weight}kg`
                                        : ""}
                                      )
                                    </Text>
                                  ))}
                                </Stack>
                              </Box>

                              <Flex gap={2}>
                                <Button
                                  bg="accent.primary"
                                  color="white"
                                  _hover={{ bg: "accent.secondary" }}
                                  size="sm"
                                  flex="1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = "/live-workout";
                                  }}
                                >
                                  🏃‍♂️ Training starten
                                </Button>
                                <Button
                                  bg="gray.500"
                                  color="white"
                                  _hover={{ bg: "gray.600" }}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    editDay(day);
                                  }}
                                >
                                  ✏️ Bearbeiten
                                </Button>
                              </Flex>
                            </Stack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                    </Grid>
                  ) : (
                    <Box
                      textAlign="center"
                      py={8}
                      border="2px dashed"
                      borderColor="border"
                      borderRadius="lg"
                      bg="bg.tertiary"
                    >
                      <Text color="text.secondary" fontSize="lg">
                        Keine Trainingstage vorhanden
                      </Text>
                      <Text color="text.secondary" fontSize="sm" mt={2}>
                        Klicke auf "Tag hinzufügen" um zu beginnen
                      </Text>
                    </Box>
                  )}
                </Stack>
              </Card.Root>
            ))}

            <Box mt={12} p={6} bg="bg.secondary" borderRadius="lg">
              <Heading size="md" color="text.primary" mb={4} textAlign="center">
                💡 Trainingstipps
              </Heading>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={4}
              >
                <Box
                  textAlign="center"
                  p={4}
                  bg="bg.tertiary"
                  borderRadius="md"
                >
                  <Text fontSize="2xl" mb={2}>
                    🔥
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color="text.primary"
                    mb={1}
                  >
                    Aufwärmen
                  </Text>
                  <Text fontSize="xs" color="text.secondary">
                    Beginne jedes Training mit 5-10 Minuten Aufwärmübungen
                  </Text>
                </Box>
                <Box
                  textAlign="center"
                  p={4}
                  bg="bg.tertiary"
                  borderRadius="md"
                >
                  <Text fontSize="2xl" mb={2}>
                    💧
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color="text.primary"
                    mb={1}
                  >
                    Hydration
                  </Text>
                  <Text fontSize="xs" color="text.secondary">
                    Trinke vor, während und nach dem Training ausreichend Wasser
                  </Text>
                </Box>
                <Box
                  textAlign="center"
                  p={4}
                  bg="bg.tertiary"
                  borderRadius="md"
                >
                  <Text fontSize="2xl" mb={2}>
                    😴
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color="text.primary"
                    mb={1}
                  >
                    Erholung
                  </Text>
                  <Text fontSize="xs" color="text.secondary">
                    Gönne deinem Körper zwischen den Trainingseinheiten Ruhe
                  </Text>
                </Box>
              </Grid>
            </Box>
          </Stack>
        )}

        {/* Dialog für neue Trainingswoche */}
        {showNewWeekDialog && (
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="1000"
          >
            <Box bg="bg.secondary" p={6} borderRadius="lg" maxW="md" w="90%">
              <Stack gap={4}>
                <Heading size="md" color="text.primary">
                  Neue Trainingswoche erstellen
                </Heading>

                <Stack gap={3}>
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Name der Woche:
                    </Text>
                    <Input
                      value={newWeekData.name}
                      onChange={(e) =>
                        setNewWeekData({ ...newWeekData, name: e.target.value })
                      }
                      placeholder="z.B. Kraft Woche 1"
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Beschreibung:
                    </Text>
                    <Textarea
                      value={newWeekData.description}
                      onChange={(e) =>
                        setNewWeekData({
                          ...newWeekData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Beschreibung der Trainingswoche..."
                    />
                  </Box>
                </Stack>

                <Flex gap={3} justify="end">
                  <Button
                    onClick={() => setShowNewWeekDialog(false)}
                    bg="gray.500"
                    color="white"
                    _hover={{ bg: "gray.600" }}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={createNewWeek}
                    bg="accent.primary"
                    color="white"
                    _hover={{ bg: "accent.secondary" }}
                  >
                    Erstellen
                  </Button>
                </Flex>
              </Stack>
            </Box>
          </Box>
        )}

        {/* Dialog für neuen Trainingstag */}
        {showNewDayDialog && (
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="1000"
          >
            <Box bg="bg.secondary" p={6} borderRadius="lg" maxW="md" w="90%">
              <Stack gap={4}>
                <Heading size="md" color="text.primary">
                  Neuen Trainingstag erstellen
                </Heading>

                <Stack gap={3}>
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Name des Trainingstags:
                    </Text>
                    <Input
                      value={newDayData.name}
                      onChange={(e) =>
                        setNewDayData({ ...newDayData, name: e.target.value })
                      }
                      placeholder="z.B. Oberkörper Power"
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Trainings-Fokus:
                    </Text>
                    <Input
                      value={newDayData.focus}
                      onChange={(e) =>
                        setNewDayData({ ...newDayData, focus: e.target.value })
                      }
                      placeholder="z.B. Oberkörper, Unterkörper, Cardio..."
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Dauer (Minuten):
                    </Text>
                    <Input
                      type="number"
                      value={newDayData.duration}
                      onChange={(e) =>
                        setNewDayData({
                          ...newDayData,
                          duration: parseInt(e.target.value) || 30,
                        })
                      }
                      min="10"
                      max="120"
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Übungen:
                    </Text>
                    <Stack gap={2}>
                      {newDayData.exercises.map((exercise, index) => (
                        <Stack key={index} gap={2}>
                          <Flex gap={2} align="end">
                            <Box flex="1">
                              <Text fontSize="xs" mb={1}>
                                Übung:
                              </Text>
                              <Input
                                value={exercise.name}
                                onChange={(e) => {
                                  const newExercises = [
                                    ...newDayData.exercises,
                                  ];
                                  newExercises[index] = {
                                    ...newExercises[index],
                                    name: e.target.value,
                                  };
                                  setNewDayData({
                                    ...newDayData,
                                    exercises: newExercises,
                                  });
                                }}
                                placeholder="Übung eingeben..."
                              />
                            </Box>
                            <Box w="80px">
                              <Text fontSize="xs" mb={1}>
                                Wdh:
                              </Text>
                              <Input
                                type="number"
                                value={exercise.repetitions}
                                onChange={(e) => {
                                  const newExercises = [
                                    ...newDayData.exercises,
                                  ];
                                  newExercises[index] = {
                                    ...newExercises[index],
                                    repetitions: parseInt(e.target.value) || 0,
                                  };
                                  setNewDayData({
                                    ...newDayData,
                                    exercises: newExercises,
                                  });
                                }}
                                min="1"
                              />
                            </Box>
                            <Box w="80px">
                              <Text fontSize="xs" mb={1}>
                                Kg:
                              </Text>
                              <Input
                                type="number"
                                value={exercise.weight}
                                onChange={(e) => {
                                  const newExercises = [
                                    ...newDayData.exercises,
                                  ];
                                  newExercises[index] = {
                                    ...newExercises[index],
                                    weight: parseFloat(e.target.value) || 0,
                                  };
                                  setNewDayData({
                                    ...newDayData,
                                    exercises: newExercises,
                                  });
                                }}
                                min="0"
                                step="0.5"
                              />
                            </Box>
                            {newDayData.exercises.length > 1 && (
                              <Button
                                size="sm"
                                bg="red.500"
                                color="white"
                                _hover={{ bg: "red.600" }}
                                onClick={() => {
                                  const newExercises =
                                    newDayData.exercises.filter(
                                      (_, i) => i !== index
                                    );
                                  setNewDayData({
                                    ...newDayData,
                                    exercises: newExercises,
                                  });
                                }}
                              >
                                ✕
                              </Button>
                            )}
                          </Flex>
                        </Stack>
                      ))}
                      <Button
                        size="sm"
                        bg="accent.primary"
                        color="white"
                        _hover={{ bg: "accent.secondary" }}
                        onClick={() => {
                          setNewDayData({
                            ...newDayData,
                            exercises: [
                              ...newDayData.exercises,
                              { name: "", repetitions: 10, weight: 0 },
                            ],
                          });
                        }}
                      >
                        ➕ Übung hinzufügen
                      </Button>
                    </Stack>
                  </Box>
                </Stack>

                <Flex gap={3} justify="end">
                  <Button
                    onClick={() => setShowNewDayDialog(false)}
                    bg="gray.500"
                    color="white"
                    _hover={{ bg: "gray.600" }}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={createNewDay}
                    bg="accent.primary"
                    color="white"
                    _hover={{ bg: "accent.secondary" }}
                  >
                    Erstellen
                  </Button>
                </Flex>
              </Stack>
            </Box>
          </Box>
        )}

        {/* Dialog für Tag bearbeiten */}
        {showEditDayDialog && (
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="1000"
          >
            <Box
              bg="bg.secondary"
              p={6}
              borderRadius="lg"
              maxW="md"
              w="90%"
              maxH="80vh"
              overflowY="auto"
            >
              <Stack gap={4}>
                <Heading size="md" color="text.primary">
                  Trainingstag bearbeiten
                </Heading>

                <Stack gap={3}>
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Name des Trainingstags:
                    </Text>
                    <Input
                      value={newDayData.name}
                      onChange={(e) =>
                        setNewDayData({ ...newDayData, name: e.target.value })
                      }
                      placeholder="z.B. Oberkörper Power"
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Trainings-Fokus:
                    </Text>
                    <Input
                      value={newDayData.focus}
                      onChange={(e) =>
                        setNewDayData({ ...newDayData, focus: e.target.value })
                      }
                      placeholder="z.B. Oberkörper, Unterkörper, Cardio..."
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Dauer (Minuten):
                    </Text>
                    <Input
                      type="number"
                      value={newDayData.duration}
                      onChange={(e) =>
                        setNewDayData({
                          ...newDayData,
                          duration: parseInt(e.target.value) || 30,
                        })
                      }
                      min="10"
                      max="120"
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Übungen:
                    </Text>
                    <Stack gap={2}>
                      {newDayData.exercises.map((exercise, index) => (
                        <Stack key={index} gap={2}>
                          <Flex gap={2} align="end">
                            <Box flex="1">
                              <Text fontSize="xs" mb={1}>
                                Übung:
                              </Text>
                              <Input
                                value={exercise.name}
                                onChange={(e) => {
                                  const newExercises = [
                                    ...newDayData.exercises,
                                  ];
                                  newExercises[index] = {
                                    ...newExercises[index],
                                    name: e.target.value,
                                  };
                                  setNewDayData({
                                    ...newDayData,
                                    exercises: newExercises,
                                  });
                                }}
                                placeholder="Übung eingeben..."
                              />
                            </Box>
                            <Box w="80px">
                              <Text fontSize="xs" mb={1}>
                                Wdh:
                              </Text>
                              <Input
                                type="number"
                                value={exercise.repetitions}
                                onChange={(e) => {
                                  const newExercises = [
                                    ...newDayData.exercises,
                                  ];
                                  newExercises[index] = {
                                    ...newExercises[index],
                                    repetitions: parseInt(e.target.value) || 0,
                                  };
                                  setNewDayData({
                                    ...newDayData,
                                    exercises: newExercises,
                                  });
                                }}
                                min="1"
                              />
                            </Box>
                            <Box w="80px">
                              <Text fontSize="xs" mb={1}>
                                Kg:
                              </Text>
                              <Input
                                type="number"
                                value={exercise.weight}
                                onChange={(e) => {
                                  const newExercises = [
                                    ...newDayData.exercises,
                                  ];
                                  newExercises[index] = {
                                    ...newExercises[index],
                                    weight: parseFloat(e.target.value) || 0,
                                  };
                                  setNewDayData({
                                    ...newDayData,
                                    exercises: newExercises,
                                  });
                                }}
                                min="0"
                                step="0.5"
                              />
                            </Box>
                            {newDayData.exercises.length > 1 && (
                              <Button
                                size="sm"
                                bg="red.500"
                                color="white"
                                _hover={{ bg: "red.600" }}
                                onClick={() => {
                                  const newExercises =
                                    newDayData.exercises.filter(
                                      (_, i) => i !== index
                                    );
                                  setNewDayData({
                                    ...newDayData,
                                    exercises: newExercises,
                                  });
                                }}
                              >
                                ✕
                              </Button>
                            )}
                          </Flex>
                        </Stack>
                      ))}
                      <Button
                        size="sm"
                        bg="accent.primary"
                        color="white"
                        _hover={{ bg: "accent.secondary" }}
                        onClick={() => {
                          setNewDayData({
                            ...newDayData,
                            exercises: [
                              ...newDayData.exercises,
                              { name: "", repetitions: 10, weight: 0 },
                            ],
                          });
                        }}
                      >
                        ➕ Übung hinzufügen
                      </Button>
                    </Stack>
                  </Box>
                </Stack>

                <Flex gap={3} justify="end">
                  <Button
                    onClick={() => {
                      setShowEditDayDialog(false);
                      setEditingDay(null);
                    }}
                    bg="gray.500"
                    color="white"
                    _hover={{ bg: "gray.600" }}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={updateDay}
                    bg="accent.primary"
                    color="white"
                    _hover={{ bg: "accent.secondary" }}
                  >
                    Speichern
                  </Button>
                </Flex>
              </Stack>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Trainingsplan;
