import { describe, it, expect } from 'vitest';
import {
  insulatedTab,
  calculateInsulatedArea,
  rozwiniecie_QDa,
  rozwiniecie_QBa,
  rozwiniecie_QBRa,
  rozwiniecie_TR8,
  blachaBandStandard,
  isBlachaThicknessAtLeast,
} from './calculations';

// Ground truth for these deltas is the actual `wartoscIz = Blacha.Rozwiniecie_*(...)`
// call sites in the legacy Form1.cs — see the comment above INSULATED_DELTAS.
describe('insulatedTab', () => {
  it('QDa: a and b grow by 2x insulation thickness, l unchanged', () => {
    // legacy: Rozwiniecie_QDa(a + gg2, b + gg2, l)
    expect(insulatedTab('QDa', [300, 200, 500], 50)).toEqual([400, 300, 500]);
  });

  it('QBa: a/b grow by 2x, r shrinks by 1x, e/f untouched', () => {
    // tab: [a, b, e, f, r, ...] per calculateArea's QBa case
    // legacy: Rozwiniecie_QBa(a + gg2, b + gg2, f, e, r - gg)
    const tab = [300, 200, 30, 30, 150, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const result = insulatedTab('QBa', tab, 50);
    expect(result[0]).toBe(400); // a + 100
    expect(result[1]).toBe(300); // b + 100
    expect(result[2]).toBe(30); // e unchanged
    expect(result[3]).toBe(30); // f unchanged
    expect(result[4]).toBe(100); // r - 50
  });

  it('QPR6a: deliberately deviates from the (buggy) legacy runtime and grows a/b/c/d by 2x', () => {
    const tab = [300, 200, 100, 100, 500, 0, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const result = insulatedTab('QPR6a', tab, 50);
    expect(result[0]).toBe(400);
    expect(result[1]).toBe(300);
    expect(result[2]).toBe(200);
    expect(result[3]).toBe(200);
    expect(result[4]).toBe(500); // l unchanged
  });

  it('unknown symbol returns tab unchanged', () => {
    const tab = [1, 2, 3];
    expect(insulatedTab('NOPE', tab, 50)).toBe(tab);
  });
});

describe('calculateInsulatedArea', () => {
  it('QDa matches rozwiniecie_QDa called with enlarged a/b', () => {
    const tab = [300, 200, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const expected = rozwiniecie_QDa(400, 300, 500);
    expect(calculateInsulatedArea('QDa', tab, 50)).toBeCloseTo(expected, 9);
  });

  it('QBa matches rozwiniecie_QBa called with a+2gg, b+2gg, r-gg', () => {
    const tab = [300, 200, 30, 30, 150, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const expected = rozwiniecie_QBa(400, 300, 30, 30, 100);
    expect(calculateInsulatedArea('QBa', tab, 50)).toBeCloseTo(expected, 9);
  });

  it('QBRa matches rozwiniecie_QBRa called with a+2gg, b(=tab2)+2gg, r(=tab5)-gg', () => {
    const tab = [300, 0, 200, 30, 30, 150, 90, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const expected = rozwiniecie_QBRa(400, 300, 30, 30, 90, 100);
    expect(calculateInsulatedArea('QBRa', tab, 50)).toBeCloseTo(expected, 9);
  });

  it('TR8a matches rozwiniecie_TR8 with a/b/c/d/w/g all +2gg, l/l3/m/n unchanged', () => {
    const tab = [300, 200, 150, 100, 80, 60, 500, 40, 20, 10, 0, 0, 0, 0, 0, 0, 0];
    const expected = rozwiniecie_TR8(400, 300, 250, 200, 180, 160, 500, 40, 20, 10);
    expect(calculateInsulatedArea('TR8a', tab, 50)).toBeCloseTo(expected, 9);
  });

  it('is always >= the plain area for a duct (jacket only ever adds material)', () => {
    const tab = [300, 200, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const plain = rozwiniecie_QDa(300, 200, 500);
    expect(calculateInsulatedArea('QDa', tab, 50)).toBeGreaterThan(plain);
  });
});

// Ground truth: Form1.cs zmien_blache/zmien_blache_komunikat (~11294-11649).
describe('blachaBandStandard', () => {
  it('Ocynk/Niskociśnieniowe bands', () => {
    expect(blachaBandStandard('Ocynk', 'Niskociśnieniowe', 300)).toBe('0,6');
    expect(blachaBandStandard('Ocynk', 'Niskociśnieniowe', 700)).toBe('0,8');
    expect(blachaBandStandard('Ocynk', 'Niskociśnieniowe', 1500)).toBe('1,0');
    expect(blachaBandStandard('Ocynk', 'Niskociśnieniowe', 3000)).toBe('1,1');
  });

  it('Ocynk/Średniociśnieniowe bands', () => {
    expect(blachaBandStandard('Ocynk', 'Średniociśnieniowe', 300)).toBe('0,7');
    expect(blachaBandStandard('Ocynk', 'Średniociśnieniowe', 700)).toBe('0,9');
    expect(blachaBandStandard('Ocynk', 'Średniociśnieniowe', 1500)).toBe('1,1');
    expect(blachaBandStandard('Ocynk', 'Średniociśnieniowe', 3000)).toBe('1,2');
  });

  it('Kwasówka bands (wykonanie forced to Niskociśnieniowe)', () => {
    expect(blachaBandStandard('Kwasówka', 'Średniociśnieniowe', 500)).toBe('0,6');
    expect(blachaBandStandard('Kwasówka', 'Niskociśnieniowe', 1500)).toBe('0,8');
  });

  it('Aluminium always suggests 0,8 within table range', () => {
    expect(blachaBandStandard('Aluminium', 'Niskociśnieniowe', 200)).toBe('0,8');
    expect(blachaBandStandard('Aluminium', 'Niskociśnieniowe', 2000)).toBe('0,8');
  });

  it('returns null outside the table range or for unknown materials', () => {
    expect(blachaBandStandard('Ocynk', 'Niskociśnieniowe', 5000)).toBeNull();
    expect(blachaBandStandard('Ocynk', 'Niskociśnieniowe', 0)).toBeNull();
    expect(blachaBandStandard('PVC', 'Mufy', 300)).toBeNull();
  });
});

describe('isBlachaThicknessAtLeast', () => {
  it('accepts equal or thicker selections without complaint', () => {
    expect(isBlachaThicknessAtLeast('Ocynk', 'Niskociśnieniowe', '0,8', '0,8')).toBe(true);
    expect(isBlachaThicknessAtLeast('Ocynk', 'Niskociśnieniowe', '1,1', '0,8')).toBe(true);
  });

  it('flags a thinner-than-required selection', () => {
    expect(isBlachaThicknessAtLeast('Ocynk', 'Niskociśnieniowe', '0,6', '0,8')).toBe(false);
    expect(isBlachaThicknessAtLeast('Ocynk', 'Średniociśnieniowe', '0,7', '1,1')).toBe(false);
  });

  it('is permissive for values outside the known order (no false alarms)', () => {
    expect(isBlachaThicknessAtLeast('Ocynk', 'Niskociśnieniowe', '2,0', '0,8')).toBe(true);
  });
});
