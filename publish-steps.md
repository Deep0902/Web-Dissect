Based on an analysis of your project (**Web Dissect**), here is a complete, step-by-step guide to publishing this extension on the Chrome Web Store.

---

### 1. Project Analysis & Pre-Submission Clean-Up

Before submitting to the Chrome Web Store, you should clean up a few boilerplate/placeholder items that could trigger **rejection** during Google's review process:

#### A. Remove or Finish Placeholder Code
1. **Dummy Context Menus in `src/background/index.ts`**:
   - It currently registers `"some-id-page"` and `"some-id-selection"` titled `"New Menu Option - Page"`.
   - Chrome reviewers will test context menus. If they are placeholders, your extension may be rejected under the **Unused Permissions Policy** (for requesting `"contextMenus"`).
   - **Action**: Either implement the real accessibility scanning feature in the context menu, or remove the context menu code from `src/background/index.ts` and remove `"contextMenus"` from `"permissions"` in `public/manifest.json`.
2. **Placeholder Content Script in `src/content/index.ts`**:
   - It appends a red `<h1>Hello from the Content Script!!!</h1>` exclusively on `https://www.handmadesoftware.dev/`.
   - **Action**: If this was only for testing, remove the `content_scripts` section from `public/manifest.json` and the `content` entry from `rollupOptions.input` in `vite.config.ts`.
3. **Debug Logs**:
   - In `src/background/index.ts`, remove the `// DEBUG ONLY: print logs forwarded from the side panel` message listener before production.
4. **Axe-core Bundling**:
   - Your setup injects `public/axe.min.js` locally via `chrome.scripting.executeScript`. This is **compliant with Manifest V3** (Google prohibits downloading remote code at runtime, but packaging `axe.min.js` inside the extension is the recommended approach).
   - Ensure `scripts/copy-axe.mjs` is kept up to date or added as a `prebuild` step in `package.json`:
     ```json
     "prebuild": "node scripts/copy-axe.mjs",
     "build": "tsc -b && vite build"
     ```

#### B. Review Icons and Branding
- In `public/manifest.json`, `icon.png` is currently mapped to `16`, `48`, `96`, and `128`.
- Ensure `icon.png` is sharp and square (at least 128x128 px). It is best practice to provide dedicated, pre-scaled icons (16x16, 48x48, 128x128).

---

### 2. Developer Account Setup

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with your Google account (recommended: use a dedicated developer or company account).
3. Pay the **one-time $5 USD registration fee**.
4. Enable **Two-Step Verification (2FA)** on your Google account (mandatory for publishing extensions).
5. Complete your developer profile (developer name, contact email, and address if offering paid products).

---

### 3. Build & Package the Extension

The Chrome Web Store accepts a `.zip` archive where `manifest.json` is in the **root** of the archive (not nested inside a folder).

#### Step 1: Run the Production Build
In your terminal, run:
```powershell
npm run build
```
This compiles TypeScript and builds your assets into the `dist/` directory.

#### Step 2: Create the ZIP Archive
Create a zip containing the **contents** of `dist/`:

```powershell
Compress-Archive -Path dist\* -DestinationPath web-dissect-v1.0.0.zip -Force
```

> **Important**: When you open `web-dissect-v1.0.0.zip`, `manifest.json`, `index.html`, `background.js`, `assets/`, and `icon.png` should be directly at the top level.

---

### 4. Prepare Store Listing Media & Content

Before opening the submission form, prepare the following promotional assets:

| Asset | Specifications | Notes |
|---|---|---|
| **Store Icon** | 128 x 128 px PNG | High-resolution version of your extension icon. |
| **Screenshots** | 1280 x 800 px or 640 x 400 px (1 to 5 images) | Capture the side panel, popup, scan results table, and light/dark mode in action. |
| **Small Promo Tile** (Optional) | 440 x 280 px PNG/JPEG | Displayed if featured on category pages. |
| **Marquee Promo Tile** (Optional) | 1400 x 560 px PNG/JPEG | Used if selected for the Web Store homepage carousel. |

---

### 5. Create the Listing in Developer Dashboard

