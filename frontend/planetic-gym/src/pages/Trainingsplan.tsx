import { useState, useEffect } from "react";
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
  Spinner,
  IconButton,
  MenuTrigger,
  MenuRoot,
  MenuContent,
  MenuItem,
} from "@chakra-ui/react";
import {
  FaDumbbell,
  FaPlay,
  FaEdit,
  FaFilePdf,
  FaPlus,
  FaTrash,
  FaCog,
  FaFire,
  FaTint,
  FaBed,
  FaClipboardList,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import { Tool } from "../components/Tool";
import { apiService } from "../services/api";
import type { WorkingPlan } from "../services/api";
import jsPDF from "jspdf";

// Frontend Types (für Kompatibilität mit der bestehenden UI)
interface FrontendExercise {
  id?: number; // Backend Exercise ID für Updates
  name: string;
  repetitions: number;
  weight: number;
}

interface TrainingDay {
  id: string;
  name: string;
  focus: string;
  exercises: FrontendExercise[];
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
  const [showEditWeekDialog, setShowEditWeekDialog] = useState(false);
  const [currentWeekId, setCurrentWeekId] = useState<string>("");
  const [editingDay, setEditingDay] = useState<TrainingDay | null>(null);
  const [editingWeek, setEditingWeek] = useState<TrainingWeek | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWeekData, setNewWeekData] = useState({
    name: "",
    description: "",
  });
  const [newDayData, setNewDayData] = useState({
    name: "",
    focus: "",
    exercises: [{ name: "", repetitions: 10, weight: 0 }] as FrontendExercise[],
  });

  const [trainingWeeks, setTrainingWeeks] = useState<TrainingWeek[]>([]);

  // Hilfsfunktionen für die Datenkonvertierung zwischen Frontend und Backend
  const convertBackendToFrontend = (
    workingPlans: WorkingPlan[]
  ): TrainingWeek[] => {
    return workingPlans.map((plan) => ({
      id: plan.id?.toString() || "",
      name: plan.title,
      description: plan.description || "",
      days: plan.days.map((day) => ({
        id: day.id?.toString() || "",
        name: day.title,
        focus: day.description || "Ganzkörper",
        exercises: day.exercises.map((exercise) => ({
          id: exercise.id, // Backend Exercise ID mitführen
          name: exercise.title,
          repetitions: exercise.first_set_reps || 10,
          weight: exercise.first_set_weight || 0,
        })),
      })),
    }));
  };

  // Daten neu laden
  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading training plans from database...");
      const plans = await apiService.getWorkingPlans();
      console.log("Loaded plans from database:", plans);
      const frontendData = convertBackendToFrontend(plans);
      console.log("Converted to frontend format:", frontendData);
      setTrainingWeeks(frontendData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error while loading training plans"
      );
      console.error("Error loading training plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // PDF Export Funktion
  const exportDayToPDF = (day: TrainingDay, weekName: string) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Planetic Gym", 20, 20);

    doc.setFontSize(16);
    doc.text("Training Plan Export", 20, 35);

    // Trainingswoche und Tag
    doc.setFontSize(14);
    doc.text(`Training Week: ${weekName}`, 20, 50);
    doc.text(`Training Day: ${day.name}`, 20, 60);
    doc.text(`Focus: ${day.focus}`, 20, 70);

    // Datum
    const today = new Date().toLocaleDateString("en-US");
    doc.setFontSize(10);
    doc.text(`Created on: ${today}`, 20, 80);

    // Linie
    doc.line(20, 85, 190, 85);

    // Übungen Überschrift
    doc.setFontSize(14);
    doc.text("Exercises:", 20, 100);

    let yPosition = 115;

    if (day.exercises.length === 0) {
      doc.setFontSize(12);
      doc.text("No exercises defined for this day.", 20, yPosition);
    } else {
      // Tabellen-Header
      doc.setFontSize(10);
      doc.text("No.", 20, yPosition);
      doc.text("Exercise", 35, yPosition);
      doc.text("Repetitions", 120, yPosition);
      doc.text("Weight (kg)", 160, yPosition);

      // Linie unter Header
      doc.line(20, yPosition + 2, 190, yPosition + 2);
      yPosition += 10;

      // Übungen
      day.exercises.forEach((exercise, index) => {
        if (yPosition > 270) {
          // Neue Seite wenn nötig
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(10);
        doc.text(`${index + 1}.`, 20, yPosition);

        // Übungsname (mit Zeilenumbruch wenn zu lang)
        const exerciseName = exercise.name || "Unnamed Exercise";
        if (exerciseName.length > 35) {
          const words = exerciseName.split(" ");
          let line = "";
          let lineY = yPosition;

          words.forEach((word, wordIndex) => {
            const testLine = line + word + " ";
            if (testLine.length > 35 && line !== "") {
              doc.text(line.trim(), 35, lineY);
              line = word + " ";
              lineY += 5;
            } else {
              line = testLine;
            }

            if (wordIndex === words.length - 1) {
              doc.text(line.trim(), 35, lineY);
            }
          });
          yPosition = lineY;
        } else {
          doc.text(exerciseName, 35, yPosition);
        }

        doc.text(`${exercise.repetitions}x`, 120, yPosition);
        doc.text(
          exercise.weight > 0 ? `${exercise.weight}` : "-",
          160,
          yPosition
        );

        yPosition += 15;
      });

      // Statistiken
      yPosition += 10;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.text("Summary:", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.text(`Number of exercises: ${day.exercises.length}`, 20, yPosition);
      yPosition += 8;

      const totalReps = day.exercises.reduce(
        (sum, ex) => sum + ex.repetitions,
        0
      );
      doc.text(`Total repetitions: ${totalReps}`, 20, yPosition);
      yPosition += 8;

      const totalWeight = day.exercises.reduce(
        (sum, ex) => sum + ex.weight * ex.repetitions,
        0
      );
      if (totalWeight > 0) {
        doc.text(`Total volume: ${totalWeight.toFixed(1)} kg`, 20, yPosition);
      }
    }

    // Footer
    doc.setFontSize(8);
    doc.text(
      "Generated by Planetic Gym - Your digital training companion",
      20,
      285
    );

    // PDF speichern
    const fileName = `${weekName}_${day.name}_${today.replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
  };

  // Daten vom Backend laden
  useEffect(() => {
    refreshData();
  }, []);

  const addNewDay = (weekId: string) => {
    setCurrentWeekId(weekId);
    setNewDayData({
      name: "",
      focus: "",
      exercises: [
        { name: "", repetitions: 10, weight: 0 },
      ] as FrontendExercise[],
    });
    setShowNewDayDialog(true);
  };

  const createNewDay = async () => {
    try {
      const targetWeek = trainingWeeks.find((w) => w.id === currentWeekId);
      if (!targetWeek) return;

      // Erstelle Übungen im Backend
      const exercisePromises = newDayData.exercises
        .filter((ex) => ex.name.trim() !== "")
        .map(async (exercise) => {
          return await apiService.createExercise({
            title: exercise.name,
            first_set_reps: exercise.repetitions,
            first_set_weight: exercise.weight,
          });
        });

      const createdExercises = await Promise.all(exercisePromises);
      const exerciseIds = createdExercises.map((ex) => ex.id!);

      // Erstelle WorkingDay im Backend
      await apiService.createWorkingDay({
        day_number: targetWeek.days.length + 1,
        title: newDayData.name || `Day ${targetWeek.days.length + 1}`,
        description: newDayData.focus || "whole body",
        plan_id: parseInt(currentWeekId),
        exercise_ids: exerciseIds,
      });

      setShowNewDayDialog(false);
      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error creating new day:", error);
      setError("Error while creating new day");
    }
  };

  const addNewWeek = () => {
    setNewWeekData({
      name: "",
      description: "",
    });
    setShowNewWeekDialog(true);
  };

  const createNewWeek = async () => {
    try {
      await apiService.createWorkingPlan({
        title: newWeekData.name || `Week ${trainingWeeks.length + 1}`,
        description: newWeekData.description || "New training week",
      });

      setShowNewWeekDialog(false);
      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error creating new week:", error);
      setError("Error while creating new week");
    }
  };

  const editDay = (day: TrainingDay) => {
    setEditingDay(day);
    setNewDayData({
      name: day.name,
      focus: day.focus,
      exercises: [...day.exercises],
    });
    setShowEditDayDialog(true);
  };

  const editWeek = (week: TrainingWeek) => {
    setEditingWeek(week);
    setNewWeekData({
      name: week.name,
      description: week.description,
    });
    setShowEditWeekDialog(true);
  };

  const updateWeek = async () => {
    if (!editingWeek) return;

    try {
      await apiService.updateWorkingPlan(parseInt(editingWeek.id), {
        title: newWeekData.name || editingWeek.name,
        description: newWeekData.description || editingWeek.description,
      });

      setShowEditWeekDialog(false);
      setEditingWeek(null);
      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error updating week:", error);
      setError("Fehler beim Aktualisieren der Trainingswoche");
    }
  };

  const deleteWeek = async (weekId: string) => {
    try {
      const weekIdNum = parseInt(weekId);
      if (!isNaN(weekIdNum)) {
        await apiService.deleteWorkingPlan(weekIdNum);
        await refreshData();
      }
    } catch (error) {
      console.error("Error deleting week:", error);
      setError("Fehler beim Löschen der Trainingswoche");
    }
  };

  const updateDay = async () => {
    if (!editingDay) return;

    try {
      // Update WorkingDay im Backend
      await apiService.updateWorkingDay(parseInt(editingDay.id), {
        title: newDayData.name || editingDay.name,
        description: newDayData.focus || editingDay.focus,
      });

      // Sammle alle aktuellen Exercise-IDs
      const originalExerciseIds = editingDay.exercises
        .map((ex) => ex.id)
        .filter((id) => id !== undefined) as number[];
      const newExerciseIds: number[] = [];
      const updatedExerciseIds: number[] = [];

      const filteredExercises = newDayData.exercises.filter(
        (ex) => ex.name.trim() !== ""
      );

      // Verarbeite jede Übung
      for (const newExercise of filteredExercises) {
        if (newExercise.id) {
          // Bestehende Übung aktualisieren
          await apiService.updateExercise(newExercise.id, {
            title: newExercise.name,
            first_set_reps: newExercise.repetitions,
            first_set_weight: newExercise.weight,
          });
          updatedExerciseIds.push(newExercise.id);
        } else {
          // Neue Übung erstellen
          const createdExercise = await apiService.createExercise({
            title: newExercise.name,
            first_set_reps: newExercise.repetitions,
            first_set_weight: newExercise.weight,
          });
          if (createdExercise.id) {
            newExerciseIds.push(createdExercise.id);
            updatedExerciseIds.push(createdExercise.id);
          }
        }
      }

      // Finde entfernte Übungen (die in der ursprünglichen Liste waren, aber nicht mehr in der aktualisierten)
      const removedExerciseIds = originalExerciseIds.filter(
        (id) => !updatedExerciseIds.includes(id)
      );

      // Entferne Übungen vom WorkingDay
      if (removedExerciseIds.length > 0) {
        await apiService.removeExercisesFromDay(
          parseInt(editingDay.id),
          removedExerciseIds
        );
      }

      // Füge neue Übungen zum WorkingDay hinzu
      if (newExerciseIds.length > 0) {
        await apiService.addExercisesToDay(
          parseInt(editingDay.id),
          newExerciseIds
        );
      }

      setShowEditDayDialog(false);
      setEditingDay(null);
      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error updating day:", error);
      setError("Error while updating day");
    }
  };

  // VOIX Tool Handlers
  const handleCreateWeek = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    try {
      await apiService.createWorkingPlan({
        title: details.name || `Week ${trainingWeeks.length + 1}`,
        description: details.description || "New training week",
      });

      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error creating new week:", error);
      setError("Error while creating new week");
    }
  };

  const handleCreateCompleteTrainingPlan = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    try {
      // Erstelle den Trainingsplan
      const createdPlan = await apiService.createWorkingPlan({
        title: details.name || `Training plan ${trainingWeeks.length + 1}`,
        description: details.description || "New training plan",
      });

      if (!createdPlan.id) {
        throw new Error("Failed to create training plan");
      }

      // Erstelle alle Tage mit ihren Übungen
      if (details.days && details.days.length > 0) {
        for (let dayIndex = 0; dayIndex < details.days.length; dayIndex++) {
          const day = details.days[dayIndex];

          // Erstelle Übungen für diesen Tag
          let exerciseIds: number[] = [];
          if (day.exercises && day.exercises.length > 0) {
            const exercisePromises = day.exercises
              .filter((ex: any) => ex.name && ex.name.trim() !== "")
              .map(async (exercise: any) => {
                return await apiService.createExercise({
                  title: exercise.name,
                  first_set_reps: exercise.repetitions || 10,
                  first_set_weight: exercise.weight || 0,
                });
              });
            const createdExercises = await Promise.all(exercisePromises);
            exerciseIds = createdExercises.map((ex) => ex.id!);
          }

          // Erstelle den Trainingstag
          await apiService.createWorkingDay({
            day_number: dayIndex + 1,
            title: day.name || `Day ${dayIndex + 1}`,
            description: day.focus || "whole body",
            plan_id: createdPlan.id,
            exercise_ids: exerciseIds,
          });
        }
      }

      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error creating complete training plan:", error);
      setError("Error while creating complete training plan");
    }
  };

  const handleCreateDay = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    try {
      const targetWeek = trainingWeeks.find((w) => w.id === details.weekId);
      if (!targetWeek) return;

      // Erstelle Übungen falls vorhanden
      let exerciseIds: number[] = [];
      if (details.exercises && details.exercises.length > 0) {
        const exercisePromises = details.exercises
          .filter((ex: any) => ex.name && ex.name.trim() !== "")
          .map(async (exercise: any) => {
            return await apiService.createExercise({
              title: exercise.name,
              first_set_reps: exercise.repetitions || 10,
              first_set_weight: exercise.weight || 0,
            });
          });
        const createdExercises = await Promise.all(exercisePromises);
        exerciseIds = createdExercises.map((ex) => ex.id!);
      }

      // Erstelle WorkingDay im Backend
      await apiService.createWorkingDay({
        day_number: targetWeek.days.length + 1,
        title: details.name || `Day ${targetWeek.days.length + 1}`,
        description: details.focus || "whole body",
        plan_id: parseInt(details.weekId),
        exercise_ids: exerciseIds,
      });

      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error creating new day:", error);
      setError("Error while creating new day");
    }
  };

  const handleEditDay = async (event: Event) => {
    const details = (event as CustomEvent).detail;

    try {
      // Update WorkingDay im Backend
      const dayUpdateData: any = {};
      if (details.name) dayUpdateData.title = details.name;
      if (details.focus) dayUpdateData.description = details.focus;

      if (Object.keys(dayUpdateData).length > 0) {
        await apiService.updateWorkingDay(
          parseInt(details.dayId),
          dayUpdateData
        );
      }

      // Update Übungen im Backend falls vorhanden
      if (details.exercises && details.exercises.length > 0) {
        // Finde den aktuellen Tag um die Exercise IDs zu bekommen
        const currentDay = trainingWeeks
          .flatMap((week) => week.days)
          .find((day) => day.id === details.dayId);

        if (currentDay) {
          const originalExerciseIds = currentDay.exercises
            .map((ex) => ex.id)
            .filter((id) => id !== undefined) as number[];
          const newExerciseIds: number[] = [];
          const updatedExerciseIds: number[] = [];

          for (let i = 0; i < details.exercises.length; i++) {
            const exercise = details.exercises[i];
            if (exercise.name && exercise.name.trim() !== "") {
              if (
                i < currentDay.exercises.length &&
                currentDay.exercises[i].id
              ) {
                // Update existing exercise
                await apiService.updateExercise(currentDay.exercises[i].id!, {
                  title: exercise.name,
                  first_set_reps: exercise.repetitions || 10,
                  first_set_weight: exercise.weight || 0,
                });
                updatedExerciseIds.push(currentDay.exercises[i].id!);
              } else {
                // Create new exercise
                const createdExercise = await apiService.createExercise({
                  title: exercise.name,
                  first_set_reps: exercise.repetitions || 10,
                  first_set_weight: exercise.weight || 0,
                });
                if (createdExercise.id) {
                  newExerciseIds.push(createdExercise.id);
                  updatedExerciseIds.push(createdExercise.id);
                }
              }
            }
          }

          // Finde entfernte Übungen
          const removedExerciseIds = originalExerciseIds.filter(
            (id) => !updatedExerciseIds.includes(id)
          );

          // Entferne Übungen vom WorkingDay
          if (removedExerciseIds.length > 0) {
            await apiService.removeExercisesFromDay(
              parseInt(details.dayId),
              removedExerciseIds
            );
          }

          // Füge neue Übungen zum WorkingDay hinzu
          if (newExerciseIds.length > 0) {
            await apiService.addExercisesToDay(
              parseInt(details.dayId),
              newExerciseIds
            );
          }
        }
      }

      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error updating day:", error);
      setError("Error while updating day");
    }
  };

  const handleDeleteDay = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    try {
      // Versuche die dayId als Backend-ID zu interpretieren (falls es eine Zahl ist)
      const dayId = parseInt(details.dayId);
      if (!isNaN(dayId)) {
        // Lösche vom Backend
        await apiService.deleteWorkingDay(dayId);

        // Aktualisiere die Daten
        await refreshData();
      } else {
        // Falls keine gültige Backend-ID, lösche nur aus dem Frontend-State
        setTrainingWeeks((weeks) =>
          weeks.map((week) => ({
            ...week,
            days: week.days.filter((day) => day.id !== details.dayId),
          }))
        );
      }
    } catch (error) {
      console.error("Error deleting day:", error);
      setError("Error while deleting training day");
    }
  };

  const handleDeleteWeek = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    try {
      // Versuche die weekId als Backend-ID zu interpretieren (falls es eine Zahl ist)
      const weekId = parseInt(details.weekId);
      if (!isNaN(weekId)) {
        // Lösche vom Backend
        await apiService.deleteWorkingPlan(weekId);

        // Aktualisiere die Daten
        await refreshData();
      } else {
        // Falls keine gültige Backend-ID, lösche nur aus dem Frontend-State
        setTrainingWeeks((weeks) =>
          weeks.filter((week) => week.id !== details.weekId)
        );
      }
    } catch (error) {
      console.error("Error deleting week:", error);
      setError("Error while deleting training week");
    }
  };

  const handleStartWorkout = (event: Event) => {
    const details = (event as CustomEvent).detail;
    // Store dayId in localStorage instead of URL parameter
    localStorage.setItem("selectedDayId", details.dayId);
    window.location.href = `/#/live-workout`;
  };

  const handleEditWeek = async (event: Event) => {
    const details = (event as CustomEvent).detail;
    try {
      // Update WorkingPlan im Backend
      const weekUpdateData: any = {};
      if (details.name) weekUpdateData.title = details.name;
      if (details.description) weekUpdateData.description = details.description;

      if (Object.keys(weekUpdateData).length > 0) {
        await apiService.updateWorkingPlan(
          parseInt(details.weekId),
          weekUpdateData
        );
      }

      // Lade Daten neu, um die aktuellste Version zu bekommen
      await refreshData();
    } catch (error) {
      console.error("Error updating week:", error);
      setError("Fehler beim Aktualisieren der Trainingswoche");
    }
  };

  const handleExportDay = (event: Event) => {
    const details = (event as CustomEvent).detail;
    try {
      // Finde den Tag und die Woche anhand der dayId
      const targetDay = trainingWeeks
        .flatMap((week) =>
          week.days.map((day) => ({ day, weekName: week.name }))
        )
        .find(({ day }) => day.id === details.dayId);

      if (targetDay) {
        exportDayToPDF(targetDay.day, targetDay.weekName);
      } else {
        setError("Training day not found for export");
      }
    } catch (error) {
      console.error("Error exporting day:", error);
      setError("Error while exporting training day");
    }
  };

  return (
    <Box py={8}>
      {/* VOIX Context Elements */}
      {/* @ts-ignore */}
      <context name="trainingWeeks">
        {JSON.stringify(trainingWeeks)}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="selectedDay">
        {selectedDay || "none"}
        {/* @ts-ignore */}
      </context>

      {/* @ts-ignore */}
      <context name="appState">
        The app currently shows {trainingWeeks.length} training weeks.
        {selectedDay ? `Day ${selectedDay} is selected.` : "No day selected."}
        {showNewWeekDialog ? "Dialog for new week is open." : ""}
        {showNewDayDialog ? "Dialog for new day is open." : ""}
        {showEditDayDialog ? "Dialog for editing day is open." : ""}
        {/* @ts-ignore */}
      </context>

      {/* VOIX Tool Elements */}
      <Tool
        name="create_complete_training_plan"
        description="Creates a complete training plan with multiple days and all exercises in one call"
        onCall={handleCreateCompleteTrainingPlan}
      >
        {/* @ts-ignore */}
        <prop
          name="name"
          type="string"
          required
          description="Name of the training plan"
        />
        {/* @ts-ignore */}
        <prop
          name="description"
          type="string"
          description="Description of the training plan"
        />
        {/* @ts-ignore */}
        <prop
          name="days"
          type="array"
          description="List of training days with exercises"
        >
          {/* @ts-ignore */}
          <array>
            {/* @ts-ignore */}
            <dict>
              {/* @ts-ignore */}
              <prop
                name="name"
                type="string"
                required
                description="Name of the training day"
              />
              {/* @ts-ignore */}
              <prop
                name="focus"
                type="string"
                required
                description="Focus of the training day (e.g. Upper Body, Lower Body, Full Body)"
              />
              {/* @ts-ignore */}
              <prop
                name="exercises"
                type="array"
                description="List of exercises for this day"
              >
                {/* @ts-ignore */}
                <array>
                  {/* @ts-ignore */}
                  <dict>
                    {/* @ts-ignore */}
                    <prop
                      name="name"
                      type="string"
                      required
                      description="Name of the exercise"
                    />
                    {/* @ts-ignore */}
                    <prop
                      name="repetitions"
                      type="number"
                      required
                      description="Number of repetitions"
                    />
                    {/* @ts-ignore */}
                    <prop
                      name="weight"
                      type="number"
                      description="Weight in kg (default: 0)"
                    />
                    {/* @ts-ignore */}
                  </dict>
                  {/* @ts-ignore */}
                </array>
                {/* @ts-ignore */}
              </prop>
              {/* @ts-ignore */}
            </dict>
            {/* @ts-ignore */}
          </array>
          {/* @ts-ignore */}
        </prop>
      </Tool>

      <Tool
        name="create_training_week"
        description="Creates a new training week with name and description"
        onCall={handleCreateWeek}
      >
        {/* @ts-ignore */}
        <prop
          name="name"
          type="string"
          required
          description="Name of the new training week"
        />
        {/* @ts-ignore */}
        <prop
          name="description"
          type="string"
          description="Description of the training week"
        />
      </Tool>

      <Tool
        name="create_training_day"
        description="Creates a new training day in a specific week"
        onCall={handleCreateDay}
      >
        {/* @ts-ignore */}
        <prop
          name="weekId"
          type="string"
          required
          description="ID of the week to which the day should be added"
        />
        {/* @ts-ignore */}
        <prop
          name="name"
          type="string"
          required
          description="Name of the training day"
        />
        {/* @ts-ignore */}
        <prop
          name="focus"
          type="string"
          required
          description="Training focus (e.g. upper body, lower body, full body)"
        />
        {/* @ts-ignore */}
        <prop name="exercises" type="array" description="List of exercises">
          {/* @ts-ignore */}
          <array>
            {/* @ts-ignore */}
            <dict>
              {/* @ts-ignore */}
              <prop
                name="name"
                type="string"
                required
                description="Name of the exercise"
              />
              {/* @ts-ignore */}
              <prop
                name="repetitions"
                type="number"
                required
                description="Number of repetitions"
              />
              {/* @ts-ignore */}
              <prop
                name="weight"
                type="number"
                description="Weight in kg (default: 0)"
              />
              {/* @ts-ignore */}
            </dict>
            {/* @ts-ignore */}
          </array>
          {/* @ts-ignore */}
        </prop>
      </Tool>

      <Tool
        name="edit_training_day"
        description="Edits an existing training day"
        onCall={handleEditDay}
      >
        {/* @ts-ignore */}
        <prop
          name="dayId"
          type="string"
          required
          description="ID of the training day to be edited"
        />
        {/* @ts-ignore */}
        <prop
          name="name"
          type="string"
          description="New name of the training day"
        />
        {/* @ts-ignore */}
        <prop name="focus" type="string" description="New training focus" />
        {/* @ts-ignore */}
        <prop name="exercises" type="array" description="New list of exercises">
          {/* @ts-ignore */}
          <array>
            {/* @ts-ignore */}
            <dict>
              {/* @ts-ignore */}
              <prop
                name="name"
                type="string"
                required
                description="Name of the exercise"
              />
              {/* @ts-ignore */}
              <prop
                name="repetitions"
                type="number"
                required
                description="Number of repetitions"
              />
              {/* @ts-ignore */}
              <prop name="weight" type="number" description="Weight in kg" />
              {/* @ts-ignore */}
            </dict>
            {/* @ts-ignore */}
          </array>
          {/* @ts-ignore */}
        </prop>
      </Tool>

      <Tool
        name="delete_training_day"
        description="Deletes a training day"
        onCall={handleDeleteDay}
      >
        {/* @ts-ignore */}
        <prop
          name="dayId"
          type="string"
          required
          description="ID of the training day to be deleted"
        />
      </Tool>

      <Tool
        name="delete_training_week"
        description="Löscht eine Trainingswoche"
        onCall={handleDeleteWeek}
      >
        {/* @ts-ignore */}
        <prop
          name="weekId"
          type="string"
          required
          description="ID der zu löschenden Trainingswoche"
        />
      </Tool>

      <Tool
        name="edit_training_week"
        description="Bearbeitet eine bestehende Trainingswoche"
        onCall={handleEditWeek}
      >
        {/* @ts-ignore */}
        <prop
          name="weekId"
          type="string"
          required
          description="ID der zu bearbeitenden Trainingswoche"
        />
        {/* @ts-ignore */}
        <prop
          name="name"
          type="string"
          description="Neuer Name der Trainingswoche"
        />
        {/* @ts-ignore */}
        <prop
          name="description"
          type="string"
          description="Neue Beschreibung der Trainingswoche"
        />
      </Tool>

      <Tool
        name="export_training_day"
        description="Exportiert einen Trainingstag als PDF und startet den Download"
        onCall={handleExportDay}
      >
        {/* @ts-ignore */}
        <prop
          name="dayId"
          type="string"
          required
          description="ID des Trainingstages der exportiert werden soll"
        />
      </Tool>

      <Tool
        name="start_workout"
        description="Starts a workout for a specific day"
        onCall={handleStartWorkout}
      >
        {/* @ts-ignore */}
        <prop
          name="dayId"
          type="string"
          required
          description="ID of the training day to start"
        />
      </Tool>

      <Container maxW="6xl">
        <Stack gap={4} textAlign="center" mb={12}>
          <Flex align="center" justify="center" gap={3}>
            <FaClipboardList size="2rem" color="var(--colors-accent-primary)" />
            <Heading size="2xl" color="text.primary">
              Deine Trainingspläne
            </Heading>
          </Flex>
          <Text fontSize="lg" color="text.secondary">
            Manage your training weeks and days (Data from database)
          </Text>
          {trainingWeeks.length > 0 && (
            <Flex align="center" justify="center" gap={2}>
              <FaCheckCircle color="green" />
              <Text fontSize="sm" color="green.600">
                {trainingWeeks.length} Trainingsplan
                {trainingWeeks.length !== 1 ? "e" : ""} aus der Datenbank
                geladen
              </Text>
            </Flex>
          )}
        </Stack>

        {/* Error Alert */}
        {error && (
          <Box
            bg="red.50"
            border="1px"
            borderColor="red.200"
            p={4}
            mb={6}
            borderRadius="md"
          >
            <Text color="red.600">{error}</Text>
          </Box>
        )}

        <Flex justify="center" mb={8}>
          <Button
            onClick={addNewWeek}
            bg="accent.primary"
            color="white"
            _hover={{ bg: "accent.secondary" }}
            size="lg"
            px={8}
            loading={isLoading}
          >
            <Flex align="center" gap={2}>
              <FaPlus />
              <Text>New Week</Text>
            </Flex>
          </Button>
        </Flex>

        {/* Loading State */}
        {isLoading ? (
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="accent.primary" />
          </Flex>
        ) : trainingWeeks.length === 0 ? (
          /* Empty State - Keine Daten in der Datenbank */
          <Box textAlign="center" py={12}>
            <Flex direction="column" align="center" gap={4}>
              <FaDumbbell size="4rem" color="var(--colors-text-secondary)" />
              <Text fontSize="xl" color="text.secondary">
                Keine Trainingspläne in der Datenbank gefunden
              </Text>
              <Text color="text.secondary">
                Erstelle deinen ersten Trainingsplan, um ihn in der Datenbank zu
                speichern!
              </Text>
              <Button
                onClick={addNewWeek}
                bg="accent.primary"
                color="white"
                _hover={{ bg: "accent.secondary" }}
                size="lg"
              >
                <Flex align="center" gap={2}>
                  <FaPlus />
                  <Text>Ersten Plan erstellen</Text>
                </Flex>
              </Button>
            </Flex>
          </Box>
        ) : (
          /* Training Plans aus der Datenbank */
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
                    <Flex gap={2} align="center">
                      <MenuRoot>
                        <MenuTrigger asChild>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            aria-label="Trainingsplan bearbeiten"
                          >
                            <FaCog />
                          </IconButton>
                        </MenuTrigger>
                        <MenuContent>
                          <MenuItem value="edit" onClick={() => editWeek(week)}>
                            <Flex align="center" gap={2}>
                              <FaEdit />
                              <Text>Bearbeiten</Text>
                            </Flex>
                          </MenuItem>
                          <MenuItem
                            value="delete"
                            onClick={() => deleteWeek(week.id)}
                            color="red.600"
                          >
                            <Flex align="center" gap={2}>
                              <FaTrash />
                              <Text>Löschen</Text>
                            </Flex>
                          </MenuItem>
                        </MenuContent>
                      </MenuRoot>
                      <Button
                        onClick={() => addNewDay(week.id)}
                        bg="accent.primary"
                        color="white"
                        _hover={{ bg: "accent.secondary" }}
                        size="sm"
                      >
                        <Flex align="center" gap={1}>
                          <FaPlus size="0.8rem" />
                          <Text>Tag</Text>
                        </Flex>
                      </Button>
                    </Flex>
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
                            setSelectedDay(
                              selectedDay === day.id ? null : day.id
                            )
                          }
                        >
                          <Card.Body p={4}>
                            <Stack gap={3}>
                              <Flex justify="space-between" align="center">
                                <Heading size="md" color="text.primary">
                                  {day.name}
                                </Heading>
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
                                  Exercises:
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
                                    // Store dayId in localStorage instead of URL parameter
                                    localStorage.setItem(
                                      "selectedDayId",
                                      day.id
                                    );
                                    window.location.href = `/#/live-workout`;
                                  }}
                                >
                                  <Flex align="center" gap={1}>
                                    <FaPlay size="0.8rem" />
                                    <Text fontSize="xs">Start</Text>
                                  </Flex>
                                </Button>
                                <Button
                                  bg="blue.500"
                                  color="white"
                                  _hover={{ bg: "blue.600" }}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    exportDayToPDF(day, week.name);
                                  }}
                                  title="Als PDF exportieren"
                                >
                                  <FaFilePdf size="0.8rem" />
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
                                  <FaEdit size="0.8rem" />
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
                        No training days available
                      </Text>
                      <Text color="text.secondary" fontSize="sm" mt={2}>
                        Click "Add Day" to get started
                      </Text>
                    </Box>
                  )}
                </Stack>
              </Card.Root>
            ))}

            <Box mt={12} p={6} bg="bg.secondary" borderRadius="lg">
              <Flex align="center" justify="center" gap={2} mb={4}>
                <FaFire color="var(--colors-accent-primary)" />
                <Heading size="md" color="text.primary">
                  Trainingstipps
                </Heading>
              </Flex>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={4}
              >
                <Box
                  textAlign="center"
                  p={4}
                  bg="bg.tertiary"
                  borderRadius="md"
                >
                  <Flex justify="center" mb={2}>
                    <FaFire size="2rem" color="var(--colors-accent-primary)" />
                  </Flex>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color="text.primary"
                    mb={1}
                  >
                    Warm Up
                  </Text>
                  <Text fontSize="xs" color="text.secondary">
                    Start each workout with 5-10 minutes of warm-up exercises
                  </Text>
                </Box>
                <Box
                  textAlign="center"
                  p={4}
                  bg="bg.tertiary"
                  borderRadius="md"
                >
                  <Flex justify="center" mb={2}>
                    <FaTint size="2rem" color="var(--colors-blue-500)" />
                  </Flex>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color="text.primary"
                    mb={1}
                  >
                    Hydration
                  </Text>
                  <Text fontSize="xs" color="text.secondary">
                    Drink plenty of water before, during, and after your workout
                  </Text>
                </Box>
                <Box
                  textAlign="center"
                  p={4}
                  bg="bg.tertiary"
                  borderRadius="md"
                >
                  <Flex justify="center" mb={2}>
                    <FaBed size="2rem" color="var(--colors-purple-500)" />
                  </Flex>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color="text.primary"
                    mb={1}
                  >
                    Recovery
                  </Text>
                  <Text fontSize="xs" color="text.secondary">
                    Give your body rest between training sessions
                  </Text>
                </Box>
              </Grid>
            </Box>
          </Stack>
        )}

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
                    onClick={() => {
                      setShowEditWeekDialog(false);
                      setEditingWeek(null);
                    }}
                    bg="gray.500"
                    color="white"
                    _hover={{ bg: "gray.600" }}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={updateWeek}
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

        {/* Dialog für Trainingswoche bearbeiten */}
        {showEditWeekDialog && (
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
                  Trainingswoche bearbeiten
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
                    onClick={() => {
                      setShowEditWeekDialog(false);
                      setEditingWeek(null);
                    }}
                    bg="gray.500"
                    color="white"
                    _hover={{ bg: "gray.600" }}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={updateWeek}
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
                  Create New Training Day
                </Heading>

                <Stack gap={3}>
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Training Day Name:
                    </Text>
                    <Input
                      value={newDayData.name}
                      onChange={(e) =>
                        setNewDayData({ ...newDayData, name: e.target.value })
                      }
                      placeholder="e.g. Upper Body Power"
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Training Focus:
                    </Text>
                    <Input
                      value={newDayData.focus}
                      onChange={(e) =>
                        setNewDayData({ ...newDayData, focus: e.target.value })
                      }
                      placeholder="e.g. Upper Body, Lower Body, Cardio..."
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Exercises:
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
                                placeholder="Enter excercise..."
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
                                <FaTimes />
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
                        <Flex align="center" gap={1}>
                          <FaPlus size="0.8rem" />
                          <Text>Add Exercise</Text>
                        </Flex>
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
                    Cancel
                  </Button>
                  <Button
                    onClick={createNewDay}
                    bg="accent.primary"
                    color="white"
                    _hover={{ bg: "accent.secondary" }}
                  >
                    Create
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
                  Edit Training Day
                </Heading>

                <Stack gap={3}>
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={1}
                    >
                      Training Day Name:
                    </Text>
                    <Input
                      value={newDayData.name}
                      onChange={(e) =>
                        setNewDayData({ ...newDayData, name: e.target.value })
                      }
                      placeholder="e.g. upper body power"
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
                      placeholder="z.B. Upper body, Lower body, Cardio..."
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
                                placeholder="Enter excercise..."
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
                                <FaTimes />
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
                        <Flex align="center" gap={1}>
                          <FaPlus size="0.8rem" />
                          <Text>Add Exercise</Text>
                        </Flex>
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
                    Cancel
                  </Button>
                  <Button
                    onClick={updateDay}
                    bg="accent.primary"
                    color="white"
                    _hover={{ bg: "accent.secondary" }}
                  >
                    Save
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
