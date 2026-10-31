/**
 * UI regression checks shared by the Codex Browser and Playwright runner.
 *
 * WARNING: run only on a disposable localhost origin. This suite clears that
 * origin's kitchen through Settings, creates pantry items, a saved recipe,
 * a planned meal and timers, then clears it again on success. Existing browser
 * data is not backed up or restored. It does not send messages, open external
 * links, make purchases or contact recipe services.
 *
 * All app interaction uses visible controls. evaluate() only reads the DOM;
 * neither app globals nor browser storage are inspected or changed directly.
 * Each action is followed by domSnapshot() before assertions.
 *
 * Codex Browser usage, after obtaining a disposable localhost tab:
 *   const {runRecipeBrowserChecks} = await import('/absolute/path/tests/browser-checks.mjs');
 *   const report = await runRecipeBrowserChecks(tab);
 */
import assert from 'node:assert/strict';

const recipeId = 'lemon-chickpea-couscous';
const recipeName = 'Lemon chickpea couscous';

export async function runRecipeBrowserChecks(tab) {
  assert.ok(tab?.playwright?.domSnapshot && tab?.reload, 'A Browser Tab or the provided Playwright adapter is required.');
  const p = tab.playwright;
  const report = {passed: 0, checks: [], snapshots: 0};
  let lastSnapshot = '';
  let lastAction = 'initial snapshot';
  const snapshot = async () => {
    lastSnapshot = await p.domSnapshot();
    report.snapshots++;
  };
  const act = async (description, action) => {
    lastAction = description;
    await action();
    await snapshot();
  };
  const click = selector => act(`click ${selector}`, () => p.locator(selector).click());
  const fill = (selector, value) => act(`fill ${selector} with ${JSON.stringify(value)}`, () => p.locator(selector).fill(value));
  // Browser adapters may return arrays with another realm's prototypes.
  // Normalize the read-only DOM result before using Node's strict assertions.
  const read = async () => JSON.parse(JSON.stringify(await p.evaluate(() => {
    const one = selector => document.querySelector(selector);
    const all = selector => Array.from(document.querySelectorAll(selector));
    const text = selector => one(selector)?.textContent?.trim() || '';
    const active = document.activeElement;
    return {
      url: document.URL,
      count: Number(text('#result-count strong')),
      pantryCount: Number(text('#pantry-count')),
      pantry: all('#pantry-tags [data-ingredient]').map(el => el.dataset.ingredient),
      confirmation: !!one('#ingredient-confirmation') && !one('#ingredient-confirmation').hidden,
      confirmationText: text('#ingredient-confirmation'),
      customChoice: !!one('[data-custom-ingredient]'),
      suggestionsHidden: !one('#ingredient-suggestions') || one('#ingredient-suggestions').hidden,
      confirmationHitTargets: all('#ingredient-confirmation button').map(button => {
        const rect = button.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return {label: button.textContent.trim(), unobstructed: hit === button || button.contains(hit)};
      }),
      cards: all('#recipe-grid [data-recipe]').map(el => el.dataset.recipe),
      pageStatus: text('#page-status'),
      nextDisabled: !!one('#next-page')?.disabled,
      previousDisabled: !!one('#previous-page')?.disabled,
      query: one('#recipe-query')?.value,
      focus: {id: active?.id || '', classes: active?.className || '', servings: active?.getAttribute('data-servings')},
      savedCount: Number(text('#saved-count')),
      savedMatchesOnly: !!one('#saved-match-only')?.checked,
      recipeOpen: !!one('#recipe-dialog')?.open,
      recipeTitle: text('#recipe-title'),
      servings: Number(text('.serving-control strong')),
      amounts: all('.ingredient-list .ingredient-copy').map(el => ({
        amount: el.querySelector('.ingredient-amount')?.textContent?.trim(),
        unit: el.querySelector('.ingredient-unit')?.textContent?.trim(),
        ingredient: el.querySelector('.ingredient-name')?.textContent?.trim(),
        note: el.querySelector('.note')?.textContent?.trim() || '',
        amountNodes: el.querySelectorAll('.ingredient-amount').length,
        unitNodes: el.querySelectorAll('.ingredient-unit').length,
        nameNodes: el.querySelectorAll('.ingredient-name').length
      })),
      planned: all('.planned-meal').map(el => ({
        id: el.querySelector('[data-recipe]')?.dataset.recipe,
        key: el.querySelector('[data-plan-key]')?.dataset.planKey,
        day: el.closest('.day-card')?.querySelector('h3')?.textContent?.trim(),
        meta: el.querySelector('.planned-meta span')?.textContent?.trim()
      })),
      planSummary: text('#plan-summary'),
      planDay: one('#plan-day')?.value,
      planConfirm: text('[data-confirm-plan]'),
      cookText: text('.cook-step'),
      cookHeading: text('.cook-top p'),
      cookServingHint: text('.cook-mode > .input-hint'),
      previousStepDisabled: !!one('[data-cook-prev]')?.disabled,
      timerVisible: !!one('#timer-dock') && !one('#timer-dock').hidden,
      timerDisplay: text('#timer-display'),
      timerContext: text('#timer-context'),
      timerToggle: text('#timer-toggle'),
      replaceVisible: !!one('#timer-replace') && !one('#timer-replace').hidden
    };
  })));
  const check = async (name, fn) => {
    const start = Date.now();
    try {
      await fn();
      report.checks.push({name, status: 'passed', durationMs: Date.now() - start});
      report.passed++;
    } catch (cause) {
      report.checks.push({name, status: 'failed', durationMs: Date.now() - start});
      const error = new Error(`${name}: ${cause.message}\nLast UI action: ${lastAction}`, {cause});
      error.browserReport = report;
      error.lastSnapshot = lastSnapshot;
      throw error;
    }
  };
  const reset = async () => {
    const current = await read();
    if (current.recipeOpen) await click('[data-close-recipe]');
    await click('#settings-button');
    await click('#reset-kitchen');
    await click('#confirm-reset');
  };
  const addPantry = async value => {
    await fill('#pantry-input', value);
    await click('#pantry-form button[type="submit"]');
  };

  await snapshot();
  const url = new URL((await read()).url);
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && ['http:', 'https:'].includes(url.protocol),
    'This destructive UI suite only runs on a disposable localhost origin.');
  report.origin = url.origin;

  await check('Fresh kitchen shows the complete 190-recipe collection', async () => {
    await reset();
    const ui = await read();
    assert.equal(ui.count, 190);
    assert.equal(ui.pantryCount, 0);
    assert.equal(ui.savedCount, 0);
    assert.equal(ui.planned.length, 0);
    assert.equal(ui.timerVisible, false);
    assert.ok(ui.cards.length > 0 && ui.cards.length < 190, 'The view uses bounded pagination.');
  });

  await check('Pagination changes cards and returns to the first page', async () => {
    const first = await read();
    assert.match(first.pageStatus, /Page 1 of /);
    assert.equal(first.previousDisabled, true);
    assert.equal(first.nextDisabled, false);
    await click('#next-page');
    const next = await read();
    assert.match(next.pageStatus, /Page 2 of /);
    assert.equal(next.count, 190);
    assert.ok(next.cards.length > 0);
    assert.ok(next.cards.every(id => !first.cards.includes(id)), 'Page two has different cards.');
    await click('#previous-page');
    assert.deepEqual((await read()).cards, first.cards);
  });

  await check('Choosing how many recipes to show changes the page and is remembered after reload', async () => {
    const choice = () => p.evaluate(() => document.querySelector('#page-size').value);
    assert.equal(await choice(), 'fit', 'Fit screen is the default');
    await act('show 12 recipes per page', () => p.locator('#page-size').selectOption('12'));
    let ui = await read();
    assert.equal(ui.cards.length, 12);
    assert.match(ui.pageStatus, /^1–12 of 190 · Page 1 of 16/);
    const shortest = await p.evaluate(() => Math.min(...Array.from(document.querySelectorAll('.recipe-card'), card => card.getBoundingClientRect().height)));
    assert.ok(shortest >= 200, `Every card keeps its normal size (shortest is ${Math.round(shortest)}px)`);
    await act('reload the disposable tab', () => tab.reload());
    ui = await read();
    assert.equal(await choice(), '12', 'The choice is remembered');
    assert.equal(ui.cards.length, 12);
    await act('back to Fit screen', () => p.locator('#page-size').selectOption('fit'));
    assert.ok((await read()).cards.length < 12, 'Fit screen shows what fits the window again');
  });

  await check('An unknown name requires an explicit custom-ingredient choice', async () => {
    const nonsense = 'zqxvfribble';
    await addPantry(nonsense);
    let ui = await read();
    assert.equal(ui.pantryCount, 0, 'Unknown text must not silently become a pantry chip.');
    assert.equal(ui.confirmation, true);
    assert.equal(ui.customChoice, true);
    assert.equal(ui.suggestionsHidden, true, 'Suggestions must not overlay the unknown-ingredient decision.');
    assert.equal(ui.confirmationHitTargets.find(button => button.label === 'Add as custom ingredient')?.unobstructed, true,
      'The custom confirmation button must be the visible hit target.');
    assert.match(ui.confirmationText, /zqxvfribble/);
    await click('[data-custom-ingredient]');
    ui = await read();
    assert.deepEqual(ui.pantry, [nonsense]);
    assert.equal(ui.confirmation, false);
    await click('#pantry-tags [data-ingredient="zqxvfribble"]');
    assert.equal((await read()).pantryCount, 0);
  });

  await check('Natural ingredient lists normalize quantities, plurals and separators', async () => {
    await addPantry('2 eggs, tomatoes; spinach and chickpeas');
    const ui = await read();
    assert.deepEqual([...ui.pantry].sort(), ['chickpea', 'egg', 'spinach', 'tomato']);
    assert.equal(ui.confirmation, false);
    assert.equal(ui.pantryCount, 4);
    await click('#clear-pantry');
  });

  await check('A typo is confirmed before its suggested ingredient is added', async () => {
    await addPantry('chikpea');
    let ui = await read();
    assert.equal(ui.pantryCount, 0);
    assert.equal(ui.confirmation, true);
    assert.equal(ui.suggestionsHidden, true, 'Suggestions must close while the typo confirmation is shown.');
    assert.equal(ui.confirmationHitTargets.find(button => button.label === 'Use chickpea')?.unobstructed, true,
      'The typo suggestion must be clickable without an overlay.');
    await click('[data-resolve-ingredient="chickpea"]');
    ui = await read();
    assert.deepEqual(ui.pantry, ['chickpea']);
    assert.equal(ui.confirmation, false);
    await click('#clear-pantry');
  });

  await check('Typing a recipe query retains input focus through result updates', async () => {
    await fill('#recipe-query', 'chick');
    let ui = await read();
    assert.equal(ui.focus.id, 'recipe-query');
    assert.ok(ui.count > 0 && ui.count < 190);
    await fill('#recipe-query', recipeName);
    ui = await read();
    assert.equal(ui.focus.id, 'recipe-query');
    assert.equal(ui.query, recipeName);
    assert.deepEqual(ui.cards, [recipeId]);
  });

  await check('Cookbook keeps saved recipes independent of pantry matching', async () => {
    await click(`[data-save="${recipeId}"]`);
    assert.equal((await read()).savedCount, 1);
    await fill('#recipe-query', '');
    await addPantry('beef');
    assert.ok(!(await read()).cards.includes(recipeId));
    await click('.nav-link[data-view="saved"]');
    let ui = await read();
    assert.equal(ui.savedMatchesOnly, false);
    assert.equal(ui.count, 1);
    assert.deepEqual(ui.cards, [recipeId]);
    await click('#saved-match-only');
    ui = await read();
    assert.equal(ui.savedMatchesOnly, true);
    assert.equal(ui.count, 0);
    await click('#saved-match-only');
    assert.deepEqual((await read()).cards, [recipeId]);
    await click('#clear-pantry');
  });

  await check('Measured ingredients have separate amount, unit and name fields that scale', async () => {
    await click(`#recipe-grid [data-recipe="${recipeId}"]`);
    let ui = await read();
    assert.equal(ui.recipeTitle, recipeName);
    assert.equal(ui.servings, 2);
    assert.equal(ui.amounts.length, 6);
    assert.ok(ui.amounts.every(row => row.amountNodes === 1 && row.unitNodes === 1 && row.nameNodes === 1));
    assert.equal(ui.amounts.find(row => row.ingredient === 'couscous').amount, '150');
    await click('[data-servings="1"]');
    assert.equal((await read()).focus.servings, '1', 'Scaling keeps keyboard focus on the serving control.');
    await click('[data-servings="1"]');
    ui = await read();
    assert.equal(ui.servings, 4);
    assert.deepEqual(ui.amounts.find(row => row.ingredient === 'couscous'), {
      amount: '300', unit: 'g', ingredient: 'couscous', note: '', amountNodes: 1, unitNodes: 1, nameNodes: 1
    });
    const chickpeas = ui.amounts.find(row => row.ingredient === 'chickpea');
    assert.equal(chickpeas.amount, '480');
    assert.match(chickpeas.note, /canned, drained and rinsed/);
    await click('[data-close-recipe]');
  });

  await check('Wednesday planning preserves servings and edits one meal instead of duplicating it', async () => {
    await click('.nav-link[data-view="plan"]');
    await click('[data-plan-day="Wednesday"]');
    await fill('#recipe-query', recipeName);
    await click(`#recipe-grid [data-recipe="${recipeId}"]`);
    await click('[data-servings="1"]');
    await click('[data-servings="1"]');
    await click('[data-plan-picker]');
    assert.equal((await read()).planDay, 'Wednesday');
    await click('[data-confirm-plan]');
    await click('[data-close-recipe]');
    await click('.nav-link[data-view="plan"]');
    let ui = await read();
    assert.equal(ui.planned.length, 1);
    assert.equal(ui.planned[0].day, 'Wednesday');
    assert.match(ui.planned[0].meta, /^4 servings/);
    const key = ui.planned[0].key;
    await click('.planned-meal [data-plan-key]');
    assert.equal((await read()).servings, 4);
    await click('[data-servings="1"]');
    await click('[data-plan-picker]');
    ui = await read();
    assert.equal(ui.planDay, 'Wednesday');
    assert.match(ui.planConfirm, /^Update 5 servings$/);
    await click('[data-confirm-plan]');
    await click('[data-close-recipe]');
    ui = await read();
    assert.equal(ui.planned.length, 1);
    assert.equal(ui.planned[0].key, key);
    assert.equal(ui.planned[0].day, 'Wednesday');
    assert.match(ui.planned[0].meta, /^5 servings/);
    assert.match(ui.planSummary, /^1 meal planned/);
  });

  await check('Cooking navigation focuses and announces the current step', async () => {
    await click('.planned-meal [data-plan-key]');
    await click('[data-start-cook]');
    let ui = await read();
    assert.match(ui.cookHeading, /^STEP 1 OF /);
    assert.match(ui.focus.classes, /\bcook-step\b/);
    assert.equal(ui.previousStepDisabled, true);
    const firstStep = ui.cookText;
    await click('[data-cook-next]');
    ui = await read();
    assert.match(ui.cookHeading, /^STEP 2 OF /);
    assert.match(ui.focus.classes, /\bcook-step\b/);
    assert.notEqual(ui.cookText, firstStep);
    await click('[data-cook-prev]');
    assert.equal((await read()).cookText, firstStep);
  });

  await check('A paused timer survives reload and replacement requires confirmation', async () => {
    await click('[data-cook-next]');
    const cookingBeforeReload = await read();
    assert.match(cookingBeforeReload.cookHeading, /^STEP 2 OF /);
    assert.match(cookingBeforeReload.cookServingHint, /^5 servings\b/);
    await fill('#timer-minutes', '5');
    await click('[data-start-timer]');
    let ui = await read();
    assert.equal(ui.timerVisible, true);
    assert.equal(ui.timerContext, recipeName);
    assert.equal(ui.timerToggle, 'Pause');
    await click('#timer-toggle');
    ui = await read();
    assert.equal(ui.timerToggle, 'Resume');
    const pausedDisplay = ui.timerDisplay;
    assert.match(pausedDisplay, /^\d+:\d{2}$/);
    await act('reload the disposable tab', () => tab.reload());
    ui = await read();
    assert.equal(ui.timerVisible, true);
    assert.equal(ui.timerToggle, 'Resume');
    assert.equal(ui.timerDisplay, pausedDisplay);
    assert.match(ui.cookHeading, /^STEP 2 OF /, 'Reload restores the active cooking step.');
    assert.equal(ui.cookText, cookingBeforeReload.cookText, 'Reload preserves the scaled cooking instruction.');
    assert.match(ui.cookServingHint, /^5 servings\b/, 'Reload preserves the planned serving count.');
    assert.equal(ui.savedCount, 1);
    if (ui.recipeOpen) await click('[data-close-recipe]');
    await click('.nav-link[data-view="plan"]');
    ui = await read();
    assert.equal(ui.planned.length, 1);
    assert.equal(ui.planned[0].day, 'Wednesday');
    assert.match(ui.planned[0].meta, /^5 servings/);
    await click('.planned-meal [data-plan-key]');
    assert.equal((await read()).servings, 5);
    await click('[data-start-cook]');
    await fill('#timer-minutes', '1');
    await click('[data-start-timer]');
    ui = await read();
    assert.equal(ui.replaceVisible, true);
    assert.equal(ui.timerDisplay, pausedDisplay);
    await click('[data-cancel-timer]');
    ui = await read();
    assert.equal(ui.replaceVisible, false);
    assert.equal(ui.timerToggle, 'Resume');
    assert.equal(ui.timerDisplay, pausedDisplay);
    await fill('#timer-minutes', '2');
    await click('[data-start-timer]');
    assert.equal((await read()).replaceVisible, true);
    await click('[data-confirm-timer]');
    ui = await read();
    assert.equal(ui.replaceVisible, false);
    assert.equal(ui.timerToggle, 'Pause');
    assert.match(ui.timerDisplay, /^(?:2:00|1:5\d)$/);
    await click('#timer-stop');
    assert.equal((await read()).timerVisible, false);
  });

  await check('Cleanup clears the disposable kitchen through Settings', async () => {
    await reset();
    const ui = await read();
    assert.equal(ui.count, 190);
    assert.equal(ui.pantryCount, 0);
    assert.equal(ui.savedCount, 0);
    assert.equal(ui.planned.length, 0);
    assert.equal(ui.timerVisible, false);
  });
  return report;
}
