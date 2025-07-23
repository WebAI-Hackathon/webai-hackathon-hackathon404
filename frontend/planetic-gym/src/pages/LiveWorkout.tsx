import { useState, useEffect } from "react";
import "./LiveWorkout.css";

const LiveWorkout = () => {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timer, setTimer] = useState(0);
  const [sets, setSets] = useState(0);

  const exercises = [
    { name: "Jumping Jacks", duration: 30, rest: 10 },
    { name: "Push-ups", duration: 45, rest: 15 },
    { name: "Squats", duration: 40, rest: 10 },
    { name: "Plank", duration: 60, rest: 20 },
    { name: "Burpees", duration: 30, rest: 15 },
  ];

  useEffect(() => {
    let interval: number;
    if (isWorkoutActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (isWorkoutActive && timer === 0) {
      // Move to next exercise or finish workout
      if (currentExercise < exercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
        setTimer(exercises[currentExercise + 1].duration);
      } else {
        setIsWorkoutActive(false);
        setSets(sets + 1);
        setCurrentExercise(0);
      }
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, timer, currentExercise, exercises, sets]);

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setTimer(exercises[0].duration);
    setCurrentExercise(0);
  };

  const pauseWorkout = () => {
    setIsWorkoutActive(false);
  };

  const stopWorkout = () => {
    setIsWorkoutActive(false);
    setTimer(0);
    setCurrentExercise(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="live-workout">
      <div className="workout-header">
        <h1>🏃‍♂️ Live Workout</h1>
        <p>Folge dem Timer und gib dein Bestes!</p>
      </div>

      <div className="workout-container">
        <div className="workout-display">
          <div className="current-exercise">
            <h2>{exercises[currentExercise]?.name || "Bereit?"}</h2>
            <div className="exercise-number">
              {currentExercise + 1} / {exercises.length}
            </div>
          </div>

          <div className="timer-display">
            <div
              className={`timer ${
                timer <= 10 && isWorkoutActive ? "warning" : ""
              }`}
            >
              {formatTime(timer)}
            </div>
            <div className="timer-label">
              {isWorkoutActive ? "Verbleibende Zeit" : "Bereit zum Start"}
            </div>
          </div>

          <div className="workout-controls">
            {!isWorkoutActive ? (
              <button className="start-btn" onClick={startWorkout}>
                ▶️ Workout starten
              </button>
            ) : (
              <div className="control-buttons">
                <button className="pause-btn" onClick={pauseWorkout}>
                  ⏸️ Pause
                </button>
                <button className="stop-btn" onClick={stopWorkout}>
                  ⏹️ Stop
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="workout-progress">
          <h3>Workout Fortschritt</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(currentExercise / exercises.length) * 100}%`,
              }}
            ></div>
          </div>
          <div className="sets-counter">
            <span>Absolvierte Sets: {sets}</span>
          </div>
        </div>

        <div className="exercises-list">
          <h3>Heutige Übungen</h3>
          <div className="exercises-grid">
            {exercises.map((exercise, index) => (
              <div
                key={index}
                className={`exercise-card ${
                  index === currentExercise ? "active" : ""
                } ${index < currentExercise ? "completed" : ""}`}
              >
                <div className="exercise-info">
                  <span className="exercise-name">{exercise.name}</span>
                  <span className="exercise-duration">
                    {exercise.duration}s
                  </span>
                </div>
                <div className="exercise-status">
                  {index < currentExercise
                    ? "✅"
                    : index === currentExercise
                    ? "🔥"
                    : "⏳"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="workout-stats">
          <div className="stat-card">
            <div className="stat-value">💪</div>
            <div className="stat-label">Energie Level</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">🔥</div>
            <div className="stat-label">Kalorien</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">⏱️</div>
            <div className="stat-label">Zeit aktiv</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveWorkout;
