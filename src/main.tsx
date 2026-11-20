import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent right click context menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Prevent dragging images, canvas, or PDF elements out to desktop/new tab
document.addEventListener('dragstart', (e) => {
  e.preventDefault();
});

// Prevent keyboard shortcuts for DevTools, View Source, Save Page, Print Page (case-insensitive & IME-proof via e.code)
document.addEventListener(
  'keydown',
  (e) => {
    const keyLower = (e.key || '').toLowerCase();
    const code = e.code || '';
    const ctrlOrMeta = e.ctrlKey || e.metaKey;
    const devShiftOrAlt = e.shiftKey || e.altKey;

    const isF12 = e.key === 'F12' || code === 'F12';
    const isInspectorShortcut =
      ctrlOrMeta &&
      devShiftOrAlt &&
      (keyLower === 'i' ||
        keyLower === 'j' ||
        keyLower === 'c' ||
        keyLower === 'k' ||
        code === 'KeyI' ||
        code === 'KeyJ' ||
        code === 'KeyC' ||
        code === 'KeyK');
    const isViewSourceOrSaveOrPrint =
      ctrlOrMeta &&
      !e.shiftKey &&
      (keyLower === 'u' ||
        keyLower === 's' ||
        keyLower === 'p' ||
        code === 'KeyU' ||
        code === 'KeyS' ||
        code === 'KeyP');

    if (isF12 || isInspectorShortcut || isViewSourceOrSaveOrPrint) {
      e.preventDefault();
      e.stopPropagation();
    }
  },
  { capture: true }
);

// Prevent zooming via Ctrl + wheel
document.addEventListener(
  'wheel',
  (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  { passive: false }
);

// Prevent zooming via gestures
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
