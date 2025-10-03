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
    {/* Routes with WebSocket */}
    <WebSocketProvider url="ws://localhost:5000">
      <Routes>

        <Route path="/" element={
            <SimStateProvider>
              <App />
            </SimStateProvider>
          }
        />

        <Route path="/Free-Flight-Mode" element={<FreeFlightMode />}/>

      </Routes>
    </WebSocketProvider>

    {/* Route without WebSocket */}
    <Routes>
      <Route path="/Real-Planes-Mode" element={<RealPlanesMode />} />
    </Routes>
  </Router>
)