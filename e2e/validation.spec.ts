import { test, expect, type Page } from '@playwright/test';

// End-to-end coverage for the dimension-validation module wired into the app:
// - each field is bounded (value snaps into range on blur)
// - rules that aren't a simple range (formed radius, frame width) still
//   surface an error on "Dodaj" with a one-click fix.
// The rules themselves are unit-tested in src/validation/__tests__.
//
// The demo build locks shape selection to QDa/QBa/QBNa/QPR6a/PR1a and the
// language picker to Polski/English — scenarios here stick to that set (see
// the "demo mode" test) so they exercise the app as a demo viewer actually can.

async function selectShape(page: Page, symbol: string) {
  await page.getByTestId(`shape-${symbol}`).click();
}

async function fillDims(page: Page, values: Array<number | string>) {
  for (let i = 0; i < values.length; i++) {
    const input = page.getByTestId(`dim-${i}`);
    await input.fill(String(values[i]));
    await expect(input).toHaveValue(String(values[i]));
  }
}

function dataRows(page: Page) {
  return page.locator('.data-grid tbody tr').filter({ hasNot: page.locator('.empty-row') });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('btn-add')).toBeVisible();
});

test('static range: field snaps into [min, max] on blur', async ({ page }) => {
  await selectShape(page, 'QDa');

  const a = page.getByTestId('dim-0');
  await a.fill('50');
  await expect(a).toHaveValue('50'); // committed
  await a.blur();
  await expect(a).toHaveValue('100'); // snapped up to the minimum

  await a.fill('9000');
  await expect(a).toHaveValue('9000');
  await a.blur();
  await expect(a).toHaveValue('4000'); // snapped down to the maximum

  await a.fill('250');
  await expect(a).toHaveValue('250');
  await a.blur();
  await expect(a).toHaveValue('250'); // already in range — untouched
});

test('radius zero (not a simple range): e/f minimum rises to 50, chip applies it', async ({ page }) => {
  await selectShape(page, 'QBa');
  // a, b, e, f, r — the flat minimum for e/f is 30, but r = 0 raises it to 50
  await fillDims(page, [300, 200, 30, 30, 0]);

  await page.getByTestId('btn-add').click();

  const errE = page
    .locator('.dimension-row', { has: page.getByTestId('dim-2') })
    .locator('.dimension-error-msg');
  await expect(errE).toBeVisible();
  await expect(errE).toContainText('promieniu 0');
  await expect(dataRows(page)).toHaveCount(0);

  // fixing a field re-hides the error panel (it re-validates live), so re-open
  // it with "Dodaj" between fixes
  await page.getByTestId('dim-suggest-2-min').click();
  await expect(page.getByTestId('dim-2')).toHaveValue('50');
  await page.getByTestId('btn-add').click();

  await page.getByTestId('dim-suggest-3-min').click();
  await expect(page.getByTestId('dim-3')).toHaveValue('50');
  await page.getByTestId('btn-add').click();

  await expect(dataRows(page)).toHaveCount(1);
});

test('formed radius (not a simple range): blocks Add, chip applies the minimum', async ({ page }) => {
  await selectShape(page, 'QBa');
  // a, b, e, f, r  — r = 50 is invalid (must be 0 or ≥ 100)
  await fillDims(page, [300, 200, 150, 150, 50]);

  await page.getByTestId('btn-add').click();

  const errR = page
    .locator('.dimension-row', { has: page.getByTestId('dim-4') })
    .locator('.dimension-error-msg');
  await expect(errR).toBeVisible();
  await expect(errR).toContainText('Promień');
  await expect(dataRows(page)).toHaveCount(0);

  await page.getByTestId('dim-suggest-4-min').click();
  await expect(page.getByTestId('dim-4')).toHaveValue('100');

  await page.getByTestId('btn-add').click();
  await expect(dataRows(page)).toHaveCount(1);
});

