# Neo Peek Extension

A Chrome browser extension that allows quick previews of links without navigating away from the current page. A standalone solution inspired by the Peek feature of Neo Browser.

## Features
- **Peek icon**: When you hover over a link, a small floating icon appears next to the cursor.
- **Preview window**: Clicking the icon opens the linked page in a popup window using an iframe.
- **Open in new tab**: The linked page can be opened directly in a new tab from the preview window header.
- **Close**: The preview window can be closed with the header X button, the ESC key, or by clicking on the dimmed background.
- **Background scroll lock**: While the preview window is open, scrolling of the background page is disabled.
- **Smart filtering**: The extension automatically skips links where a preview is not relevant:
  - Navigation menus (e.g. Home, About, Contact)
  - Pagination bars
  - Lightbox / image gallery links

## Installation from Chrome Web Store
The extension is available in the Chrome Web Store:
https://chromewebstore.google.com/detail/neo-peek-clone/eocdllcnhkkfhfpnbmgkkiekcefjecni

## Installation (developer mode)
1. Download / copy the extension files to a permanent folder on your computer.
2. Open the browser's extensions page:
   * Chrome/Perplexity Comet: `chrome://extensions`
   * Edge: `edge://extensions`
   * Brave: `brave://extensions`
   * Opera: `opera://extensions`
   * Vivaldi: `vivaldi://extensions`
3. Enable the **Developer mode** toggle in the top-right (or left-side) corner.
4. Click the **Load unpacked** button.
5. Select the folder that contains the `manifest.json` file.

## Usage
1. Navigate to any webpage.
2. Hover over a link – after a short delay, the Peek icon will appear.
3. Click the icon to open the preview window.
4. In the preview window:
   - You can scroll the content of the loaded page.
   - The title of the loaded page is displayed on the left side of the header.
   - The buttons on the right let you open the page in a new tab or close the window.
5. The window can be closed:
   - By clicking the **X** button.
   - By pressing the **ESC** key.
   - By clicking on the dimmed background.

## File Structure
```
neo-peek-extension/
├── manifest.json       # Extension settings (Manifest V3)
├── content.js          # Core logic: icon display, filtering, peek window
├── styles.css          # Styles: icon, overlay, window, header
├── background.js       # Service worker (background processes)
├── rules.json          # Network rules (declarativeNetRequest)
└── pic/
    ├── peek.svg        # Peek trigger icon
    ├── w.svg           # "Open in new tab" button icon
    └── x.svg           # "Close" button icon
```

---

## Technical Notes
- The extension follows the **Manifest V3** standard.
- The iframe preview may fail to load on some sites due to **CORS restrictions** (X-Frame-Options header); in such cases the URL is displayed in the header instead.
