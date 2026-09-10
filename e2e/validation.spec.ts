import { test, expect, type Page } from '@playwright/test';

// End-to-end coverage for the dimension-validation module wired into the app.
// The rules themselves are unit-tested in src/validation/__tests__; this file
// only proves the wiring: errors surface on "Dodaj", the Add is blocked, and the
// suggested-range chips apply a valid value.

async function selectShape(page: Page, symbol: string) {
  await page.getByTestId(`shape-${symbol}`).click();
}

async function fillDims(page: Page, values: Array<number | string>) {
  for (let i = 0; i < values.length; i++) {
    const input = page.getByTestId(`dim-${i}`);
    await input.fill(String(values[i]));
    // controlled input — wait for React to commit before moving on
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

test('QDa: side out of range blocks Add and offers a clickable minimum', async ({ page }) => {
  await selectShape(page, 'QDa');
  await fillDims(page, [50, 200, 500]); // a = 50 < 100

  await page.getByTestId('btn-add').click();

  const errA = page.locator('.dimension-row', { has: page.getByTestId('dim-0') }).locator('.dimension-error-msg');
  await expect(errA).toBeVisible();
  await expect(errA).toContainText('poza zakresem');
  await expect(dataRows(page)).toHaveCount(0);

  // apply the suggested minimum
  await page.getByTestId('dim-suggest-0-min').click();
  await expect(page.getByTestId('dim-0')).toHaveValue('100');

  // now valid — Add succeeds
  await page.getByTestId('btn-add').click();
  await expect(dataRows(page)).toHaveCount(1);
});

test('TR1a: relational rule w ≤ L − 60 with a max chip', async ({ page }) => {
  await selectShape(page, 'TR1a');
  // a, b, d, w, L, e, f, l3
  await fillDims(page, [250, 300, 140, 500, 500, 50, 50, 80]); // w = 500 > 440

  await page.getByTestId('btn-add').click();

  const errW = page.locator('.dimension-row', { has: page.getByTestId('dim-3') }).locator('.dimension-error-msg');
  await expect(errW).toBeVisible();
  await expect(errW).toContainText('w');
  await expect(dataRows(page)).toHaveCount(0);

  await page.getByTestId('dim-suggest-3-max').click();
  await expect(page.getByTestId('dim-3')).toHaveValue('440');

  await page.getByTestId('btn-add').click();
  await expect(dataRows(page)).toHaveCount(1);
});

test('TRa: minimum L is computed from the branch dimensions', async ({ page }) => {
  await selectShape(page, 'TRa');
  // a, b, d, h, L, q, r, i, p
  await fillDims(page, [300, 250, 200, 100, 200, 100, 100, 100, 100]); // L = 200 < 430

  await page.getByTestId('btn-add').click();

  const errL = page.locator('.dimension-row', { has: page.getByTestId('dim-4') }).locator('.dimension-error-msg');
  await expect(errL).toBeVisible();
  await expect(dataRows(page)).toHaveCount(0);

  await page.getByTestId('dim-suggest-4-min').click();
  await expect(page.getByTestId('dim-4')).toHaveValue('430');

  await page.getByTestId('btn-add').click();
  await expect(dataRows(page)).toHaveCount(1);
});

test('Ramka: hint under the frame field explains the rule and applies the minimum', async ({ page }) => {
  await selectShape(page, 'QDa');
  await fillDims(page, [1600, 200, 500]); // largest side 1600 → frame must be ≥ P30

  await page.getByTestId('btn-add').click();

  const hint = page.getByTestId('prop-hint-ramkiWL');
  await expect(hint).toBeVisible();
  await expect(hint).toContainText('P30');
  await expect(dataRows(page)).toHaveCount(0);

  // one click applies the suggested frame
  await page.getByTestId('prop-suggest-ramkiWL').click();
  await expect(page.getByTestId('prop-ramkiWL')).toHaveValue('P30');
  await page.getByTestId('prop-suggest-ramkiWYL').click();
  await expect(page.getByTestId('prop-ramkiWYL')).toHaveValue('P30');

  await page.getByTestId('btn-add').click();
  await expect(dataRows(page)).toHaveCount(1);
});

test('QDa: fully valid dimensions add straight away', async ({ page }) => {
  await selectShape(page, 'QDa');
  await fillDims(page, [300, 200, 500]);
  await page.getByTestId('btn-add').click();
  await expect(dataRows(page)).toHaveCount(1);
  await expect(page.locator('.dimension-error-msg')).toHaveCount(0);
});
