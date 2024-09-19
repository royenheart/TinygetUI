import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App';
import Providers from './Providers';
import './translations/i18n.js';

const root = createRoot(document.getElementById('root'));
root.render(
    // React.StrictMode disabled because it will render twice
    // See: https://github.com/tauri-apps/tauri/discussions/5194
    // See also: https://react.dev/reference/react/StrictMode
    <Providers>
        <App />
    </Providers>
);
