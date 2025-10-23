import { onMount, createSignal, Show } from 'solid-js';
import { AppRouter } from './routes';
import { authStore } from './stores/authStore';

function App() {
  const [isInitialized, setIsInitialized] = createSignal(false);

  onMount(async () => {
    // Initialize auth state on app start
    await authStore.initialize();
    setIsInitialized(true);
  });

  return (
    <Show 
      when={isInitialized()} 
      fallback={
        <div class="app-loading">
          <div class="loading-spinner"></div>
          <p>Loading application...</p>
        </div>
      }
    >
      <AppRouter />
    </Show>
  );
}

export default App;