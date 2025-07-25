import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Stack,
  Grid,
} from "@chakra-ui/react";
import { Tool } from "../components/Tool";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "📋",
      title: "Personalisierte Trainingspläne",
      description:
        "Individuelle Pläne, die sich an deine Ziele und dein Fitnesslevel anpassen",
    },
    {
      icon: "🏃‍♂️",
      title: "Live Workouts",
      description:
        "Trainiere in Echtzeit mit unserer interaktiven Workout-Führung",
    },
    {
      icon: "📊",
      title: "Detaillierte Statistiken",
      description:
        "Verfolge deinen Fortschritt und erkenne deine Verbesserungen",
    },
  ];

  // VOIX Quick Start Tools
  const handleStartTrainingPlan = async (event: Event) => {
    navigate("/trainingsplan");
    (event.target as any).dispatchEvent(
      new CustomEvent("return", {
        detail: {
          message: "Trainingsplan erfolgreich gestartet",
          action: "start_training_plan",
        },
      })
    );
  };

  const handleStartLiveWorkout = async (event: Event) => {
    navigate("/live-workout");
    (event.target as any).dispatchEvent(
      new CustomEvent("return", {
        detail: {
          message: "Live Workout erfolgreich gestartet",
          action: "start_live_workout",
        },
      })
    );
  };

  const handleViewStatistics = async (event: Event) => {
    navigate("/statistiken");
    (event.target as any).dispatchEvent(
      new CustomEvent("return", {
        detail: {
          message: "Statistiken erfolgreich geöffnet",
          action: "view_statistics",
        },
      })
    );
  };

  // ...existing code...

  return (
    <>
      {/* VOIX Quick Start Tools */}
      <Tool
        name="start_training_plan"
        description="Starte einen neuen Trainingsplan oder öffne bestehenden Plan"
        onCall={handleStartTrainingPlan}
        return
      />

      <Tool
        name="start_live_workout"
        description="Starte ein Live Workout-Training"
        onCall={handleStartLiveWorkout}
        return
      />

      <Tool
        name="view_statistics"
        description="Öffne die Trainingsstatistiken und Fortschrittsanzeige"
        onCall={handleViewStatistics}
        return
      />

      {/* Context für AI */}
      <div data-context="fitness_app_home">
        Willkommen bei Planetic Gym! Verfügbare Aktionen: Trainingsplan starten,
        Live Workout beginnen, Statistiken anzeigen. Die App bietet
        personalisierte Trainingspläne, interaktive Live Workouts und
        detaillierte Fortschrittsverfolgung.
      </div>

      <Box>
        {/* Hero Section */}
        <Box
          py={{ base: 20, md: 32 }}
          bgGradient="linear(to-br, bg.secondary, bg.tertiary)"
          position="relative"
          overflow="hidden"
        >
          <Container maxW="7xl">
            <Stack gap={8} textAlign="center" maxW="4xl" mx="auto">
              <Heading
                as="h1"
                size="3xl"
                fontWeight="bold"
                color="text.primary"
                lineHeight="1.2"
              >
                Willkommen bei{" "}
                <Text as="span" color="accent.primary">
                  Planetic Gym
                </Text>
              </Heading>

              <Text
                fontSize="xl"
                color="text.secondary"
                maxW="2xl"
                lineHeight="1.6"
                mx="auto"
              >
                Deine persönliche Fitness-Plattform für optimale
                Trainingsergebnisse
              </Text>

              <Stack
                direction={{ base: "column", sm: "row" }}
                gap={4}
                justify="center"
              >
                <Button
                  asChild
                  size="lg"
                  bg="accent.primary"
                  color="white"
                  _hover={{ bg: "accent.secondary" }}
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                >
                  <RouterLink to="/trainingsplan">
                    Trainingsplan starten
                  </RouterLink>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  borderColor="accent.primary"
                  color="accent.primary"
                  _hover={{ bg: "accent.primary", color: "white" }}
                  px={8}
                  py={6}
                  fontSize="lg"
                >
                  <RouterLink to="/live-workout">Live Workout</RouterLink>
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Features Section */}
        <Box py={1} bg="bg">
          <Container maxW="7xl">
            <Stack gap={16}>
              <Stack gap={4} textAlign="center">
                <Heading size="2xl" color="text.primary">
                  Warum Planetic Gym?
                </Heading>
              </Stack>

              <Grid
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={8}
                w="full"
              >
                {features.map((feature, index) => (
                  <Box
                    key={index}
                    p={8}
                    bg="bg.secondary"
                    borderColor="border"
                    borderWidth="1px"
                    rounded="lg"
                    _hover={{
                      transform: "translateY(-4px)",
                      borderColor: "accent.primary",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Stack gap={4} textAlign="center">
                      <Text fontSize="4xl">{feature.icon}</Text>
                      <Heading size="md" color="text.primary">
                        {feature.title}
                      </Heading>
                      <Text color="text.secondary" lineHeight="1.6">
                        {feature.description}
                      </Text>
                    </Stack>
                  </Box>
                ))}
              </Grid>
            </Stack>
          </Container>
        </Box>

        {/* Quick Stats Section entfernt */}
      </Box>
    </>
  );
};

export default Home;
