<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';

  // polyfill for browser/chrome API
  const browserApi =
    typeof browser !== 'undefined'
      ? browser
      : typeof chrome !== 'undefined'
        ? chrome
        : null;

  let apodData: any = {};
  let error: string | null = null;
  let showDesc = false;
  let showSettings = false;
  let displayMode: 'both' | 'title' | 'button' = 'both';

  onMount(async () => {
    try {
      if (!browserApi?.storage?.local) {
        error = 'Extension storage API not available.';
        return;
      }
      
      // Load display preferences
      const preferences = await browserApi.storage.local.get(['displayMode']);
      if (preferences.displayMode) {
        displayMode = preferences.displayMode;
      }
      
      const cachedData = await browserApi.storage.local.get([
        'apodData',
        'apodTimestamp',
      ]);
      const now = new Date().getTime();

      if (
        cachedData.apodData &&
        cachedData.apodTimestamp &&
        now - cachedData.apodTimestamp < 5 * 60 * 60 * 1000
      ) {
        apodData = cachedData.apodData;
      } else {
        const apiKey = import.meta.env.VITE_NASA_API_KEY;
        if (!apiKey) {
          throw new Error(
            "NASA API key not found. Make sure it's in your .env file and prefixed with VITE_."
          );
        }
        const response = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch APOD data');
        }
        const data = await response.json();
        await browserApi.storage.local.set({ apodData: data, apodTimestamp: now });
        apodData = data;
      }
    } catch (err) {
      error = (err as Error).message;
    }
  });
  
  async function updateDisplayMode(mode: 'both' | 'title' | 'button') {
    displayMode = mode;
    if (browserApi?.storage?.local) {
      await browserApi.storage.local.set({ displayMode: mode });
    }
    showSettings = false;
  }
</script>

<div
  class="apod-bg"
  style="background-image: {apodData.url ? `url('${apodData.url}')` : 'none'};"
>
  <!-- Settings Icon -->
  <button
    class="settings-icon"
    on:click={() => (showSettings = !showSettings)}
    aria-label="Settings"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m16.36-6.36l-4.24 4.24M7.88 7.88L3.64 3.64m16.72 16.72l-4.24-4.24M7.88 16.12l-4.24 4.24"/>
    </svg>
  </button>
  
  <!-- Settings Panel -->
  {#if showSettings}
    <div class="settings-panel">
      <h3 class="settings-title">Display Settings</h3>
      <div class="settings-options">
        <label class="settings-option">
          <input
            type="radio"
            name="displayMode"
            value="both"
            checked={displayMode === 'both'}
            on:change={() => updateDisplayMode('both')}
          />
          <span>Show both title and button</span>
        </label>
        <label class="settings-option">
          <input
            type="radio"
            name="displayMode"
            value="title"
            checked={displayMode === 'title'}
            on:change={() => updateDisplayMode('title')}
          />
          <span>Show title only</span>
        </label>
        <label class="settings-option">
          <input
            type="radio"
            name="displayMode"
            value="button"
            checked={displayMode === 'button'}
            on:change={() => updateDisplayMode('button')}
          />
          <span>Show button only</span>
        </label>
      </div>
      <button class="settings-close" on:click={() => (showSettings = false)}>Close</button>
    </div>
  {/if}
  
  {#if error}
    <div class="overlay error">{error}</div>
  {:else if apodData.url}
    <div class="main-content">
      {#if displayMode === 'both' || displayMode === 'title'}
        <div class="title-container">
          <h1 class="apod-title">{apodData.title}</h1>
        </div>
      {/if}
      {#if displayMode === 'both' || displayMode === 'button'}
        <div class="controls">
          <button
            class="toggle-button"
            on:click={() => (showDesc = !showDesc)}
            aria-expanded={showDesc}
            aria-controls="description-container"
          >
            {showDesc ? 'Hide' : 'Show'} Details
          </button>
        </div>
      {/if}
    </div>
    <div class="description-container {showDesc ? 'visible' : ''}">
      <button 
        class="desc-close-btn"
        on:click={() => (showDesc = false)}
        aria-label="Close description"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 5L5 15M5 5l10 10"/>
        </svg>
      </button>
      <h2 class="desc-title">{apodData.title}</h2>
      <p class="desc-text">{apodData.explanation}</p>
      {#if apodData.copyright}
        <p class="desc-copyright">© {apodData.copyright}</p>
      {/if}
    </div>
  {:else}
    <div class="overlay loading">Loading...</div>
  {/if}
</div>
