import '@fontsource-variable/manrope/wght.css';
import '@fontsource-variable/newsreader/wght.css';
import '@fontsource-variable/newsreader/wght-italic.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const root = document.getElementById('root');

if (!root) throw new Error('Application root is missing.');

const application = <StrictMode><App /></StrictMode>;

if (root.hasChildNodes()) hydrateRoot(root, application);
else createRoot(root).render(application);
