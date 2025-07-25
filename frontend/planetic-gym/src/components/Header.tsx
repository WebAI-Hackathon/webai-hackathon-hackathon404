import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Flex, Heading, Button, Stack } from "@chakra-ui/react";
import { Tool } from "./Tool";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/trainingsplan", label: "📋 Trainingsplan" },
    { path: "/live-workout", label: "🏃‍♂️ Live Workout" },
    { path: "/statistiken", label: "📊 Statistiken" },
  ];

  // VOIX Navigation Tools
  const handleNavigateToTrainingPlan = async (event: Event) => {
    navigate("/trainingsplan");
    (event.target as any).dispatchEvent(
      new CustomEvent("return", {
        detail: {
          message: "Navigation zu Trainingsplan erfolgreich",
          page: "trainingsplan",
        },
      })
    );
  };

  const handleNavigateToLiveWorkout = async (event: Event) => {
    navigate("/live-workout");
    (event.target as any).dispatchEvent(
      new CustomEvent("return", {
        detail: {
          message: "Navigation zu Live Workout erfolgreich",
          page: "live-workout",
        },
      })
    );
  };

  const handleNavigateToStatistics = async (event: Event) => {
    navigate("/statistiken");
    (event.target as any).dispatchEvent(
      new CustomEvent("return", {
        detail: {
          message: "Navigation zu Statistiken erfolgreich",
          page: "statistiken",
        },
      })
    );
  };

  const handleNavigateToHome = async (event: Event) => {
    navigate("/");
    (event.target as any).dispatchEvent(
      new CustomEvent("return", {
        detail: {
          message: "Navigation zur Startseite erfolgreich",
          page: "home",
        },
      })
    );
  };

  return (
    <>
      {/* VOIX Navigation Tools */}
      <Tool
        name="navigate_to_training_plan"
        description="Navigiere zur Trainingsplan-Seite"
        onCall={handleNavigateToTrainingPlan}
        return
      />

      <Tool
        name="navigate_to_live_workout"
        description="Navigiere zur Live Workout-Seite"
        onCall={handleNavigateToLiveWorkout}
        return
      />

      <Tool
        name="navigate_to_statistics"
        description="Navigiere zur Statistiken-Seite"
        onCall={handleNavigateToStatistics}
        return
      />

      <Tool
        name="navigate_to_home"
        description="Navigiere zur Startseite"
        onCall={handleNavigateToHome}
        return
      />

      {/* Context für AI */}
      <div data-context="navigation">
        Aktuelle Seite: {location.pathname}. Verfügbare Navigationsziele:
        Startseite (/), Trainingsplan (/trainingsplan), Live Workout
        (/live-workout), Statistiken (/statistiken).
      </div>

      <Box
        as="header"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        bg="bg.secondary"
        borderBottom="1px solid"
        borderColor="border"
        backdropFilter="blur(10px)"
      >
        <Container maxW="7xl" py={4}>
          <Flex align="center">
            {/* Logo further left */}
            <Box mr={12}>
              <RouterLink to="/" style={{ textDecoration: "none" }}>
                <Heading size="lg" color="accent.primary" fontWeight="bold">
                  💪 Planetic Gym
                </Heading>
              </RouterLink>
            </Box>

            {/* Spacer pushes nav to right */}
            <Box flex={1} />

            <Stack direction="row" gap={6} pr={2}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <RouterLink
                    key={item.path}
                    to={item.path}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant={isActive ? "solid" : "ghost"}
                      bg={isActive ? "accent.primary" : "transparent"}
                      color={isActive ? "white" : "text.primary"}
                      _hover={{
                        bg: isActive ? "accent.secondary" : "bg.tertiary",
                        color: isActive ? "white" : "accent.primary",
                      }}
                      size="md"
                      fontWeight={isActive ? "bold" : "medium"}
                    >
                      {item.label}
                    </Button>
                  </RouterLink>
                );
              })}
            </Stack>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default Header;
