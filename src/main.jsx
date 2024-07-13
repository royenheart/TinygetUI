import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App';
import Providers from './Providers';
import './translations/i18n.js'

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
