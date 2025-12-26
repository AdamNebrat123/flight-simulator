import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WebSocketProvider } from './WebSocket/WebSocketProvider.tsx'
import { SimStateProvider } from './SimState/SimStateProvider.tsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RealPlanesMode from './RealPlanesMode/RealPlanesMode.tsx'
import FreeFlightMode from './FreeFlightMode/FreeFlightMode.tsx'
import DroneGame from './DroneGame/DroneGame.tsx'
import { ModeEnum } from './WebSocket/ModeEnum.ts'

createRoot(document.getElementById('root')!).render(
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <WebSocketProvider clientMode={ModeEnum.ScenarioSimulator}>
              <SimStateProvider>
                <App />
              </SimStateProvider>
            </WebSocketProvider>
          }
        />

        <Route
          path="/Free-Flight-Mode"
          element={
            <WebSocketProvider clientMode={ModeEnum.FreeFlight}>
              <FreeFlightMode />
            </WebSocketProvider>
          }
        />

        <Route
          path="/Drone-Game"
          element={
            <WebSocketProvider clientMode={ModeEnum.DroneGame}>
              <DroneGame />
            </WebSocketProvider>
          }
        />

        <Route path="/Real-Planes-Mode" element={<RealPlanesMode />} />
      </Routes>
    </Router>
)