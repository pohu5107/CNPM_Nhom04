import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Schedule from './components/Schedule_Assignment';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Schedule />
  </StrictMode>,
)
