import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WebSocketProvider } from './WebSocket/WebSocketProvider.tsx'
import { SimStateProvider } from './SimState/SimStateProvider.tsx'

createRoot(document.getElementById('root')!).render(
    <WebSocketProvider url="ws://localhost:5000">
      <SimStateProvider>
      <App />
      </SimStateProvider>
    </WebSocketProvider>
)
