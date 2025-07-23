import { useState } from "react";
import "./Statistiken.css";

const Statistiken = () => {
  const [timeRange, setTimeRange] = useState("week");

  const weeklyStats = {
    workouts: 5,
    calories: 1250,
    duration: 180,
    streak: 7,
  };

  const monthlyStats = {
    workouts: 18,
    calories: 4800,
    duration: 720,
    streak: 15,
  };

  const currentStats = timeRange === "week" ? weeklyStats : monthlyStats;

  const workoutHistory = [
    { date: "2024-07-23", type: "Ganzkörper", duration: 45, calories: 320 },
    { date: "2024-07-22", type: "Cardio", duration: 30, calories: 280 },
    { date: "2024-07-21", type: "Kraft", duration: 50, calories: 350 },
    { date: "2024-07-20", type: "HIIT", duration: 25, calories: 300 },
    { date: "2024-07-19", type: "Yoga", duration: 40, calories: 150 },
  ];

  const goals = [
    { name: "Wöchentliche Workouts", current: 5, target: 5, achieved: true },
    {
      name: "Monatliche Kalorien",
      current: 4800,
      target: 5000,
      achieved: false,
    },
    { name: "Workout-Streak", current: 7, target: 10, achieved: false },
  ];

  return (
    <div className="statistiken">
      <div className="stats-header">
        <h1>📊 Deine Statistiken</h1>
        <p>Verfolge deinen Fortschritt und erreiche deine Ziele</p>
      </div>

      <div className="time-range-selector">
        <button
          className={`range-btn ${timeRange === "week" ? "active" : ""}`}
          onClick={() => setTimeRange("week")}
        >
          Diese Woche
        </button>
        <button
          className={`range-btn ${timeRange === "month" ? "active" : ""}`}
          onClick={() => setTimeRange("month")}
        >
          Dieser Monat
        </button>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">🏃‍♂️</div>
          <div className="stat-info">
            <span className="stat-number">{currentStats.workouts}</span>
            <span className="stat-label">Workouts</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <span className="stat-number">
              {currentStats.calories.toLocaleString()}
            </span>
            <span className="stat-label">Kalorien</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <span className="stat-number">
              {Math.floor(currentStats.duration / 60)}h{" "}
              {currentStats.duration % 60}m
            </span>
            <span className="stat-label">Trainingszeit</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <span className="stat-number">{currentStats.streak}</span>
            <span className="stat-label">Tage Streak</span>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="goals-section">
          <h3>🎯 Deine Ziele</h3>
          <div className="goals-list">
            {goals.map((goal, index) => (
              <div key={index} className="goal-item">
                <div className="goal-info">
                  <span className="goal-name">{goal.name}</span>
                  <span className="goal-progress">
                    {goal.current.toLocaleString()} /{" "}
                    {goal.target.toLocaleString()}
                  </span>
                </div>
                <div className="goal-bar">
                  <div
                    className={`goal-fill ${goal.achieved ? "achieved" : ""}`}
                    style={{
                      width: `${Math.min(
                        (goal.current / goal.target) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="goal-status">{goal.achieved ? "✅" : "🎯"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="workout-history">
          <h3>📝 Workout Verlauf</h3>
          <div className="history-list">
            {workoutHistory.map((workout, index) => (
              <div key={index} className="history-item">
                <div className="workout-date">
                  {new Date(workout.date).toLocaleDateString("de-DE", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div className="workout-details">
                  <span className="workout-type">{workout.type}</span>
                  <div className="workout-metrics">
                    <span>⏱️ {workout.duration}min</span>
                    <span>🔥 {workout.calories} kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="achievements-section">
        <h3>🏆 Errungenschaften</h3>
        <div className="achievements-grid">
          <div className="achievement-card earned">
            <div className="achievement-icon">🔥</div>
            <div className="achievement-info">
              <h4>Feuer & Flamme</h4>
              <p>5 Workouts in einer Woche</p>
            </div>
          </div>
          <div className="achievement-card earned">
            <div className="achievement-icon">💪</div>
            <div className="achievement-info">
              <h4>Kraft-Krieger</h4>
              <p>10 Kraft-Workouts absolviert</p>
            </div>
          </div>
          <div className="achievement-card">
            <div className="achievement-icon">⚡</div>
            <div className="achievement-info">
              <h4>Streak Master</h4>
              <p>30 Tage in Folge trainiert</p>
            </div>
          </div>
          <div className="achievement-card">
            <div className="achievement-icon">🎯</div>
            <div className="achievement-info">
              <h4>Ziel-Erreicher</h4>
              <p>Alle monatlichen Ziele erreicht</p>
            </div>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>🧠 Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>📈 Beste Performance</h4>
            <p>
              Deine besten Workouts finden meist <strong>am Morgen</strong>{" "}
              statt!
            </p>
          </div>
          <div className="insight-card">
            <h4>🏃‍♂️ Lieblings-Workout</h4>
            <p>
              Du bevorzugst <strong>Ganzkörper-Workouts</strong> - super für
              allgemeine Fitness!
            </p>
          </div>
          <div className="insight-card">
            <h4>📊 Fortschritt</h4>
            <p>
              Deine Ausdauer hat sich in den letzten 4 Wochen um{" "}
              <strong>15%</strong> verbessert!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistiken;
