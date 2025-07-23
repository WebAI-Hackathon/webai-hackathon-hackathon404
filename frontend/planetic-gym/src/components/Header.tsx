import { Link, useLocation } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>💪 Planetic Gym</h1>
          </Link>
        </div>
        <nav className="nav">
          <Link
            to="/trainingsplan"
            className={`nav-button ${
              location.pathname === "/trainingsplan" ? "active" : ""
            }`}
          >
            📋 Trainingsplan
          </Link>
          <Link
            to="/live-workout"
            className={`nav-button ${
              location.pathname === "/live-workout" ? "active" : ""
            }`}
          >
            🏃‍♂️ Live Workout
          </Link>
          <Link
            to="/statistiken"
            className={`nav-button ${
              location.pathname === "/statistiken" ? "active" : ""
            }`}
          >
            📊 Statistiken
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
