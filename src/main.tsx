// =============================================================================
// src/main.tsx — NusaFuel Grid
// Application entry point — wraps the tree with the global reactive StoreProvider
// =============================================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { StoreProvider } from './app/store.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
