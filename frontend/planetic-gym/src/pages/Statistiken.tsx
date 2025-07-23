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

const Statistiken = () => {
  const [timeRange, setTimeRange] = useState("week");

  const weeklyStats = {
    workouts: 5,
    calories: 1250,
    duration: 180,
    streak: 7,
  };

  const monthlyStats = {
    workouts: 18,
    calories: 4800,
    duration: 720,
    streak: 15,
  };

  const currentStats = timeRange === "week" ? weeklyStats : monthlyStats;

  const workoutHistory = [
    { date: "2024-07-23", type: "Ganzkörper", duration: 45, calories: 320 },
    { date: "2024-07-22", type: "Cardio", duration: 30, calories: 280 },
    { date: "2024-07-21", type: "Kraft", duration: 50, calories: 350 },
    { date: "2024-07-20", type: "HIIT", duration: 25, calories: 300 },
    { date: "2024-07-19", type: "Yoga", duration: 40, calories: 150 },
  ];

  const goals = [
    { name: "Wöchentliche Workouts", current: 5, target: 5, achieved: true },
    {
      name: "Monatliche Kalorien",
      current: 4800,
      target: 5000,
      achieved: false,
    },
    { name: "Workout-Streak", current: 7, target: 10, achieved: false },
  ];

  const achievements = [
    {
      icon: "🔥",
      title: "Feuer & Flamme",
      description: "5 Workouts in einer Woche",
      earned: true,
    },
    {
      icon: "💪",
      title: "Kraft-Krieger",
      description: "10 Kraft-Workouts absolviert",
      earned: true,
    },
    {
      icon: "⚡",
      title: "Streak Master",
      description: "30 Tage in Folge trainiert",
      earned: false,
    },
    {
      icon: "🎯",
      title: "Ziel-Erreicher",
      description: "Alle monatlichen Ziele erreicht",
      earned: false,
    },
  ];

  const insights = [
    {
      title: "📈 Beste Performance",
      description: "Deine besten Workouts finden meist am Morgen statt!",
    },
    {
      title: "🏃‍♂️ Lieblings-Workout",
      description:
        "Du bevorzugst Ganzkörper-Workouts - super für allgemeine Fitness!",
    },
    {
      title: "📊 Fortschritt",
      description:
        "Deine Ausdauer hat sich in den letzten 4 Wochen um 15% verbessert!",
    },
  ];

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
        </Stack>

        {/* Time Range Selector */}
        <Stack direction="row" gap={2} justify="center" mb={8}>
          <Button
            variant={timeRange === "week" ? "solid" : "outline"}
            bg={timeRange === "week" ? "accent.primary" : "transparent"}
            color={timeRange === "week" ? "white" : "text.primary"}
            borderColor="accent.primary"
            _hover={{
              bg: timeRange === "week" ? "accent.secondary" : "accent.primary",
              color: "white",
            }}
            onClick={() => setTimeRange("week")}
          >
            Diese Woche
          </Button>
          <Button
            variant={timeRange === "month" ? "solid" : "outline"}
            bg={timeRange === "month" ? "accent.primary" : "transparent"}
            color={timeRange === "month" ? "white" : "text.primary"}
            borderColor="accent.primary"
            _hover={{
              bg: timeRange === "month" ? "accent.secondary" : "accent.primary",
              color: "white",
            }}
            onClick={() => setTimeRange("month")}
          >
            Dieser Monat
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

          <Box
            p={6}
            bg="bg.secondary"
            borderColor="border"
            borderWidth="1px"
            rounded="lg"
            textAlign="center"
          >
            <Text fontSize="3xl" mb={2}>
              ⏱️
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="accent.primary">
              {Math.floor(currentStats.duration / 60)}h{" "}
              {currentStats.duration % 60}m
            </Text>
            <Text color="text.secondary" fontSize="sm">
              Trainingszeit
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
              ⚡
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="accent.primary">
              {currentStats.streak}
            </Text>
            <Text color="text.secondary" fontSize="sm">
              Tage Streak
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
            <Stack gap={4}>
              {goals.map((goal, index) => (
                <Box key={index}>
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
                      {goal.name}
                    </Text>
                    <Text color="text.secondary" fontSize="sm">
                      {goal.current.toLocaleString()} /{" "}
                      {goal.target.toLocaleString()}
                    </Text>
                    <Text fontSize="lg">{goal.achieved ? "✅" : "🎯"}</Text>
                  </Stack>
                  <Progress.Root
                    value={(goal.current / goal.target) * 100}
                    size="sm"
                    colorPalette={goal.achieved ? "green" : "orange"}
                  >
                    <Progress.Track bg="bg.tertiary">
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))}
            </Stack>
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
            <Stack gap={3}>
              {workoutHistory.map((workout, index) => (
                <Box
                  key={index}
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

        {/* Achievements Section */}
        <Box mb={12}>
          <Heading size="lg" color="text.primary" mb={6} textAlign="center">
            🏆 Errungenschaften
          </Heading>
          <Grid
            templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
            gap={6}
          >
            {achievements.map((achievement, index) => (
              <Box
                key={index}
                p={6}
                bg={achievement.earned ? "bg.secondary" : "bg"}
                borderColor={achievement.earned ? "accent.primary" : "border"}
                borderWidth="1px"
                rounded="lg"
                textAlign="center"
                opacity={achievement.earned ? 1 : 0.6}
              >
                <Text fontSize="3xl" mb={3}>
                  {achievement.icon}
                </Text>
                <Heading size="sm" color="text.primary" mb={2}>
                  {achievement.title}
                </Heading>
                <Text color="text.secondary" fontSize="sm">
                  {achievement.description}
                </Text>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* Insights Section */}
        <Box>
          <Heading size="lg" color="text.primary" mb={6} textAlign="center">
            🧠 Insights
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
            {insights.map((insight, index) => (
              <Box
                key={index}
                p={6}
                bg="bg.secondary"
                borderColor="border"
                borderWidth="1px"
                rounded="lg"
              >
                <Heading size="sm" color="text.primary" mb={3}>
                  {insight.title}
                </Heading>
                <Text color="text.secondary" fontSize="sm" lineHeight="1.6">
                  {insight.description}
                </Text>
              </Box>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Statistiken;
