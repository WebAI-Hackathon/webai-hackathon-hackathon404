const API_BASE_URL = "https://webai-hackathon-hackathon404.onrender.com";

// Types basierend auf Backend Schemas
export interface Exercise {
  id?: number;
  title: string;
  description?: string;
  sets_completed?: number;
  first_set_weight?: number;
  first_set_reps?: number;
}

export interface WorkingDay {
  id?: number;
  day_number: number;
  title: string;
  description?: string;
  plan_id?: number;
  sets_completed?: number;
  exercises: Exercise[];
}

export interface WorkingPlan {
  id?: number;
  title: string;
  description?: string;
  created_at?: string;
  days: WorkingDay[];
}

// Statistics Types
export interface WeightProgressionPoint {
  date: string;
  weight: number;
}

export interface ExerciseFrequency {
  exercise_id: number;
  exercise_title: string;
  frequency: number;
}

export interface ExerciseStatistics {
  exercise_id: number;
  exercise_title: string;
  total_workouts: number;
  weight_progression: WeightProgressionPoint[];
  last_workout_date?: string;
}

export interface WorkoutStatistics {
  total_workouts: number;
  weekly_workouts: number;
  monthly_workouts: number;
  last_three_workouts: WorkingDay[];
}

export interface OverallStatistics {
  workout_stats: WorkoutStatistics;
  exercise_frequencies: ExerciseFrequency[];
  exercise_stats: ExerciseStatistics[];
  extended_exercise_stats: ExtendedExerciseStats[];
  plan_statistics: PlanStatistics[];
  progress_data: ExerciseProgress[];
}

export interface ExtendedExerciseStats {
  exercise_id: number;
  exercise_title: string;
  plan_title: string;
  total_workouts: number;
  total_sets: number;
  max_weight?: number;
  avg_weight?: number;
  max_reps?: number;
  avg_reps?: number;
  last_workout_date?: string;
}

export interface PlanStatistics {
  plan_id: number;
  plan_title: string;
  total_workouts: number;
  total_exercises: number;
  completion_rate: number;
  last_workout_date?: string;
}

export interface ProgressDataPoint {
  date: string;
  exercise_name: string;
  max_weight?: number;
  avg_weight?: number;
  total_sets: number;
  total_reps: number;
}

export interface ExerciseProgress {
  exercise_name: string;
  data_points: ProgressDataPoint[];
  overall_improvement: number;
  current_streak: number;
}

// API Service
class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Exercise endpoints
  async createExercise(exercise: Omit<Exercise, "id">): Promise<Exercise> {
    return this.request("/api/training/exercise/", {
      method: "POST",
      body: JSON.stringify(exercise),
    });
  }

  async getExercises(): Promise<Exercise[]> {
    return this.request("/api/training/exercise/");
  }

  // Working Plan endpoints
  async createWorkingPlan(
    plan: Omit<WorkingPlan, "id" | "created_at" | "days">
  ): Promise<WorkingPlan> {
    return this.request("/api/training/plan/", {
      method: "POST",
      body: JSON.stringify(plan),
    });
  }

  async getWorkingPlans(): Promise<WorkingPlan[]> {
    return this.request("/api/training/plan/");
  }

  async getWorkingPlan(planId: number): Promise<WorkingPlan> {
    return this.request(`/api/training/plan/${planId}`);
  }

  async updateWorkingPlan(
    planId: number,
    updates: {
      title?: string;
      description?: string;
    }
  ): Promise<WorkingPlan> {
    return this.request(`/api/training/plan/${planId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteWorkingPlan(planId: number): Promise<{ message: string }> {
    return this.request(`/api/training/plan/${planId}`, {
      method: "DELETE",
    });
  }

  // Working Day endpoints
  async createWorkingDay(day: {
    day_number: number;
    title: string;
    description?: string;
    plan_id: number;
    exercise_ids?: number[];
  }): Promise<WorkingDay> {
    return this.request("/api/training/day/", {
      method: "POST",
      body: JSON.stringify(day),
    });
  }

  async getWorkingDays(): Promise<WorkingDay[]> {
    return this.request("/api/training/day/");
  }

  async getWorkingDay(dayId: number): Promise<WorkingDay> {
    return this.request(`/api/training/day/${dayId}`);
  }

  async deleteWorkingDay(dayId: number): Promise<{ message: string }> {
    return this.request(`/api/training/day/${dayId}`, {
      method: "DELETE",
    });
  }

  // Update methods for live workout
  async updateWorkingDay(
    dayId: number,
    updates: {
      title?: string;
      description?: string;
      sets_completed?: number;
    }
  ): Promise<WorkingDay> {
    return this.request(`/api/training/day/${dayId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async updateExercise(
    exerciseId: number,
    updates: {
      title?: string;
      description?: string;
      sets_completed?: number;
      first_set_weight?: number;
      first_set_reps?: number;
    }
  ): Promise<Exercise> {
    return this.request(`/api/training/exercise/${exerciseId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Statistics endpoints
  async getOverallStatistics(): Promise<OverallStatistics> {
    return this.request("/api/training/statistics/");
  }

  async getExerciseStatistics(exerciseId: number): Promise<ExerciseStatistics> {
    return this.request(`/api/training/statistics/exercise/${exerciseId}`);
  }

  async getExerciseFrequency(days: number = 30): Promise<ExerciseFrequency[]> {
    return this.request(
      `/api/training/statistics/exercise-frequency?days=${days}`
    );
  }

  async getWeightProgression(
    exerciseId: number,
    limit: number = 20
  ): Promise<WeightProgressionPoint[]> {
    return this.request(
      `/api/training/statistics/weight-progression/${exerciseId}?limit=${limit}`
    );
  }

  async getWorkoutStatistics(): Promise<WorkoutStatistics> {
    return this.request("/api/training/statistics/workout-count");
  }

  async addExercisesToDay(
    dayId: number,
    exerciseIds: number[]
  ): Promise<WorkingDay> {
    return this.request(`/api/training/day/${dayId}/exercises`, {
      method: "POST",
      body: JSON.stringify(exerciseIds),
    });
  }

  async removeExercisesFromDay(
    dayId: number,
    exerciseIds: number[]
  ): Promise<WorkingDay> {
    return this.request(`/api/training/day/${dayId}/exercises`, {
      method: "DELETE",
      body: JSON.stringify(exerciseIds),
    });
  }
}

export const apiService = new ApiService();
