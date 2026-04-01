import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import 'leaflet/dist/leaflet.css';
import './index.css';
import './i18n';

import App from './App.tsx';
import MaintenanceError from './features/Errors/MaintenanceError.tsx';
import NetworkStatusBadge from './components/NetworkStatusBadge';

// Suppress unhandled rejection errors from browser extensions
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Could not establish connection')) {
    event.preventDefault();
  }
});

// Disable inspect element in production
// if (import.meta.env.PROD) {
//   document.addEventListener('contextmenu', (e) => e.preventDefault());

//   document.addEventListener('keydown', (e) => {
//     if (
//       e.key === 'F12' ||
//       (e.ctrlKey && e.shiftKey && e.key === 'I') ||
//       (e.ctrlKey && e.shiftKey && e.key === 'J') ||
//       (e.ctrlKey && e.shiftKey && e.key === 'C') ||
//       (e.ctrlKey && e.key === 'U')
//     ) {
//       e.preventDefault();
//     }
//   });
// }

/**
 * Detect network-ish errors so we don't replace the whole app UI when offline.
 * We only show MaintenanceError for "real" crashes.
 */
function isNetworkError(error: any): boolean {
  const msg = String(error?.message ?? '').toLowerCase();

  return (
    !navigator.onLine ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('load failed') ||
    msg.includes('fetch') ||
    // axios patterns
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error'
  );
}

function ErrorFallback({ error }: { error: any }) {
  // IMPORTANT: keep the UI, no dialogs / no takeover
  if (isNetworkError(error)) {
    return null;
  }

  return <MaintenanceError />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Non-blocking offline indicator (no dialog, no page takeover) */}
    <NetworkStatusBadge />

    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.replace('/')}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>
);
