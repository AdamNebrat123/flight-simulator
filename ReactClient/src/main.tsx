import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WebSocketProvider } from './WebSocket/WebSocketProvider.tsx'
import { SimStateProvider } from './SimState/SimStateProvider.tsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RealPlanesMode from './RealPlanesMode/RealPlanesMode.tsx'

createRoot(document.getElementById('root')!).render(
    <WebSocketProvider url="ws://localhost:5000">
      <SimStateProvider>
        <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/real-planes-mode" element={<RealPlanesMode />} />
        </Routes>
      </Router>
      </SimStateProvider>
    </WebSocketProvider>
)
  