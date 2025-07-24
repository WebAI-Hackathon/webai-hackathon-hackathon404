import { useState } from "react";
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
} from "@chakra-ui/react";
import { apiService } from "../services/api";
import type { OverallStatistics } from "../services/api";

const Statistiken = () => {
  const [statistics, setStatistics] = useState<OverallStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load statistics from backend
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stats = await apiService.getOverallStatistics();
      setStatistics(stats);

      console.log("Loaded statistics:", stats);
    } catch (err) {
      console.error("Error loading statistics:", err);
      setError(
        err instanceof Error ? err.message : "Fehler beim Laden der Statistiken"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const workoutHistory = [
    { date: "2024-07-23", type: "Ganzkörper", duration: 45, calories: 320 },
    { date: "2024-07-22", type: "Cardio", duration: 30, calories: 280 },
    { date: "2024-07-21", type: "Kraft", duration: 50, calories: 350 },
    { date: "2024-07-20", type: "HIIT", duration: 25, calories: 300 },
    { date: "2024-07-19", type: "Yoga", duration: 40, calories: 150 },
  ];

  const calculateTrainingTime = (setsCompleted: number): number => {
    // Schätzung: ca. 2-3 Minuten pro Set (inkl. Pause)
    return Math.round(setsCompleted * 2.5);
  };

  if (isLoading) {
    return (
      <Box py={8}>
        <Container maxW="7xl">
          <Stack gap={4} textAlign="center" align="center">
            <Spinner size="xl" color="accent.primary" />
            <Text>Statistiken werden geladen...</Text>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box py={8}>
        <Container maxW="7xl">
          <Box
            p={6}
            bg="red.50"
            borderColor="red.200"
            borderWidth="1px"
            rounded="lg"
            textAlign="center"
          >
            <Text color="red.600" fontWeight="bold" mb={2}>
              ❌ Fehler beim Laden der Statistiken
            </Text>
            <Text color="red.500" mb={4}>
              {error}
            </Text>
            <Button
              onClick={refreshStatistics}
              colorScheme="red"
              variant="outline"
            >
              Erneut versuchen
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Box py={8}>
        <Container maxW="7xl">
          <Box
            p={6}
            bg="blue.50"
            borderColor="blue.200"
            borderWidth="1px"
            rounded="lg"
            textAlign="center"
          >
            <Text color="blue.600" fontWeight="bold" mb={2}>
              ℹ️ Keine Statistiken verfügbar
            </Text>
            <Text color="blue.500">Führe zuerst einige Workouts durch!</Text>
          </Box>
        </Container>
      </Box>
    );
  }

  const workoutStats = statistics.workout_stats;
  const exerciseFreqs = statistics.exercise_frequencies;
  const exerciseStats = statistics.exercise_stats;

  // Calculate derived statistics
  const totalSetsCompleted = exerciseStats.reduce((total, exercise) => {
    return total + (exercise.total_workouts || 0);
  }, 0);

  const estimatedCalories = calculateCaloriesBurned(totalSetsCompleted);
  const estimatedTrainingTime = calculateTrainingTime(totalSetsCompleted);

  // Current stats based on time range
  const currentStats = {
    totalWorkouts: workoutStats.total_workouts,
    calories: estimatedCalories,
    duration: estimatedTrainingTime,
    exercises: exerciseStats.length,
  };

  return (
    <Box py={8}>
      <Container maxW="7xl">
        {/* Stats Header */}
        <Stack gap={4} textAlign="center" mb={12}>
          <Heading size="2xl" color="text.primary">
            📊 Deine Statistiken
          </Heading>
          <Text fontSize="lg" color="text.secondary">
            Verfolge deinen Fortschritt und erreiche deine Ziele
          </Text>
          <Button
            onClick={refreshStatistics}
            size="sm"
            variant="outline"
            colorScheme="blue"
          >
            🔄 Aktualisieren
          </Button>
        </Stack>

        {/* Stats Overview */}
        <Grid
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
          gap={6}
          mb={12}
        >
          <Box
            p={6}
            bg="bg.secondary"
            borderColor="border"
            borderWidth="1px"
            rounded="lg"
            textAlign="center"
          >
            <Text fontSize="3xl" mb={2}>
              🏃‍♂️
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="accent.primary">
              {currentStats.workouts}
            </Text>
            <Text color="text.secondary" fontSize="sm">
              Workouts
            </Text>
          </Box>

          <Box
            p={6}
            bg="bg.secondary"
            borderColor="border"
            borderWidth="1px"
            rounded="lg"
            textAlign="center"
          >
            <Text fontSize="3xl" mb={2}>
              🔥
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="accent.primary">
              {currentStats.calories.toLocaleString()}
            </Text>
            <Text color="text.secondary" fontSize="sm">
              Kalorien
            </Text>
          </Box>
        </Grid>

        {/* Content Grid */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} mb={12}>
          {/* Goals Section */}
          <Box
            p={6}
            bg="bg.secondary"
            borderColor="border"
            borderWidth="1px"
            rounded="lg"
          >
            <Heading size="md" color="text.primary" mb={6}>
              🎯 Deine Ziele
            </Heading>
            {exerciseFreqs.length > 0 ? (
              <Stack gap={3}>
                {exerciseFreqs.slice(0, 5).map((exercise) => (
                  <Box key={exercise.exercise_id}>
                    <Stack
                      direction="row"
                      justify="space-between"
                      align="center"
                      mb={2}
                    >
                      <Text
                        color="text.primary"
                        fontWeight="medium"
                        fontSize="sm"
                      >
                        {exercise.exercise_title}
                      </Text>
                      <Text color="text.secondary" fontSize="sm">
                        {exercise.frequency}x
                      </Text>
                    </Stack>
                    <Progress.Root
                      value={
                        (exercise.frequency /
                          (exerciseFreqs[0]?.frequency || 1)) *
                        100
                      }
                      size="sm"
                      colorPalette="green"
                    >
                      <Progress.Track bg="bg.tertiary">
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text color="text.secondary">
                Noch keine Übungsdaten verfügbar
              </Text>
            )}
          </Box>

          {/* Workout History */}
          <Box
            p={6}
            bg="bg.secondary"
            borderColor="border"
            borderWidth="1px"
            rounded="lg"
          >
            <Heading size="md" color="text.primary" mb={6}>
              📝 Workout Verlauf
            </Heading>
            {exerciseStats.length > 0 ? (
              <Stack gap={3}>
                {/* Header */}
                <Grid
                  templateColumns="2fr 1fr 1.5fr"
                  gap={4}
                  p={3}
                  bg="bg.tertiary"
                  rounded="md"
                >
                  <Text color="text.secondary" fontSize="sm" fontWeight="bold">
                    Übung
                  </Text>
                  <Text color="text.secondary" fontSize="sm" fontWeight="bold">
                    Workouts
                  </Text>
                  <Text color="text.secondary" fontSize="sm" fontWeight="bold">
                    Letztes Training
                  </Text>
                </Grid>

                {/* Data rows */}
                {exerciseStats.slice(0, 5).map((exercise) => (
                  <Grid
                    key={exercise.exercise_id}
                    templateColumns="2fr 1fr 1.5fr"
                    gap={4}
                    p={3}
                    borderBottom="1px solid"
                    borderColor="border"
                  >
                    <Text color="text.primary" fontSize="sm">
                      {exercise.exercise_title}
                    </Text>
                    <Text color="text.primary" fontSize="sm">
                      {exercise.total_workouts}
                    </Text>
                    <Text color="text.secondary" fontSize="xs">
                      {exercise.last_workout_date
                        ? formatDate(exercise.last_workout_date)
                        : "Nie"}
                    </Text>
                  </Grid>
                ))}
              </Stack>
            ) : (
              <Text color="text.secondary">
                Noch keine Übungsstatistiken verfügbar
              </Text>
            )}
          </Box>
        </Grid>

        {/* Last Workouts */}
        {workoutStats.last_three_workouts.length > 0 && (
          <Box
            p={6}
            bg="bg.secondary"
            borderColor="border"
            borderWidth="1px"
            rounded="lg"
            mb={8}
          >
            <Heading size="md" color="text.primary" mb={6}>
              📝 Letzte Trainingstage
            </Heading>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={4}
            >
              {workoutStats.last_three_workouts.map((workout) => (
                <Box
                  key={workout.id}
                  p={4}
                  bg="bg.tertiary"
                  rounded="md"
                  borderColor="border"
                  borderWidth="1px"
                >
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack gap={1}>
                      <Text color="text.secondary" fontSize="xs">
                        {new Date(workout.date).toLocaleDateString("de-DE", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </Text>
                      <Text
                        color="text.primary"
                        fontWeight="medium"
                        fontSize="sm"
                      >
                        {workout.type}
                      </Text>
                    </Stack>
                    <Stack gap={1} textAlign="right">
                      <Text color="text.secondary" fontSize="xs">
                        ⏱️ {workout.duration}min
                      </Text>
                      <Text color="text.secondary" fontSize="xs">
                        🔥 {workout.calories} kcal
                      </Text>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* Progress Insights
        <Box
          p={6}
          bg="bg.secondary"
          borderColor="border"
          borderWidth="1px"
          rounded="lg"
        >
          <Heading size="md" color="text.primary" mb={6}>
            🧠 Trainings-Insights
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <Box>
              <Text color="accent.primary" fontWeight="bold" mb={2}>
                📊 Gesamtfortschritt
              </Text>
              <Text color="text.secondary" fontSize="sm" lineHeight="1.6">
                Du hast bereits {currentStats.totalWorkouts} Trainingstage
                absolviert und dabei {totalSetsCompleted} Sets trainiert.
              </Text>
            </Box>

            <Box>
              <Text color="accent.primary" fontWeight="bold" mb={2}>
                🎯 Nächste Ziele
              </Text>
              <Text color="text.secondary" fontSize="sm" lineHeight="1.6">
                {currentStats.totalWorkouts < 10
                  ? "Erreiche 10 Trainingstage für deinen ersten Meilenstein!"
                  : currentStats.totalWorkouts < 25
                  ? "Du bist auf dem Weg zu 25 Trainingstagen - bleib dran!"
                  : "Großartig! Du bist ein echter Fitness-Profi!"}
              </Text>
            </Box>
          </Grid>
        </Box> */}
      </Container>
    </Box>
  );
};

export default Statistiken;
