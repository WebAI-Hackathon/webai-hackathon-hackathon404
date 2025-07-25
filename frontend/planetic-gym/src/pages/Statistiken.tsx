import { useState } from "react";
import {
  Box,
  HStack,
  Text,
  Heading,
  Badge,
  Container,
  Stack,
  Spinner,
  Grid,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiService, type OverallStatistics } from "../services/api";
import ProgressRing from "../components/ProgressRing";
import { Tool } from "../components/Tool";

const Statistiken = () => {
  const [overallStats, setOverallStats] = useState<OverallStatistics | null>(null);
  const [exerciseFrequencies, setExerciseFrequencies] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [planStats, setPlanStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Context für AI
  const statisticsContext = () => {
    if (!overallStats) {
      return "Keine Statistiken geladen. Verwende die verfügbaren Tools um Trainingsstatistiken abzurufen.";
    }
    return `Aktuelle Trainingsstatistiken: ${overallStats.workout_stats.total_workouts} Workouts insgesamt, ${overallStats.extended_exercise_stats.length} verschiedene Übungen durchgeführt.`;
  };

  // Tool: Übersicht der Trainingsstatistiken anzeigen
  const handleGetOverviewStats = async (event: Event) => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await apiService.getOverallStatistics();
      setOverallStats(stats);
      
      // Return data to AI
      (event.target as any).dispatchEvent(new CustomEvent('return', { 
        detail: {
          total_workouts: stats.workout_stats.total_workouts,
          total_exercises: stats.extended_exercise_stats.length,
          total_plans: stats.plan_statistics.length
        }
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Fehler beim Laden der Übersichtsstatistiken";
      setError(errorMsg);
      (event.target as any).dispatchEvent(new CustomEvent('return', { 
        detail: { error: errorMsg }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Tool: Übungsfrequenzen anzeigen
  const handleGetExerciseFrequencies = async (event: Event) => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await apiService.getOverallStatistics();
      setExerciseFrequencies(stats.exercise_frequencies);
      
      const topExercises = stats.exercise_frequencies.slice(0, 3);
      (event.target as any).dispatchEvent(new CustomEvent('return', { 
        detail: {
          message: `Top 3 Übungen: ${topExercises.map(ex => `${ex.exercise_title} (${ex.frequency} Sets)`).join(', ')}`,
          total_exercises: stats.exercise_frequencies.length
        }
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Fehler beim Laden der Übungsfrequenzen";
      setError(errorMsg);
      (event.target as any).dispatchEvent(new CustomEvent('return', { 
        detail: { error: errorMsg }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Tool: Fortschrittsdiagramme anzeigen
  const handleGetProgressCharts = async (event: Event) => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await apiService.getOverallStatistics();
      setProgressData(stats.progress_data || []);
      
      const improvements = stats.progress_data?.map(p => ({
        exercise: p.exercise_name,
        improvement: p.overall_improvement
      })) || [];
      
      (event.target as any).dispatchEvent(new CustomEvent('return', { 
        detail: {
          message: `Fortschrittsdiagramme für ${improvements.length} Übungen geladen`,
          improvements: improvements
        }
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Fehler beim Laden der Fortschrittsdiagramme";
      setError(errorMsg);
      (event.target as any).dispatchEvent(new CustomEvent('return', { 
        detail: { error: errorMsg }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Tool: Trainingsplan-Statistiken anzeigen
  const handleGetPlanStats = async (event: Event) => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await apiService.getOverallStatistics();
      setPlanStats(stats.plan_statistics);
      
      const planSummary = stats.plan_statistics.map(plan => ({
        name: plan.plan_title,
        completion: plan.completion_rate,
        workouts: plan.total_workouts
      }));
      
      (event.target as any).dispatchEvent(new CustomEvent('return', { 
        detail: {
          message: `${stats.plan_statistics.length} Trainingspläne analysiert`,
          plans: planSummary
        }
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Fehler beim Laden der Trainingsplan-Statistiken";
      setError(errorMsg);
      (event.target as any).dispatchEvent(new CustomEvent('return', { 
        detail: { error: errorMsg }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box py={8}>
      <Container maxW="7xl">
        {/* VOIX Tools */}
        <Tool 
          name="get_workout_overview" 
          description="Zeige eine Übersicht der Trainingsstatistiken mit Progress Ringen an"
          onCall={handleGetOverviewStats}
          return
        />
        
        <Tool 
          name="show_exercise_frequencies" 
          description="Zeige Übungsfrequenzen als Histogramm an"
          onCall={handleGetExerciseFrequencies}
          return
        />
        
        <Tool 
          name="display_progress_charts" 
          description="Zeige Fortschrittsdiagramme für Gewichtsentwicklung an"
          onCall={handleGetProgressCharts}
          return
        />
        
        <Tool 
          name="show_plan_statistics" 
          description="Zeige Trainingsplan-Statistiken und Completion Rates an"
          onCall={handleGetPlanStats}
          return
        />

        {/* Context für AI */}
        <div data-context="training_statistics">
          {statisticsContext()}
        </div>

        <Stack gap={8}>
          <Heading color="text.primary" textAlign="center">
            📊 Trainings-Statistiken
          </Heading>
          
          {loading && (
            <Stack gap={4} textAlign="center" align="center">
              <Spinner size="xl" color="accent.primary" />
              <Text>Lade Statistiken...</Text>
            </Stack>
          )}

          {error && (
            <Box
              p={6}
              bg="red.50"
              borderColor="red.200"
              borderWidth="1px"
              rounded="lg"
              textAlign="center"
            >
              <Text color="red.600" fontWeight="bold" mb={2}>
                ⚠️ Fehler beim Laden
              </Text>
              <Text color="red.600">{error}</Text>
            </Box>
          )}

          {!overallStats && !loading && !error && (
            <Box
              p={8}
              bg="bg.secondary"
              borderColor="border"
              borderWidth="1px"
              rounded="lg"
              textAlign="center"
            >
              <Text color="text.secondary" fontSize="lg" mb={4}>
                🎯 Statistiken bereit zur Anzeige
              </Text>
              <Text color="text.secondary">
                Sage der KI, welche Statistiken du sehen möchtest:
              </Text>
              <Box mt={4} color="text.secondary" fontSize="sm">
                <Text>• "Zeige mir eine Übersicht meiner Trainingsstatistiken"</Text>
                <Text>• "Zeige die Häufigkeit meiner Übungen"</Text>
                <Text>• "Zeige meine Fortschrittsdiagramme"</Text>
                <Text>• "Wie sehen meine Trainingsplan-Statistiken aus?"</Text>
              </Box>
            </Box>
          )}

          {/* Progress Ringe - Overall Performance */}
          {overallStats && (
            <Box
              p={6}
              bg="bg.secondary"
              borderColor="border"
              borderWidth="1px"
              rounded="lg"
            >
              <Heading size="md" color="text.primary" mb={6}>
                📊 Performance Übersicht
              </Heading>
              <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }} gap={6}>
                {/* Workout Completion */}
                <ProgressRing
                  percentage={Math.min((overallStats.workout_stats.total_workouts / 20) * 100, 100)}
                  color="#3B82F6"
                  label="Workout Fortschritt"
                  value={`${overallStats.workout_stats.total_workouts}/20`}
                  size={100}
                />
                
                {/* Exercise Variety */}
                <ProgressRing
                  percentage={Math.min((overallStats.extended_exercise_stats.length / 15) * 100, 100)}
                  color="#10B981"
                  label="Übungsvielfalt"
                  value={`${overallStats.extended_exercise_stats.length}/15`}
                  size={100}
                />
                
                {/* Plan Usage */}
                {overallStats.plan_statistics.length > 0 && (
                  <ProgressRing
                    percentage={overallStats.plan_statistics[0]?.completion_rate || 0}
                    color="#F59E0B"
                    label="Plan Vollständigkeit"
                    value={`${Math.round(overallStats.plan_statistics[0]?.completion_rate || 0)}%`}
                    size={100}
                  />
                )}
                
                {/* Total Sets Achievement */}
                {overallStats.extended_exercise_stats.length > 0 && (
                  <ProgressRing
                    percentage={Math.min((overallStats.extended_exercise_stats.reduce((sum, ex) => sum + ex.total_sets, 0) / 100) * 100, 100)}
                    color="#EF4444"
                    label="Gesamte Sets"
                    value={`${overallStats.extended_exercise_stats.reduce((sum, ex) => sum + ex.total_sets, 0)}`}
                    size={100}
                  />
                )}
                
                {/* Weight Progress (if available) */}
                {progressData && progressData.length > 0 && (
                  <ProgressRing
                    percentage={Math.max(0, Math.min(100, progressData[0].overall_improvement + 50))}
                    color="#8B5CF6"
                    label="Gewichts-entwicklung"
                    value={`${progressData[0].overall_improvement > 0 ? '+' : ''}${progressData[0].overall_improvement.toFixed(1)}%`}
                    size={100}
                  />
                )}
              </Grid>
            </Box>
          )}

          {/* Exercise Frequencies Histogram */}
          {exerciseFrequencies.length > 0 && (
            <Box
              p={6}
              bg="bg.secondary"
              borderColor="border"
              borderWidth="1px"
              rounded="lg"
            >
              <Heading size="md" color="text.primary" mb={6}>
                🏋️ Übungshäufigkeiten
              </Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                {exerciseFrequencies.slice(0, 9).map((exercise, index) => (
                  <Box
                    key={exercise.exercise_id}
                    p={4}
                    bg="bg.tertiary"
                    rounded="md"
                    borderColor="border"
                    borderWidth="1px"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text 
                        color="text.primary" 
                        fontWeight="bold" 
                        fontSize="sm" 
                        maxW="200px" 
                        style={{ 
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical"
                        }}
                      >
                        {exercise.exercise_title}
                      </Text>
                      <Badge colorScheme={index < 3 ? "green" : index < 6 ? "yellow" : "gray"}>
                        {exercise.frequency} Sets
                      </Badge>
                    </HStack>
                    
                    {/* Histogram Bar */}
                    <Box bg="bg.secondary" rounded="md" h="12px" overflow="hidden" mb={2}>
                      <Box 
                        bg={index < 3 ? "green.500" : index < 6 ? "yellow.500" : "gray.500"}
                        h="100%"
                        w={`${Math.min((exercise.frequency / Math.max(...exerciseFrequencies.map(e => e.frequency))) * 100, 100)}%`}
                        rounded="md"
                        transition="width 0.3s ease"
                      />
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Box>
          )}

          {/* Liniendiagramme - Weight Progression */}
          {progressData && progressData.length > 0 && (
            <Box
              p={6}
              bg="bg.secondary"
              borderColor="border"
              borderWidth="1px"
              rounded="lg"
            >
              <Heading size="md" color="text.primary" mb={6}>
                📈 Gewichtsentwicklung
              </Heading>
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {progressData.slice(0, 4).map((exerciseProgress) => (
                  <Box
                    key={exerciseProgress.exercise_name}
                    p={4}
                    bg="bg.tertiary"
                    rounded="md"
                    borderColor="border"
                    borderWidth="1px"
                  >
                    <Text color="text.primary" fontWeight="bold" fontSize="md" mb={4}>
                      {exerciseProgress.exercise_name}
                    </Text>
                    
                    <HStack justify="space-between" mb={4}>
                      <Text color="text.secondary" fontSize="sm">
                        Verbesserung: 
                        <Text as="span" color={exerciseProgress.overall_improvement >= 0 ? "green.400" : "red.400"} ml={1}>
                          {exerciseProgress.overall_improvement > 0 ? '+' : ''}{exerciseProgress.overall_improvement.toFixed(1)}%
                        </Text>
                      </Text>
                      <Badge colorScheme={exerciseProgress.current_streak >= 3 ? "green" : "yellow"}>
                        Streak: {exerciseProgress.current_streak}
                      </Badge>
                    </HStack>
                    
                    <Box height="200px">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={exerciseProgress.data_points}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(date) => new Date(date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            fontSize={12}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: '1px solid #374151',
                              borderRadius: '6px',
                              color: '#F9FAFB'
                            }}
                            labelFormatter={(date) => new Date(date).toLocaleDateString('de-DE')}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="max_weight" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            name="Gewicht (kg)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="total_sets" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            name="Sets"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Box>
          )}

          {/* Plan Statistics */}
          {planStats && planStats.length > 0 && (
            <Box
              p={6}
              bg="bg.secondary"
              borderColor="border"
              borderWidth="1px"
              rounded="lg"
            >
              <Heading size="md" color="text.primary" mb={6}>
                📋 Trainingsplan-Statistiken
              </Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                {planStats.map((plan) => (
                  <Box
                    key={plan.plan_id}
                    p={4}
                    bg="bg.tertiary"
                    rounded="md"
                    borderColor="border"
                    borderWidth="1px"
                  >
                    <Stack gap={3}>
                      <Text color="text.primary" fontWeight="bold" fontSize="md">
                        {plan.plan_title}
                      </Text>
                      
                      <Stack gap={2}>
                        <Stack direction="row" justify="space-between">
                          <Text color="text.secondary" fontSize="sm">Workouts:</Text>
                          <Text color="accent.primary" fontSize="sm" fontWeight="bold">
                            {plan.total_workouts}
                          </Text>
                        </Stack>
                        
                        <Stack direction="row" justify="space-between">
                          <Text color="text.secondary" fontSize="sm">Übungen:</Text>
                          <Text color="text.primary" fontSize="sm">
                            {plan.total_exercises}
                          </Text>
                        </Stack>
                        
                        <Stack direction="row" justify="space-between">
                          <Text color="text.secondary" fontSize="sm">Vollständigkeit:</Text>
                          <Text 
                            color={plan.completion_rate >= 80 ? "green.500" : plan.completion_rate >= 50 ? "orange.500" : "red.500"} 
                            fontSize="sm" 
                            fontWeight="bold"
                          >
                            {plan.completion_rate}%
                          </Text>
                        </Stack>
                      </Stack>
                      
                      {/* Completion Progress Bar */}
                      <Box bg="bg.secondary" rounded="md" h="6px" overflow="hidden">
                        <Box 
                          bg={plan.completion_rate >= 80 ? "green.500" : plan.completion_rate >= 50 ? "orange.500" : "red.500"}
                          h="100%"
                          w={`${plan.completion_rate}%`}
                          rounded="md"
                          transition="width 0.3s ease"
                        />
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Grid>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default Statistiken;
