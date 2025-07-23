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
  IconButton,
  Dialog,
  Field,
} from "@chakra-ui/react";

interface TrainingDay {
  id: string;
  name: string;
  focus: string;
  exercises: string[];
  duration: number;
}

interface TrainingWeek {
  id: string;
  name: string;
  description: string;
  level: "Einsteiger" | "Fortgeschritten" | "Experte";
  days: TrainingDay[];
}

const Trainingsplan = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showNewWeekDialog, setShowNewWeekDialog] = useState(false);
  const [showNewDayDialog, setShowNewDayDialog] = useState(false);
  const [currentWeekId, setCurrentWeekId] = useState<string>("");
  const [newWeekData, setNewWeekData] = useState({
    name: "",
    description: "",
    level: "Einsteiger" as "Einsteiger" | "Fortgeschritten" | "Experte",
  });
  const [newDayData, setNewDayData] = useState({
    name: "",
    focus: "",
    exercises: [""],
    duration: 30,
  });
  const [editingExercise, setEditingExercise] = useState<{
    dayId: string;
    exerciseIndex: number;
  } | null>(null);

  const [trainingWeeks, setTrainingWeeks] = useState<TrainingWeek[]>([
    {
      id: "week1",
      name: "Einsteiger Woche",
      description: "Perfekt für den Einstieg ins Krafttraining",
      level: "Einsteiger",
      days: [
        {
          id: "day1",
          name: "Tag 1",
          focus: "Oberkörper",
          exercises: [
            "Liegestütze",
            "Klimmzüge",
            "Schulterdrücken",
            "Bizeps Curls",
          ],
          duration: 45,
        },
        {
          id: "day2",
          name: "Tag 2",
          focus: "Unterkörper",
          exercises: ["Kniebeugen", "Lunges", "Wadenheben", "Glute Bridges"],
          duration: 40,
        },
        {
          id: "day3",
          name: "Tag 3",
          focus: "Ganzkörper",
          exercises: [
            "Burpees",
            "Mountain Climbers",
            "Planks",
            "Jumping Jacks",
          ],
          duration: 35,
        },
      ],
    },
    {
      id: "week2",
      name: "Fortgeschrittene Woche",
      description: "Intensiveres Training für mehr Kraft und Ausdauer",
      level: "Fortgeschritten",
      days: [
        {
          id: "day4",
          name: "Tag 1",
          focus: "Kraft Oberkörper",
          exercises: ["Bankdrücken", "Rudern", "Dips", "Pull-ups"],
          duration: 60,
        },
        {
          id: "day5",
          name: "Tag 2",
          focus: "Kraft Unterkörper",
          exercises: [
            "Deadlifts",
            "Bulgarian Split Squats",
            "Hip Thrusts",
            "Calf Raises",
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
      exercises: [""],
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
      exercises: newDayData.exercises.filter((ex) => ex.trim() !== ""),
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
      level: "Einsteiger",
    });
    setShowNewWeekDialog(true);
  };

  const createNewWeek = () => {
    const newWeek: TrainingWeek = {
      id: `week${Date.now()}`,
      name: newWeekData.name || `Woche ${trainingWeeks.length + 1}`,
      description: newWeekData.description || "Neue Trainingswoche",
      level: newWeekData.level,
      days: [],
    };
    setTrainingWeeks([...trainingWeeks, newWeek]);
    setShowNewWeekDialog(false);
  };

  const addExercise = (dayId: string) => {
    setTrainingWeeks((weeks) =>
      weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          day.id === dayId
            ? { ...day, exercises: [...day.exercises, "Neue Übung"] }
            : day
        ),
      }))
    );
  };

  const removeExercise = (dayId: string, exerciseIndex: number) => {
    setTrainingWeeks((weeks) =>
      weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          day.id === dayId
            ? {
                ...day,
                exercises: day.exercises.filter(
                  (_, index) => index !== exerciseIndex
                ),
              }
            : day
        ),
      }))
    );
  };

  const updateExercise = (
    dayId: string,
    exerciseIndex: number,
    newValue: string
  ) => {
    setTrainingWeeks((weeks) =>
      weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          day.id === dayId
            ? {
                ...day,
                exercises: day.exercises.map((ex, index) =>
                  index === exerciseIndex ? newValue : ex
                ),
              }
            : day
        ),
      }))
    );
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Einsteiger":
        return "green";
      case "Fortgeschritten":
        return "yellow";
      case "Experte":
        return "red";
      default:
        return "gray";
    }
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
                    <Flex align="center" gap={3}>
                      <Heading size="lg" color="text.primary">
                        {week.name}
                      </Heading>
                      <Badge
                        colorPalette={getDifficultyColor(week.level)}
                        variant="subtle"
                      >
                        {week.level}
                      </Badge>
                    </Flex>
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
                              <Flex
                                justify="space-between"
                                align="center"
                                mb={2}
                              >
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="text.primary"
                                >
                                  Übungen:
                                </Text>
                                <Button
                                  size="xs"
                                  bg="accent.primary"
                                  color="white"
                                  _hover={{ bg: "accent.secondary" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addExercise(day.id);
                                  }}
                                >
                                  ➕
                                </Button>
                              </Flex>
                              <Stack gap={1}>
                                {day.exercises.map((exercise, index) => (
                                  <Flex key={index} align="center" gap={2}>
                                    {editingExercise?.dayId === day.id &&
                                    editingExercise?.exerciseIndex === index ? (
                                      <Input
                                        size="sm"
                                        value={exercise}
                                        onChange={(e) =>
                                          updateExercise(
                                            day.id,
                                            index,
                                            e.target.value
                                          )
                                        }
                                        onBlur={() => setEditingExercise(null)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            setEditingExercise(null);
                                          }
                                        }}
                                        autoFocus
                                      />
                                    ) : (
                                      <>
                                        <Text
                                          fontSize="sm"
                                          color="text.secondary"
                                          flex="1"
                                          cursor="pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingExercise({
                                              dayId: day.id,
                                              exerciseIndex: index,
                                            });
                                          }}
                                        >
                                          • {exercise}
                                        </Text>
                                        <Button
                                          size="xs"
                                          bg="red.500"
                                          color="white"
                                          _hover={{ bg: "red.600" }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeExercise(day.id, index);
                                          }}
                                        >
                                          ✕
                                        </Button>
                                      </>
                                    )}
                                  </Flex>
                                ))}
                              </Stack>
                            </Box>

                            <Button
                              bg="accent.primary"
                              color="white"
                              _hover={{ bg: "accent.secondary" }}
                              size="sm"
                              mt={2}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = "/live-workout";
                              }}
                            >
                              🏃‍♂️ Training starten
                            </Button>
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

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Schwierigkeitslevel:
                    </Text>
                    <select
                      value={newWeekData.level}
                      onChange={(e) =>
                        setNewWeekData({
                          ...newWeekData,
                          level: e.target.value as any,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <option value="Einsteiger">Einsteiger</option>
                      <option value="Fortgeschritten">Fortgeschritten</option>
                      <option value="Experte">Experte</option>
                    </select>
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
                        <Flex key={index} gap={2} align="center">
                          <Input
                            value={exercise}
                            onChange={(e) => {
                              const newExercises = [...newDayData.exercises];
                              newExercises[index] = e.target.value;
                              setNewDayData({
                                ...newDayData,
                                exercises: newExercises,
                              });
                            }}
                            placeholder="Übung eingeben..."
                          />
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
                      ))}
                      <Button
                        size="sm"
                        bg="accent.primary"
                        color="white"
                        _hover={{ bg: "accent.secondary" }}
                        onClick={() => {
                          setNewDayData({
                            ...newDayData,
                            exercises: [...newDayData.exercises, ""],
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
      </Container>
    </Box>
  );
};

export default Trainingsplan;
