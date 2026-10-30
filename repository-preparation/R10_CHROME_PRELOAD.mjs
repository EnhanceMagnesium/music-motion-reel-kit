// Preparation adapter: uses installed macOS Chrome for R10 default Playwright launches.
// Load with node --import /absolute/path/R10_CHROME_PRELOAD.mjs <R10 script>.
// This adapter does not invoke an upstream script or produce media.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
const root = new URL('../repository-downloads/WinterArc21/Battle-of-Austerlitz-Film/package.json', import.meta.url);
const require = createRequire(fileURLToPath(root));
const { chromium } = require('playwright');
const localChrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.existsSync(localChrome)) throw new Error('Chrome missing: ' + localChrome);
const originalLaunch = chromium.launch.bind(chromium);
chromium.launch = options => originalLaunch({ executablePath: localChrome, ...(options || {}) });
process.env.FFMPEG ||= '/opt/homebrew/bin/ffmpeg';
