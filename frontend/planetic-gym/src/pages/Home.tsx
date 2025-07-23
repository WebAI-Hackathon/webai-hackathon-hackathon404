import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Willkommen bei Planetic Gym</h1>
          <p>
            Deine persönliche Fitness-Plattform für optimale Trainingsergebnisse
          </p>
          <div className="hero-buttons">
            <Link to="/trainingsplan" className="cta-button primary">
              Trainingsplan starten
            </Link>
            <Link to="/live-workout" className="cta-button secondary">
              Live Workout
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <h2>Warum Planetic Gym?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Personalisierte Trainingspläne</h3>
              <p>
                Individuelle Pläne, die sich an deine Ziele und dein
                Fitnesslevel anpassen
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏃‍♂️</div>
              <h3>Live Workouts</h3>
              <p>
                Trainiere in Echtzeit mit unserer interaktiven Workout-Führung
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Detaillierte Statistiken</h3>
              <p>
                Verfolge deinen Fortschritt und erkenne deine Verbesserungen
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-stats">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Workouts absolviert</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5.2kg</span>
            <span className="stat-label">Gewicht verloren</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">28</span>
            <span className="stat-label">Trainingstage</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
