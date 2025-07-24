import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Stack,
  Grid,
} from "@chakra-ui/react";

const Home = () => {
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

  // ...existing code...

  return (
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
  );
};

export default Home;
