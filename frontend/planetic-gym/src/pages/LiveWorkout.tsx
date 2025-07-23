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
} from "@chakra-ui/react";

const LiveWorkout = () => {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timer, setTimer] = useState(0);
  const [sets, setSets] = useState(0);

  const exercises = [
    { name: "Jumping Jacks", duration: 30, rest: 10 },
    { name: "Push-ups", duration: 45, rest: 15 },
    { name: "Squats", duration: 40, rest: 10 },
    { name: "Plank", duration: 60, rest: 20 },
    { name: "Burpees", duration: 30, rest: 15 },
  ];

  useEffect(() => {
    let interval: number;
    if (isWorkoutActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (isWorkoutActive && timer === 0) {
      // Move to next exercise or finish workout
      if (currentExercise < exercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
        setTimer(exercises[currentExercise + 1].duration);
      } else {
        setIsWorkoutActive(false);
        setSets(sets + 1);
        setCurrentExercise(0);
      }
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, timer, currentExercise, exercises, sets]);

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setTimer(exercises[0].duration);
    setCurrentExercise(0);
  };

  const pauseWorkout = () => {
    setIsWorkoutActive(false);
  };

  const stopWorkout = () => {
    setIsWorkoutActive(false);
    setTimer(0);
    setCurrentExercise(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progressPercentage = (currentExercise / exercises.length) * 100;

  return (
    <Box py={8}>
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
                  <Badge colorPalette="orange" variant="subtle" px={3} py={1}>
                    {currentExercise + 1} / {exercises.length}
                  </Badge>
                </Stack>

                {/* Timer Display */}
                <Box>
                  <Text
                    fontSize="6xl"
                    fontWeight="bold"
                    color={
                      timer <= 10 && isWorkoutActive
                        ? "red.400"
                        : "accent.primary"
                    }
                    fontFamily="mono"
                  >
                    {formatTime(timer)}
                  </Text>
                  <Text color="text.secondary" fontSize="lg">
                    {isWorkoutActive ? "Verbleibende Zeit" : "Bereit zum Start"}
                  </Text>
                </Box>

                {/* Workout Controls */}
                <Stack direction="row" gap={4} justify="center">
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
                        bg="yellow.500"
                        color="white"
                        _hover={{ bg: "yellow.600" }}
                        px={6}
                        onClick={pauseWorkout}
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
                  Workout Fortschritt
                </Heading>
                <Progress.Root
                  value={progressPercentage}
                  size="lg"
                  colorPalette="orange"
                >
                  <Progress.Track bg="bg.tertiary">
                    <Progress.Range bg="accent.primary" />
                  </Progress.Track>
                </Progress.Root>
                <Text color="text.secondary" textAlign="center">
                  Absolvierte Sets: {sets}
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
                  const isCompleted = index < currentExercise;

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
                            {exercise.duration}s
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

            {/* Workout Stats */}
            <Box
              p={6}
              bg="bg.secondary"
              borderColor="border"
              borderWidth="1px"
              rounded="lg"
            >
              <Heading size="md" color="text.primary" mb={4}>
                Statistiken
              </Heading>
              <Grid templateColumns="1fr" gap={4}>
                <Box textAlign="center" p={4} bg="bg.tertiary" rounded="md">
                  <Text fontSize="2xl">💪</Text>
                  <Text fontSize="sm" color="text.secondary">
                    Energie Level
                  </Text>
                </Box>
                <Box textAlign="center" p={4} bg="bg.tertiary" rounded="md">
                  <Text fontSize="2xl">🔥</Text>
                  <Text fontSize="sm" color="text.secondary">
                    Kalorien
                  </Text>
                </Box>
                <Box textAlign="center" p={4} bg="bg.tertiary" rounded="md">
                  <Text fontSize="2xl">⏱️</Text>
                  <Text fontSize="sm" color="text.secondary">
                    Zeit aktiv
                  </Text>
                </Box>
              </Grid>
            </Box>
          </Stack>
        </Grid>
      </Container>
    </Box>
  );
};

export default LiveWorkout;