test('demo mode: shapes outside the demo set are locked, languages outside it are disabled', async ({ page }) => {
  // TR1a / TRa etc. carry the relational rules (d ≤ b, minimum L from branch
  // dims, …) — fully covered in src/validation/__tests__/rules.test.ts. They
  // aren't reachable here because the demo build locks the shape list to
  // QDa/QBa/QBNa/QPR6a/PR1a.
  const locked = page.getByTestId('shape-TR1a');
  await expect(locked).toHaveClass(/locked/);
  await expect(locked.locator('.demo-stamp')).toHaveText('demo');

  await locked.click();
  // selection didn't change — still QDa's 3 fields, not TR1a's 8
  await expect(page.getByTestId('dim-0')).toBeVisible();
  await expect(page.getByTestId('dim-7')).toHaveCount(0);

  // an enabled shape still works
  await selectShape(page, 'QBa');
  await expect(page.getByTestId('dim-4')).toBeVisible(); // QBa's "r" field

  // language picker: only Polski/English are selectable, the rest show "(demo)"
  const de = page.locator('.lang-dropdown option[value="de"]');
  await expect(de).toBeDisabled();
  await expect(de).toContainText('(demo)');
  const en = page.locator('.lang-dropdown option[value="en"]');
  await expect(en).toBeEnabled();
});

test('ramka: hint under the frame field explains the rule and applies the minimum', async ({ page }) => {
  await selectShape(page, 'QDa');
  await fillDims(page, [1600, 200, 500]); // largest side 1600 → frame must be ≥ P30

  await page.getByTestId('btn-add').click();

  const hint = page.getByTestId('prop-hint-ramkiWL');
  await expect(hint).toBeVisible();
  await expect(hint).toContainText('P30');
  await expect(dataRows(page)).toHaveCount(0);

  await page.getByTestId('prop-suggest-ramkiWL').click();
  await expect(page.getByTestId('prop-ramkiWL')).toHaveValue('P30');
  await page.getByTestId('prop-suggest-ramkiWYL').click();
  await expect(page.getByTestId('prop-ramkiWYL')).toHaveValue('P30');

  await page.getByTestId('btn-add').click();
  await expect(dataRows(page)).toHaveCount(1);
});

test('KOT popover: in-scope shape shows prerequisites and thickness rule', async ({ page }) => {
  await selectShape(page, 'QDa');
  await fillDims(page, [400, 300, 1000]);

  await page.getByTestId('btn-kot').click();
  const pop = page.getByTestId('kot-popover');
  await expect(pop).toBeVisible();
  await expect(pop).toContainText('Warunki wstępne');
  await expect(pop).toContainText('Ocynk');
  await expect(pop).toContainText('Dobór grubości blachy');
  await expect(pop).toContainText('Największy bok');

  // click the toggle again to close
  await page.getByTestId('btn-kot').click();
  await expect(pop).toBeHidden();
});

test('KOT popover: "make compliant" button sets the properties', async ({ page }) => {
  await selectShape(page, 'QDa');
  await fillDims(page, [400, 300, 1000]);

  await page.getByTestId('btn-kot').click();
  const pop = page.getByTestId('kot-popover');
  await expect(pop.locator('.kot-status')).toHaveText('Niezgodne z KOT');

  await page.getByTestId('kot-fix').click();

  // popover re-renders as compliant, the KOT button goes green, no more fix button
  await expect(pop.locator('.kot-status')).toHaveText('Zgodne z KOT');
  await expect(page.getByTestId('btn-kot')).toHaveClass(/btn-kot-green/);
  await expect(page.getByTestId('kot-fix')).toHaveCount(0);
});

test('KOT popover: out-of-scope shape says so', async ({ page }) => {
  await selectShape(page, 'QBa');

  await page.getByTestId('btn-kot').click();
  const pop = page.getByTestId('kot-popover');
  await expect(pop).toBeVisible();
  await expect(pop).toContainText('wyłącznie kanał prostokątny (QDa)');
  await expect(pop).toContainText('nie jest sprawdzana');
  await expect(pop).not.toContainText('Warunki wstępne');
});

test('valid dimensions add straight away with no errors', async ({ page }) => {
  await selectShape(page, 'QDa');
  await fillDims(page, [300, 200, 500]);
  await page.getByTestId('btn-add').click();
  await expect(dataRows(page)).toHaveCount(1);
  await expect(page.locator('.dimension-error-msg')).toHaveCount(0);
});
