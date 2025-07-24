const API_BASE_URL = "http://localhost:8000";

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
