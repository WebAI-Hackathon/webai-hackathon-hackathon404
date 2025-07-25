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
import { FaClipboardList, FaDumbbell, FaChartLine } from "react-icons/fa";
import { Tool } from "../components/Tool";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FaClipboardList,
      title: "Personalized Training Plans",
      description: "Individual plans tailored to your goals and fitness level",
    },
    {
      icon: FaDumbbell,
      title: "Live Workouts",
      description: "Train in real-time with our interactive workout guidance",
    },
    {
      icon: FaChartLine,
      title: "Detailed Statistics",
      description: "Follow your progress and see your improvements",
    },
  ];

  // VOIX Quick Start Tools
  const handleStartTrainingPlan = async (event: Event) => {
    navigate("/trainingsplan");
    (event.target as any).dispatchEvent(
      new CustomEvent("return", {
        detail: {
          message: "Training plan generation started",
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
          message: "Live workout started successfully",
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
          message: "Statistics opened successfully",
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
        description="Start a new training plan or open an existing one"
        onCall={handleStartTrainingPlan}
        return
      />

      <Tool
        name="start_live_workout"
        description="Start a live workout session"
        onCall={handleStartLiveWorkout}
        return
      />

      <Tool
        name="view_statistics"
        description="Open the training statistics and progress display"
        onCall={handleViewStatistics}
        return
      />

      {/* Context für AI */}
      {/* Context für AI */}
      <div data-context="fitness_app_home" style={{ display: "none" }}>
        Welcome to Planetic Gym! Available actions: Start training plan, Begin
        live workout, View statistics. The app offers personalized training
        plans, interactive live workouts, and detailed progress tracking.
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
                Welcome to{" "}
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
                Your personal fitness platform for optimal training results
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
                  <RouterLink to="/trainingsplan">Start Training</RouterLink>
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
                  Why Planetic Gym?
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
                      <Box
                        fontSize="4xl"
                        color="accent.primary"
                        display="flex"
                        justifyContent="center"
                      >
                        <feature.icon />
                      </Box>
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
