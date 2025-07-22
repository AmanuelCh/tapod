# Tapod Extension

Tapod is a lightweight browser extension that gives your new tab a minimal look. Every time you open a new tab, Tapod displays NASA's Astronomy Picture of the Day (APOD), so you get a stunning space photo and a bit of info, right from your browser.

It's built with Svelte and WXT.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AmanuelCh/tapod.git
   cd tapod
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run build
   # or
   npm run zip
   # or
   npm run zip:firefox
   ```

4. Load the extension in your browser:
   - For Chrome: Go to `chrome://extensions/`, enable "Developer mode", and click "Load unpacked". Select the zip file or `dist` directory.
   - For Firefox: Go to `about:debugging`, click "This Firefox", and click "Load Temporary Add-on". Select the zip file or `dist` directory.