1. In the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole), click **Add new item**.
2. Drag and drop your `web-dissect-v1.0.0.zip` file.
3. Fill in the **Store Listing** fields:
   - **Product Details**:
     - **Title**: `Web Dissect — Accessibility Scanner` (matches `manifest.json`).
     - **Summary**: Concise explanation under 132 characters (e.g. *Scan any webpage for accessibility (a11y) issues with axe-core. Detect WCAG violations with instant audit reports.*).
     - **Detailed Description**: Outline features (e.g., WCAG 2.x audit rules via axe-core, side panel inspection, light/dark themes, one-click export/copy of violation data).
     - **Category**: Select `Developer Tools` or `Productivity`.
     - **Language**: English (or your target locale).
   - **Graphic Assets**:
     - Upload your 128x128 icon and screenshots.

---

### 6. Fill Out the Privacy Practices Tab (Critical for Approval)

Google conducts strict checks on the **Privacy** tab, especially when extensions request `host_permissions` (`http://*/*`, `https://*/*`):

1. **Single Purpose**:
   - Enter a clear statement:
     > *"Web Dissect serves a single purpose: auditing the accessibility (a11y) of web pages using axe-core to identify WCAG violations and help developers improve web accessibility."*
2. **Permission Justifications**:
   Chrome asks you to justify each permission requested in `manifest.json`:
   - **`scripting`**: *"Used to inject the axe-core accessibility engine (axe.min.js) and initiate the local DOM audit on the page the user chooses to inspect."*
   - **`tabs`**: *"Used to read the current tab's URL and title to display in the audit header and associate scan results with the active page."*
   - **`sidePanel`**: *"Provides the primary user interface to view detailed WCAG violation trees and code snippets alongside the audited webpage."*
   - **`storage`**: *"Used to preserve scan results per tab across panel close/re-open cycles and save the user's preferred theme (light/dark)."*
   - **`commands`**: *"Provides optional keyboard shortcuts (`Ctrl+B` and `Ctrl+Shift+L`) for quick access to the scanner."*
   - **`host_permissions` (`*://*/*`)**: *"Required so users can run accessibility scans on any arbitrary public or local web page they are developing or inspecting."*
3. **Data Usage Declarations**:
   - Mark **"No"** for collecting personally identifiable information, authentication credentials, or financial data.
   - Clarify that all accessibility parsing is performed **100% locally in the browser's DOM** via `axe-core` and no webpage data or audit results are transmitted to external servers.
4. **Privacy Policy**:
   - Because you request `host_permissions` and `tabs`, a **public Privacy Policy URL is mandatory**. You can host a simple markdown/HTML page on GitHub Pages, Vercel, or your domain (e.g., `https://www.handmadesoftware.dev/privacy`).

---

### 7. Submit for Review & Post-Launch Maintenance

1. Click **Submit for Review**.
2. **Review Duration**:
   - Reviews typically take **1 to 3 business days** (extensions with broad host permissions like `http://*/*` may occasionally take up to 5–7 days).
3. **Releases & Updates**:
   - Whenever you make changes:
     1. Increment `"version"` in both `package.json` and `public/manifest.json` (e.g., `1.0.1`).
     2. Rebuild (`npm run build`).
     3. Re-zip `dist/`.
     4. In the Developer Dashboard, click **Package** > **Upload new package** and submit.

---

Web Dissect is a powerful, lightweight Chrome extension built for developers, QA engineers, and accessibility advocates to audit web pages for automatically detectable accessibility issues. Powered by the industry-standard **axe-core** engine, Web Dissect helps you catch WCAG compliance gaps directly from your browser.

### Key Features
* **Instant Page Audits:** Run a full accessibility scan on any active web page with a single click.
* **Axe-Core Integration:** Leverages the robust open-source axe-core library to identify violations, passed rules, and incomplete checks.
* **Impact Breakdown:** Violations are clearly categorized by impact level—**Critical, Serious, Moderate, and Minor**—complete with rule names and affected element counts.
* **Export Reports:** Easily download complete scan data as a `results.json` report for documentation and tracking.
* **Theme Support:** Switch seamlessly between light and dark themes for comfortable auditing.
* **Privacy-First:** All scans run locally in your browser tab. No data or scan results are ever sent to an external server.

### How to Use
1. Open the webpage you want to audit.
2. Click the **Web Dissect** icon in your Chrome toolbar.
3. Select **Scan Page** to execute the audit.
4. Review violations, examine element counts, and download your report.

Whether you are optimizing a React, Vue, or static web app, Web Dissect streamlines your workflow for building accessible web experiences.