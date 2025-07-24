import { useState } from "react";
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
} from "@chakra-ui/react";

interface Exercise {
  name: string;
  repetitions: number;
  weight: number;
}

interface TrainingDay {
  id: string;
  name: string;
  focus: string;
  exercises: Exercise[];
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
  const [newWeekData, setNewWeekData] = useState({
    name: "",
    description: "",
  });
  const [newDayData, setNewDayData] = useState({
    name: "",
    focus: "",
    exercises: [{ name: "", repetitions: 10, weight: 0 }],
    duration: 30,
  });

  const [trainingWeeks, setTrainingWeeks] = useState<TrainingWeek[]>([
    {
      id: "week1",
      name: "Einsteiger Woche",
      description: "Perfekt für den Einstieg ins Krafttraining",
      days: [
        {
          id: "day1",
          name: "Tag 1",
          focus: "Oberkörper",
          exercises: [
            { name: "Liegestütze", repetitions: 10, weight: 0 },
            { name: "Klimmzüge", repetitions: 5, weight: 0 },
            { name: "Schulterdrücken", repetitions: 12, weight: 5 },
            { name: "Bizeps Curls", repetitions: 15, weight: 3 },
          ],
          duration: 45,
        },
        {
          id: "day2",
          name: "Tag 2",
          focus: "Unterkörper",
          exercises: [
            { name: "Kniebeugen", repetitions: 15, weight: 0 },
            { name: "Lunges", repetitions: 12, weight: 0 },
            { name: "Wadenheben", repetitions: 20, weight: 0 },
            { name: "Glute Bridges", repetitions: 15, weight: 0 },
          ],
          duration: 40,
        },
        {
          id: "day3",
          name: "Tag 3",
          focus: "Ganzkörper",
          exercises: [
            { name: "Burpees", repetitions: 10, weight: 0 },
            { name: "Mountain Climbers", repetitions: 30, weight: 0 },
            { name: "Planks", repetitions: 3, weight: 0 },
            { name: "Jumping Jacks", repetitions: 20, weight: 0 },
          ],
          duration: 35,
        },
      ],
    },
    {
      id: "week2",
      name: "Fortgeschrittene Woche",
      description: "Intensiveres Training für mehr Kraft und Ausdauer",
      days: [
        {
          id: "day4",
          name: "Tag 1",
          focus: "Kraft Oberkörper",
          exercises: [
            { name: "Bankdrücken", repetitions: 8, weight: 20 },
            { name: "Rudern", repetitions: 10, weight: 15 },
            { name: "Dips", repetitions: 12, weight: 0 },
            { name: "Pull-ups", repetitions: 6, weight: 0 },
          ],
          duration: 60,
        },
        {
          id: "day5",
          name: "Tag 2",
          focus: "Kraft Unterkörper",
          exercises: [
            { name: "Deadlifts", repetitions: 6, weight: 40 },
            { name: "Bulgarian Split Squats", repetitions: 10, weight: 10 },
            { name: "Hip Thrusts", repetitions: 12, weight: 20 },
            { name: "Calf Raises", repetitions: 20, weight: 15 },
          ],
          duration: 55,
        },
      ],
    },
  ]);

  const addNewDay = (weekId: string) => {
    setCurrentWeekId(weekId);
    setNewDayData({
      name: "",
      focus: "",
      exercises: [{ name: "", repetitions: 10, weight: 0 }],
      duration: 30,
    });
    setShowNewDayDialog(true);
  };

  const createNewDay = () => {
    const newDay: TrainingDay = {
      id: `day${Date.now()}`,
      name:
        newDayData.name ||
        `Tag ${
          trainingWeeks.find((w) => w.id === currentWeekId)?.days.length! + 1
        }`,
      focus: newDayData.focus || "Ganzkörper",
      exercises: newDayData.exercises.filter((ex) => ex.name.trim() !== ""),
      duration: newDayData.duration,
    };

    setTrainingWeeks((weeks) =>
      weeks.map((week) =>
        week.id === currentWeekId
          ? { ...week, days: [...week.days, newDay] }
          : week
      )
    );
    setShowNewDayDialog(false);
  };

  const addNewWeek = () => {
    setNewWeekData({
      name: "",
      description: "",
    });
    setShowNewWeekDialog(true);
  };

  const createNewWeek = () => {
    const newWeek: TrainingWeek = {
      id: `week${Date.now()}`,
      name: newWeekData.name || `Woche ${trainingWeeks.length + 1}`,
      description: newWeekData.description || "Neue Trainingswoche",
      days: [],
    };
    setTrainingWeeks([...trainingWeeks, newWeek]);
    setShowNewWeekDialog(false);
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

  const updateDay = () => {
    if (!editingDay) return;

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

  return (
    <Box py={8}>
      <Container maxW="6xl">
        <Stack gap={4} textAlign="center" mb={12}>
          <Heading size="2xl" color="text.primary">
            📋 Deine Trainingspläne
          </Heading>
          <Text fontSize="lg" color="text.secondary">
            Verwalte deine Trainingswochen und -tage
          </Text>
        </Stack>

        <Flex justify="center" mb={8}>
          <Button
            onClick={addNewWeek}
            bg="accent.primary"
            color="white"
            _hover={{ bg: "accent.secondary" }}
            size="lg"
            px={8}
          >
            ➕ Neue Trainingswoche hinzufügen
          </Button>
        </Flex>

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
                          setSelectedDay(selectedDay === day.id ? null : day.id)
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
        </Stack>

        <Box mt={12} p={6} bg="bg.secondary" borderRadius="lg">
          <Heading size="md" color="text.primary" mb={4} textAlign="center">
            💡 Trainingstipps
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Box textAlign="center" p={4} bg="bg.tertiary" borderRadius="md">
              <Text fontSize="2xl" mb={2}>
                🔥
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={1}>
                Aufwärmen
              </Text>
              <Text fontSize="xs" color="text.secondary">
                Beginne jedes Training mit 5-10 Minuten Aufwärmübungen
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg="bg.tertiary" borderRadius="md">
              <Text fontSize="2xl" mb={2}>
                💧
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={1}>
                Hydration
              </Text>
              <Text fontSize="xs" color="text.secondary">
                Trinke vor, während und nach dem Training ausreichend Wasser
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg="bg.tertiary" borderRadius="md">
              <Text fontSize="2xl" mb={2}>
                😴
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={1}>
                Erholung
              </Text>
              <Text fontSize="xs" color="text.secondary">
                Gönne deinem Körper zwischen den Trainingseinheiten Ruhe
              </Text>
            </Box>
          </Grid>
        </Box>

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
