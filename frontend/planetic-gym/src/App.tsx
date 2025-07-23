import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";
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
      <Box minH="100vh" bg="bg">
        <Header />
        {showWelcomePopup && (
          <WelcomePopup onClose={() => setShowWelcomePopup(false)} />
        )}
        <Box as="main" pt="80px">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trainingsplan" element={<Trainingsplan />} />
            <Route path="/live-workout" element={<LiveWorkout />} />
            <Route path="/statistiken" element={<Statistiken />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
