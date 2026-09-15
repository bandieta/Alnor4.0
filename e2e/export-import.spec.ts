import { test, expect, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { exportProject } from '../src/legacyFormat';
import type { Ksztaltka } from '../src/types';

// End-to-end coverage for the legacy-compatible (AES+XML) project file
// export/import wired into the toolbar's "Zapisz"/"Pobierz" buttons
// (src/App.tsx handleSave/handleFileInputChange). The file format itself is
// unit-tested in src/legacyFormat/__tests__; this exercises the real browser
// round trip (download -> re-upload) and the validate-on-import behavior.

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

test('export then import round-trips the grid through the real legacy AES+XML file', async ({ page }, testInfo) => {
  await selectShape(page, 'QDa');
  await fillDims(page, [300, 200, 500]);
  await page.getByTestId('btn-add').click();

  await selectShape(page, 'QBa');
  await fillDims(page, [300, 200, 50, 50, 0]);
  await page.getByTestId('btn-add').click();

  await expect(dataRows(page)).toHaveCount(2);
  const symbolsBefore = await dataRows(page).locator('td:nth-child(3)').allTextContents();

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('btn-save').click();
  const download = await downloadPromise;
  const filePath = testInfo.outputPath('exported-project.alc');
  await download.saveAs(filePath);

  // Clear the grid in-app (not a page reload) so the re-populated grid can
  // only have come from decrypting/parsing/validating the downloaded file.
  await page.getByTestId('btn-new').click();
  await expect(dataRows(page)).toHaveCount(0);

  await page.getByTestId('file-input').setInputFiles(filePath);

  await expect(dataRows(page)).toHaveCount(2);
  const symbolsAfter = await dataRows(page).locator('td:nth-child(3)').allTextContents();
  expect(symbolsAfter).toEqual(symbolsBefore);
});

test('importing a file with an out-of-range shape rejects that row and reports why', async ({ page }, testInfo) => {
  const invalid: Ksztaltka = {
    obcy: false,
    symbol: 'QDa',
    oznaczenie: 'BAD-1',
    nazwa: 'Kanał prosty',
    sztuk: '1',
    uwagi: '',
    przekroj: '',
    material: 'Ocynk',
    materialChemo: '',
    gruboscChemo: '',
    wykonanieChemo: '',
    isChemo: false,
    Qnazwa: '',
    Qzamawia: '',
    Qdata: '',
    blacha: '0,6',
    wykonanie: 'A',
    klasa_szczelnosci: 'A',
    l_wzmoc: '',
    ramkawl: '',
    ramkawyl: '',
    ramkaod: '',
    powierznia: '0.00',
    powierzniaIz: '',
    pelny_symbol: 'QDa-BAD-1',
    pelny_symbolIz: '',
    izolowana: false,
    plaszcz: '',
    gruboscIlozacji: '',
    // a = 50 is below QDa's minimum of 100 -> must fail validation on import.
    tab: ['50', '200', '500', ...Array(14).fill('')],
  };

  const blob = await exportProject([invalid]);
  const buffer = Buffer.from(await blob.arrayBuffer());
  const filePath = testInfo.outputPath('invalid-project.alc');
  await writeFile(filePath, buffer);

  let dialogMessage = '';
  page.on('dialog', async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.getByTestId('file-input').setInputFiles(filePath);

  await expect.poll(() => dialogMessage).toContain('BAD-1');
  await expect(dataRows(page)).toHaveCount(0);
});
