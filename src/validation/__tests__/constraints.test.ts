import { describe, it, expect } from 'vitest';
import { fieldConstraints } from '../constraints';
import type { ValidationContext } from '../types';
import { GOOD } from './fixtures';

const OCYNK: ValidationContext = { material: 'Ocynk', materialType: 'blacha' };
const KWAS: ValidationContext = { material: 'Kwasówka', materialType: 'blacha' };
const CHEMO: ValidationContext = { material: 'PVC', materialType: 'chemo' };

describe('fieldConstraints — static bounds', () => {
  it('QDa side fields depend on material', () => {
    const oc = fieldConstraints('QDa', GOOD.QDa, OCYNK);
    expect(oc[0]).toEqual({ min: 100, max: 4000 });
    expect(oc[1]).toEqual({ min: 100, max: 4000 });

    const kw = fieldConstraints('QDa', GOOD.QDa, KWAS);
    expect(kw[0]).toEqual({ min: 100, max: 2501 });
  });

  it('QDa length window, tighter in chemo mode', () => {
    expect(fieldConstraints('QDa', GOOD.QDa, OCYNK)[2]).toEqual({ min: 100, max: 20000 });
    expect(fieldConstraints('QDa', GOOD.QDa, CHEMO)[2]).toEqual({ min: 100, max: 1500 });
  });

  it('PR1a has a 250–5000 length window', () => {
    expect(fieldConstraints('PR1a', GOOD.PR1a, OCYNK)[3]).toEqual({ min: 250, max: 5000 });
  });

  it('QBNa bend angle is 15–90', () => {
    expect(fieldConstraints('QBNa', GOOD.QBNa, OCYNK)[5]).toEqual({ min: 15, max: 90 });
  });

  it('formed radius has no numeric range', () => {
    // QBa r is index 4 — the "0 or ≥100" rule is not a clampable range
    expect(fieldConstraints('QBa', GOOD.QBa, OCYNK)[4]).toBeUndefined();
  });
});

describe('fieldConstraints — dynamic (relational) bounds', () => {
  it('TR1a w ≤ L − 60, only once L is set', () => {
    const withL = fieldConstraints('TR1a', GOOD.TR1a, OCYNK); // L = 500
    expect(withL[3]?.max).toBe(440);

    const noL = [...GOOD.TR1a];
    noL[4] = 0;
    expect(fieldConstraints('TR1a', noL, OCYNK)[3]?.max).toBeUndefined();
  });

  it('TRa minimum L is h + q + r + i + 30', () => {
    // fixture: h=100, q=100, r=100, i=100 → min L = 430
    expect(fieldConstraints('TRa', GOOD.TRa, OCYNK)[4]?.min).toBe(430);
  });

  it('TR6a f ≤ a and L ≥ e + 100', () => {
    const c = fieldConstraints('TR6a', GOOD.TR6a, OCYNK); // a=400, e=100
    expect(c[2]?.max).toBe(400); // f
    expect(c[3]?.min).toBe(200); // L
  });

  it('impossible max (below min) is dropped rather than surfaced', () => {
    const v = [...GOOD.TR1a];
    v[4] = 120; // L = 120 → w max would be 60, below the field minimum-ish; still emitted as max 60
    const c = fieldConstraints('TR1a', v, OCYNK);
    // 60 is a valid positive max here, kept
    expect(c[3]?.max).toBe(60);
    v[4] = 40; // L − 60 = -20 → negative, dropped
    expect(fieldConstraints('TR1a', v, OCYNK)[3]?.max).toBeUndefined();
  });
});
