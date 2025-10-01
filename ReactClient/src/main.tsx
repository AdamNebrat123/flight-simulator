import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WebSocketProvider } from './WebSocket/WebSocketProvider.tsx'
import { SimStateProvider } from './SimState/SimStateProvider.tsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RealPlanesMode from './RealPlanesMode/RealPlanesMode.tsx'
import FreeFlightMode from './FreeFlightMode/FreeFlightMode.tsx'

createRoot(document.getElementById('root')!).render(
  <Router>
      <Routes>
          <Route
            path="/"
            element={
              <WebSocketProvider url="ws://localhost:5000">
                <SimStateProvider>
                  <App />
                </SimStateProvider>
              </WebSocketProvider>
            }
          />FreeFlightMode
          <Route path="/Real-Planes-Mode" element={<RealPlanesMode />} />
          <Route path="/Free-Flight-Mode" element={<FreeFlightMode />} />
      </Routes>
  </Router>
)
  