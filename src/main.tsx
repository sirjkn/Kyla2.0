import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against environment runtime attempting to override getter-only window.fetch
try {
  const nativeFetch = window.fetch;
  if (nativeFetch) {
    Object.defineProperty(window, 'fetch', {
      get() {
        return nativeFetch;
      },
      set(_fn) {
        // Safe no-op if third party attempts to set window.fetch
      },
      configurable: true,
      enumerable: true,
    });
  }
} catch (e) {
  // Ignore property descriptor errors in restricted frames
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

