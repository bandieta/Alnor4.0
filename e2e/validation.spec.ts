import { test, expect, type Page } from '@playwright/test';

// End-to-end coverage for the dimension-validation module wired into the app:
// - each field is bounded (value snaps into range on blur, range shown as a hint)
// - rules that aren't a simple range (formed radius, minimum L, frame width)
//   still surface an error on "Dodaj" with a one-click fix.
// The rules themselves are unit-tested in src/validation/__tests__.

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

test('relational range: TR1a enforces w ≤ L − 60 once L is set', async ({ page }) => {
  await selectShape(page, 'TR1a');
  // a, b, d, w, L, e, f, l3
  await fillDims(page, [250, 300, 140, 100, 500, 50, 50, 80]);

  const w = page.getByTestId('dim-3');
  await w.fill('900'); // L − 60 = 440
  await w.blur();
  await expect(w).toHaveValue('440');
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

test('minimum L (from branch dimensions): blocks Add, chip applies the minimum', async ({ page }) => {
  await selectShape(page, 'TRa');
  // a, b, d, h, L, q, r, i, p  — L = 200 < h+q+r+i+30 = 430
  await fillDims(page, [300, 250, 200, 100, 200, 100, 100, 100, 100]);

  await page.getByTestId('btn-add').click();

  const errL = page
    .locator('.dimension-row', { has: page.getByTestId('dim-4') })
    .locator('.dimension-error-msg');
  await expect(errL).toBeVisible();
  await expect(dataRows(page)).toHaveCount(0);

  await page.getByTestId('dim-suggest-4-min').click();
  await expect(page.getByTestId('dim-4')).toHaveValue('430');

  await page.getByTestId('btn-add').click();
  await expect(dataRows(page)).toHaveCount(1);
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
