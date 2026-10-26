#!/usr/bin/env node
/**
 * Reproducible browser UI checks against an already-running LOCAL server.
 *
 * Example (from the project directory):
 *   PORT=8768 npm start
 *   node tests/browser-runner.mjs http://127.0.0.1:8768
 *   node tests/browser-runner.mjs http://127.0.0.1:8768 --headed
 *
 * Requires the optional development package `playwright` and its Chromium:
 *   npm install --no-save playwright
 *   npx playwright install chromium
 *
 * This runner uses a NEW isolated browser context. It cannot access your normal
 * browser's saved kitchen. The shared checks intentionally reset their test
 * origin through Settings and leave it empty after success. Do not run the
 * shared checks in a browser tab whose kitchen you want to keep. No external
 * recipe services, messages, purchases, or downloads are exercised.
 *
 * Agents using the Codex Browser should import browser-checks.mjs there instead
 * of launching this runner; both interfaces execute exactly the same checks.
 */
import {runRecipeBrowserChecks} from './browser-checks.mjs';

const args = process.argv.slice(2);
const address = args.find(arg => !arg.startsWith('--')) || 'http://127.0.0.1:8768';
const url = new URL(address);
if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !['http:', 'https:'].includes(url.protocol)) {
  throw new Error('Only an already-running disposable localhost server is allowed.');
}

let chromium;
try {
  ({chromium} = await import('playwright'));
} catch {
  throw new Error('Optional browser-test dependency missing. Install playwright and its Chromium as described at the top of tests/browser-runner.mjs.');
}

const browser = await chromium.launch({headless: !args.includes('--headed')});
const context = await browser.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
const page = await context.newPage();
const runtimeErrors = [];
page.on('pageerror', error => runtimeErrors.push(error.message));

// This small adapter exposes the same surface used by a Codex Browser Tab.
const tab = {
  playwright: {
    locator: selector => page.locator(selector),
    getByRole: (role, options) => page.getByRole(role, options),
    evaluate: expression => page.evaluate(expression),
    domSnapshot: () => page.locator('body').innerText()
  },
  reload: () => page.reload({waitUntil: 'domcontentloaded'})
};

try {
  await page.goto(url.href, {waitUntil: 'domcontentloaded'});
  await page.locator('#result-count strong').waitFor();
  const report = await runRecipeBrowserChecks(tab);
  if (runtimeErrors.length) throw new Error(`Browser runtime errors: ${runtimeErrors.join('; ')}`);
  console.log(JSON.stringify({...report, runtimeErrors}, null, 2));
} catch (error) {
  console.error(error.message);
  if (error.browserReport) console.error(JSON.stringify(error.browserReport, null, 2));
  if (runtimeErrors.length) console.error(JSON.stringify({runtimeErrors}, null, 2));
  process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
