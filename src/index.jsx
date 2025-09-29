import { render } from 'solid-js/web';
import App from './App';
import './index.css';
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  sendDefaultPii: true,
  integrations: [
    Sentry.replayIntegration({
        maskAllText: import.meta.env.VITE_SENTRY_MASK_ALL_TEXT,
        blockAllMedia: import.meta.env.VITE_SENTRY_BLOCK_ALL_MEDIA,
    })
  ],
  // Session Replay
  replaysSessionSampleRate: import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE, 
  replaysOnErrorSampleRate: import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE 
});

const root = document.getElementById('root');
render(() => <App />, root);