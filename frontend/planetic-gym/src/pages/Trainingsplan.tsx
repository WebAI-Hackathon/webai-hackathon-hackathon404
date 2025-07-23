import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Grid,
  Stack,
  Badge,
  List,
  ListItem,
} from "@chakra-ui/react";

const Trainingsplan = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const trainingsPläne = [
    {
      id: "beginner",
      name: "Einsteiger-Plan",
      duration: "4 Wochen",
      difficulty: "Leicht",
      exercises: ["Kniebeugen", "Liegestütze", "Planks", "Lunges"],
      description: "Perfekt für Fitness-Anfänger",
      color: "green",
    },
    {
      id: "intermediate",
      name: "Fortgeschrittenen-Plan",
      duration: "6 Wochen",
      difficulty: "Mittel",
      exercises: ["Burpees", "Mountain Climbers", "Deadlifts", "Pull-ups"],
      description: "Für alle mit Grundkenntnissen",
      color: "yellow",
    },
    {
      id: "expert",
      name: "Experten-Plan",
      duration: "8 Wochen",
      difficulty: "Schwer",
      exercises: [
        "Olympic Lifts",
        "Muscle-ups",
        "Pistol Squats",
        "Handstand Push-ups",
      ],
      description: "Maximale Herausforderung",
      color: "red",
    },
  ];

  const tips = [
    {
      icon: "🔥",
      title: "Aufwärmen",
      description: "Beginne jedes Training mit 5-10 Minuten Aufwärmübungen",
    },
    {
      icon: "💧",
      title: "Hydration",
      description:
        "Trinke vor, während und nach dem Training ausreichend Wasser",
    },
    {
      icon: "😴",
      title: "Erholung",
      description: "Gönne deinem Körper zwischen den Trainingseinheiten Ruhe",
    },
  ];

  return (
    <Box py={8}>
      <Container maxW="7xl">
        {/* Page Header */}
        <Stack gap={4} textAlign="center" mb={12}>
          <Heading size="2xl" color="text.primary">
            📋 Dein Trainingsplan
          </Heading>
          <Text fontSize="lg" color="text.secondary">
            Wähle den perfekten Plan für deine Fitnessziele
          </Text>
        </Stack>

        {/* Training Plans Grid */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={6}
          mb={12}
        >
          {trainingsPläne.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <Box
                key={plan.id}
                p={6}
                bg="bg.secondary"
                borderColor={isSelected ? "accent.primary" : "border"}
                borderWidth="2px"
                rounded="lg"
                cursor="pointer"
                transition="all 0.3s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  borderColor: "accent.primary",
                }}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <Stack gap={4}>
                  {/* Plan Header */}
                  <Stack direction="row" justify="space-between" align="center">
                    <Heading size="md" color="text.primary">
                      {plan.name}
                    </Heading>
                    <Badge
                      colorPalette={plan.color}
                      variant="subtle"
                      px={2}
                      py={1}
                    >
                      {plan.difficulty}
                    </Badge>
                  </Stack>

                  {/* Plan Info */}
                  <Stack gap={2}>
                    <Text color="text.secondary" fontWeight="medium">
                      ⏱️ {plan.duration}
                    </Text>
                    <Text color="text.secondary">{plan.description}</Text>
                  </Stack>

                  {/* Exercises Preview */}
                  <Box>
                    <Text fontWeight="bold" color="text.primary" mb={2}>
                      Übungen:
                    </Text>
                    <List.Root>
                      {plan.exercises.map((exercise, index) => (
                        <ListItem key={index} color="text.secondary">
                          • {exercise}
                        </ListItem>
                      ))}
                    </List.Root>
                  </Box>

                  {/* Select Button */}
                  <Button
                    bg={isSelected ? "accent.primary" : "bg.tertiary"}
                    color={isSelected ? "white" : "text.primary"}
                    _hover={{
                      bg: isSelected ? "accent.secondary" : "accent.primary",
                      color: "white",
                    }}
                    size="md"
                    fontWeight="bold"
                  >
                    {isSelected ? "✓ Ausgewählt" : "Plan wählen"}
                  </Button>
                </Stack>
              </Box>
            );
          })}
        </Grid>

        {/* Action Section */}
        {selectedPlan && (
          <Box
            p={8}
            bg="bg.secondary"
            rounded="lg"
            borderColor="accent.primary"
            borderWidth="1px"
            textAlign="center"
            mb={12}
          >
            <Stack gap={6}>
              <Heading size="lg" color="text.primary">
                Bereit zu starten?
              </Heading>
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
                >
                  <RouterLink to="/live-workout">🏃‍♂️ Workout starten</RouterLink>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="accent.primary"
                  color="accent.primary"
                  _hover={{ bg: "accent.primary", color: "white" }}
                  px={8}
                >
                  ⚙️ Plan anpassen
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Tips Section */}
        <Box>
          <Heading size="lg" color="text.primary" mb={6} textAlign="center">
            💡 Trainingstipps
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
            {tips.map((tip, index) => (
              <Box
                key={index}
                p={6}
                bg="bg.secondary"
                borderColor="border"
                borderWidth="1px"
                rounded="lg"
                textAlign="center"
              >
                <Stack gap={3}>
                  <Text fontSize="2xl">{tip.icon}</Text>
                  <Heading size="sm" color="text.primary">
                    {tip.title}
                  </Heading>
                  <Text color="text.secondary" fontSize="sm">
                    {tip.description}
                  </Text>
                </Stack>
              </Box>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Trainingsplan;
