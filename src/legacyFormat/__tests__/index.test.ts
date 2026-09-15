import { describe, it, expect } from 'vitest';
import { exportProject, importProject } from '../index';
import { GOOD } from '../../validation/__tests__/fixtures';
import type { Ksztaltka } from '../../types';

function ksztaltkaFromFixture(symbol: string, tab: number[]): Ksztaltka {
  return {
    obcy: false,
    symbol,
    oznaczenie: `1-${symbol}`,
    nazwa: symbol,
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
    pelny_symbol: symbol,
    pelny_symbolIz: '',
    izolowana: false,
    plaszcz: '',
    gruboscIlozacji: '',
    tab: Array.from({ length: 17 }, (_, i) => (tab[i] !== undefined ? String(tab[i]) : '')),
  };
}

describe('legacyFormat export/import round trip', () => {
  it('round-trips every GOOD validation fixture through export -> import', async () => {
    const rows = Object.entries(GOOD).map(([symbol, tab]) => ksztaltkaFromFixture(symbol, tab));

    const blob = await exportProject(rows);
    const bytes = await blob.arrayBuffer();
    const imported = await importProject(bytes);

    expect(imported).toEqual(rows);
  });

  it('round-trips a single shape', async () => {
    const row = ksztaltkaFromFixture('QDa', GOOD.QDa);
    const imported = await importProject(await (await exportProject([row])).arrayBuffer());
    expect(imported).toEqual([row]);
  });

  it('rejects a file that is not in the legacy format', async () => {
    const notLegacy = new TextEncoder().encode('{"rows":[]}').buffer;
    await expect(importProject(notLegacy)).rejects.toThrow();
  });

  it('round-trips an empty project (0 shapes) without throwing', async () => {
    const blob = await exportProject([]);
    const imported = await importProject(await blob.arrayBuffer());
    expect(imported).toEqual([]);
  });
});
