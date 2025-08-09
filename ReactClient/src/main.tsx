import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WebSocketProvider } from './WebSocket/WebSocketProvider.tsx'

createRoot(document.getElementById('root')!).render(
    <WebSocketProvider url="ws://localhost:5000">
      <App />
    </WebSocketProvider>
)
