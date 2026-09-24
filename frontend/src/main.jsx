import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Carlandingpage from "./Carlandingpage.jsx"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Carlandingpage />
  </StrictMode>,
)
