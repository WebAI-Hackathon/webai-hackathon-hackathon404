import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  HashRouter,
} from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Header from "./components/Header";
import LoadingAnimation from "./components/LoadingAnimation";
import Home from "./pages/Home";
import Trainingsplan from "./pages/Trainingsplan";
import LiveWorkout from "./pages/LiveWorkout";
import Statistiken from "./pages/Statistiken";
// ...existing code...

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuliere ein globales Laden, z.B. beim Initialisieren
    const timer = setTimeout(() => setLoading(false), 2000); // 2 Sekunden
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <HashRouter>
      <Box minH="100vh" bg="bg">
        <Header />
        {/* WelcomePopup entfernt */}
        <Box as="main" pt="80px">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trainingsplan" element={<Trainingsplan />} />
            <Route path="/live-workout" element={<LiveWorkout />} />
            <Route path="/statistiken" element={<Statistiken />} />
          </Routes>
        </Box>
      </Box>
    </HashRouter>
  );
}

export default App;
