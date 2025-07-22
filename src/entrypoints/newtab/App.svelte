<script lang="ts">
  import { onMount } from 'svelte';

  // Polyfill for browser/chrome API
  const browserApi =
    typeof browser !== 'undefined'
      ? browser
      : typeof chrome !== 'undefined'
        ? chrome
        : null;

  let apodData: any = {};
  let error: string | null = null;
  let showDesc = false;

  onMount(async () => {
    try {
      if (!browserApi?.storage?.local) {
        error = 'Extension storage API not available.';
        return;
      }
      const cachedData = await browserApi.storage.local.get([
        'apodData',
        'apodTimestamp',
      ]);
      const now = new Date().getTime();

      if (
        cachedData.apodData &&
        cachedData.apodTimestamp &&
        now - cachedData.apodTimestamp < 3 * 60 * 60 * 1000
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
        await browser.storage.local.set({ apodData: data, apodTimestamp: now });
        apodData = data;
      }
    } catch (err) {
      error = (err as Error).message;
    }
  });
</script>

<div
  class="apod-bg"
  style="background-image: {apodData.url ? `url('${apodData.url}')` : 'none'};"
>
  {#if error}
    <div class="overlay error">{error}</div>
  {:else if apodData.url}
    <div class="bottom-gradient">
      <h1 class="apod-title">{apodData.title}</h1>
      <button
        class="desc-toggle"
        on:click={() => (showDesc = !showDesc)}
        aria-expanded={showDesc}
        aria-controls="desc-overlay"
      >
        {showDesc ? 'Hide Description' : 'Show Description'}
      </button>
    </div>
    {#if showDesc}
      <div
        class="desc-overlay"
        id="desc-overlay"
      >
        <h2 class="desc-title">{apodData.title}</h2>
        <p class="desc-text">{apodData.explanation}</p>
        {#if apodData.copyright}
          <p class="desc-copyright">© {apodData.copyright}</p>
        {/if}
      </div>
    {/if}
  {:else}
    <div class="overlay loading">Loading...</div>
  {/if}
</div>

<style>
  :global(html),
  :global(body) {
    height: 100%;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      sans-serif;
    background: #000;
    overflow: hidden;
  }

  .apod-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: hidden;
  }

  /* Bottom gradient overlay */
  .bottom-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.6) 30%,
      rgba(0, 0, 0, 0.3) 60%,
      rgba(0, 0, 0, 0) 100%
    );
    padding: 80px 40px 40px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  .apod-title {
    color: #fff;
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 20px 0;
    line-height: 1.2;
    max-width: 70%;
  }

  .desc-toggle {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #fff;
    font-size: 1rem;
    font-weight: 500;
    padding: 12px 28px;
    border-radius: 30px;
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
  }

  .desc-toggle:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  }

  /* Description overlay */
  .desc-overlay {
    position: absolute;
    bottom: 40px;
    left: 40px;
    right: 40px;
    max-width: 600px;
    background: rgba(20, 20, 20, 0.9);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease-out;
    z-index: 20;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .desc-title {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 15px 0;
    line-height: 1.3;
  }

  .desc-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.05rem;
    line-height: 1.6;
    margin: 0 0 15px 0;
    max-height: 200px;
    overflow-y: auto;
  }

  .desc-copyright {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    margin: 15px 0 0 0;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Scrollbar */
  .desc-text::-webkit-scrollbar {
    width: 4px;
  }

  .desc-text::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }

  /* Loading and error states */
  .overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .overlay.loading {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.2rem;
  }

  .overlay.error {
    background: rgba(30, 30, 30, 0.9);
    backdrop-filter: blur(10px);
    color: #ff6b6b;
    padding: 30px;
    border-radius: 12px;
    font-size: 1.1rem;
    max-width: 500px;
    border: 1px solid rgba(255, 107, 107, 0.3);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .bottom-gradient {
      padding: 60px 20px 30px;
    }

    .apod-title {
      font-size: 1.8rem;
      max-width: 90%;
    }

    .desc-toggle {
      font-size: 0.9rem;
      padding: 10px 20px;
    }

    .desc-overlay {
      bottom: 20px;
      left: 20px;
      right: 20px;
      padding: 20px;
    }

    .desc-title {
      font-size: 1.25rem;
    }

    .desc-text {
      font-size: 0.95rem;
    }
  }
</style>
