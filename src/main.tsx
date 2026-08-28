import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './cycle1.css'
import './practice.css'
import './cycle2.css'
import './workshop.css'
import './analyst.css'
import './bridge.css'
import './concrete11.css'
import './pedagogy-pass.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
