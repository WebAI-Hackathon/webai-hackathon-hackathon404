import { useState } from "react";
import { Link } from "react-router-dom";
import "./Trainingsplan.css";

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
    },
    {
      id: "intermediate",
      name: "Fortgeschrittenen-Plan",
      duration: "6 Wochen",
      difficulty: "Mittel",
      exercises: ["Burpees", "Mountain Climbers", "Deadlifts", "Pull-ups"],
      description: "Für alle mit Grundkenntnissen",
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
    },
  ];

  return (
    <div className="trainingsplan">
      <div className="page-header">
        <h1>📋 Dein Trainingsplan</h1>
        <p>Wähle den perfekten Plan für deine Fitnessziele</p>
      </div>

      <div className="plans-container">
        <div className="plans-grid">
          {trainingsPläne.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${
                selectedPlan === plan.id ? "selected" : ""
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <span className={`difficulty ${plan.difficulty.toLowerCase()}`}>
                  {plan.difficulty}
                </span>
              </div>
              <div className="plan-info">
                <p className="duration">⏱️ {plan.duration}</p>
                <p className="description">{plan.description}</p>
              </div>
              <div className="exercises-preview">
                <h4>Übungen:</h4>
                <ul>
                  {plan.exercises.map((exercise, index) => (
                    <li key={index}>{exercise}</li>
                  ))}
                </ul>
              </div>
              <button className="select-plan-btn">
                {selectedPlan === plan.id ? "✓ Ausgewählt" : "Plan wählen"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <div className="action-section">
          <h2>Bereit zu starten?</h2>
          <div className="action-buttons">
            <Link to="/live-workout" className="start-workout-btn">
              🏃‍♂️ Workout starten
            </Link>
            <button className="customize-btn">⚙️ Plan anpassen</button>
          </div>
        </div>
      )}

      <div className="tips-section">
        <h3>💡 Trainingstipps</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>🔥 Aufwärmen</h4>
            <p>Beginne jedes Training mit 5-10 Minuten Aufwärmübungen</p>
          </div>
          <div className="tip-card">
            <h4>💧 Hydration</h4>
            <p>Trinke vor, während und nach dem Training ausreichend Wasser</p>
          </div>
          <div className="tip-card">
            <h4>😴 Erholung</h4>
            <p>Gönne deinem Körper zwischen den Trainingseinheiten Ruhe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trainingsplan;
