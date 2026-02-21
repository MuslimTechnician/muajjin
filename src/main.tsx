import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';
import { TranslationProvider } from './contexts/TranslationContext';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider
    defaultTheme="system"
    storageKey="muajjin-theme"
    attribute="class">
    <TranslationProvider>
      <App />
    </TranslationProvider>
  </ThemeProvider>,
);
