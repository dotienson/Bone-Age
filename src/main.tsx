import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent right click
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Prevent keyboard shortcuts for dev tools
document.addEventListener('keydown', (e) => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
    (e.ctrlKey && e.shiftKey && e.key === 'J') ||
    (e.ctrlKey && e.key === 'U') ||
    (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'I')) || // Mac OS
    (e.metaKey && e.altKey && (e.key === 'j' || e.key === 'J')) || // Mac OS
    (e.metaKey && (e.key === 'u' || e.key === 'U')) // Mac OS
  ) {
    e.preventDefault();
  }
});

// Prevent zooming via Ctrl + wheel
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent zooming via gestures
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
