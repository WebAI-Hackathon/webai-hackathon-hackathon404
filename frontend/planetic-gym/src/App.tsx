import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import Trainingsplan from "./pages/Trainingsplan";
import LiveWorkout from "./pages/LiveWorkout";
import Statistiken from "./pages/Statistiken";
import WelcomePopup from "./components/WelcomePopup";

function App() {
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);

  return (
    <Router>
      <div className="app">
        <Header />
        {showWelcomePopup && (
          <WelcomePopup onClose={() => setShowWelcomePopup(false)} />
        )}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trainingsplan" element={<Trainingsplan />} />
            <Route path="/live-workout" element={<LiveWorkout />} />
            <Route path="/statistiken" element={<Statistiken />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
