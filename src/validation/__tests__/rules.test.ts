import { describe, it, expect } from 'vitest';
import { validateShape } from '..';
import type { ValidationContext } from '..';
import { GOOD } from './fixtures';

const OCYNK: ValidationContext = { material: 'Ocynk', materialType: 'blacha' };
const KWAS: ValidationContext = { material: 'Kwasówka', materialType: 'blacha' };
const CHEMO: ValidationContext = { material: 'PVC', materialType: 'chemo' };

/** clone a good fixture and override one field */
function withField(symbol: string, index: number, value: number): number[] {
  const v = [...GOOD[symbol]];
  v[index] = value;
  return v;
}

function ids(r: ReturnType<typeof validateShape>): string[] {
  return r.violations.map((x) => x.ruleId);
}

describe('common: side range (CheckComboBox3)', () => {
  it('a below 100 → out of range, suggests [100, 4000]', () => {
    const r = validateShape('QDa', withField('QDa', 0, 50), OCYNK);
    const hit = r.dimensionErrors.find((x) => x.ruleId === 'a.side.range');
    expect(hit).toBeTruthy();
    expect(hit!.suggest).toEqual({ min: 100, max: 4000 });
    expect(hit!.index).toBe(0);
  });

  it('a above 4000 (Ocynk) → out of range', () => {
    expect(ids(validateShape('QDa', withField('QDa', 0, 5000), OCYNK))).toContain('a.side.range');
  });

  it('Kwasówka caps at 2501', () => {
    expect(ids(validateShape('QDa', withField('QDa', 0, 3000), KWAS))).toContain('a.side.range');
    expect(ids(validateShape('QDa', withField('QDa', 0, 3000), OCYNK))).not.toContain('a.side.range');
  });
});

describe('common: length range', () => {
  it('QDa L above 20000', () => {
    expect(ids(validateShape('QDa', withField('QDa', 2, 25000), OCYNK))).toContain('L.range');
  });
  it('QDa chemo caps L at 1500', () => {
    expect(ids(validateShape('QDa', withField('QDa', 2, 1800), CHEMO))).toContain('L.range');
    expect(ids(validateShape('QDa', withField('QDa', 2, 1800), OCYNK))).not.toContain('L.range');
  });
  it('PR1a L below 250', () => {
    expect(ids(validateShape('PR1a', withField('PR1a', 3, 200), OCYNK))).toContain('L.range');
  });
});

describe('common: non-zero (zle dane!)', () => {
  it('QDa a = 0', () => {
    expect(ids(validateShape('QDa', withField('QDa', 0, 0), OCYNK))).toContain('nonZero.0');
  });
});

describe('common: formed radius rule (sprawdz_Pormien)', () => {
  it('QBa radius between 1 and 99 → invalid', () => {
    expect(ids(validateShape('QBa', withField('QBa', 4, 50), OCYNK))).toContain('r.range');
  });
  it('QBa radius 0 forces e,f >= 50', () => {
    const v = [...GOOD.QBa];
    v[4] = 0; // r
    v[2] = 30; // e
    const r = validateShape('QBa', v, OCYNK);
    expect(ids(r)).toContain('e.efMinNoRadius');
  });
  it('QBa radius 120 is fine', () => {
    const v = [...GOOD.QBa];
    v[4] = 120; v[2] = 160; v[3] = 160; // e,f >= r+30
    expect(validateShape('QBa', v, OCYNK).valid).toBe(true);
  });
});

describe('common: e/f minimums (SprawdzEiF)', () => {
  it('QD1a e below 30', () => {
    expect(ids(validateShape('QD1a', withField('QD1a', 4, 20), OCYNK))).toContain('e.efMin');
  });
});

describe('common: bend angle (QBRa)', () => {
  it('alfa above 90', () => {
    expect(ids(validateShape('QBRa', withField('QBRa', 6, 120), OCYNK))).toContain('alfa.alfa.range');
  });
  it('alfa below 15', () => {
    expect(ids(validateShape('QBRa', withField('QBRa', 6, 5), OCYNK))).toContain('alfa.alfa.range');
  });
});

describe('relational rules — one violating case each', () => {
  const cases: [string, number[], string][] = [
    // symbol, values (override), expected ruleId
    ['QBFRa', withField('QBFRa', 2, 150), 'QBFRa.b.leD'], // d(150) < b(200)
    ['QBRa', withField('QBRa', 2, 250), 'QBRa.b.leD'], // b(250) > d(200)
    ['QBR1a', withField('QBR1a', 3, 300), 'QBR1a.b.leD'], // b(300) > d(250)
    ['TR1a', withField('TR1a', 2, 400), 'TR1a.d.leB'], // d(400) > b(300)
    ['TR1a', withField('TR1a', 3, 500), 'TR1a.w.max'], // w(500) > L-60(440)
    ['TR2a', withField('TR2a', 2, 300), 'TR2a.d.max'], // d(300) > b(250)
    ['TRa', withField('TRa', 2, 300), 'TRa.d.leB'], // d(300) > b(250)
    ['TRa', withField('TRa', 4, 200), 'TRa.L.min'], // L(200) < h+q+r+i+30 (430)
    ['TR4a', withField('TR4a', 2, 400), 'TR4a.a.geC'], // c(400) > a(300)
    ['TR4a', withField('TR4a', 4, 300), 'TR4a.L.min'], // L(300) < d+g+60+i (460)
    ['TR6a', withField('TR6a', 2, 500), 'TR6a.f.leA'], // f(500) > a(400)
    ['TR6a', withField('TR6a', 3, 150), 'TR6a.L.min'], // L(150) < e+100 (200)
    ['TR7a', withField('TR7a', 1, 300), 'TR7a.b.ltD'], // b(300) >= d(250)
    ['TR8a', withField('TR8a', 4, 500), 'TR8a.w.max'], // w(500) > l-60 (440)
    ['TR8a', withField('TR8a', 5, 300), 'TR8a.g.ltD'], // g(300) >= d(250)
    ['TR9a', withField('TR9a', 4, 300), 'TR9a.d1.ltD'], // d1(300) >= d(250)
    ['TR9a', withField('TR9a', 4, 260), 'TR9a.d1.ltB'], // d1(260) >= b(250) (but < d 250? d=250 → also d1LtD). keep loose
    ['CZ2a', withField('CZ2a', 2, 300), 'CZ.b.geD'], // d(300) > b(250)
    ['CZ1a', withField('CZ1a', 2, 300), 'CZ.b.geD'], // d(300) > b(250)
  ];

  for (const [symbol, values, ruleId] of cases) {
    it(`${symbol} → ${ruleId}`, () => {
      expect(ids(validateShape(symbol, values, OCYNK))).toContain(ruleId);
    });
  }
});

describe('property scope', () => {
  it('frame too narrow for a large duct', () => {
    const r = validateShape('QDa', [1600, 1600, 500], {
      ...OCYNK,
      ramki: { wl: 'P20' },
    });
    expect(r.propertyErrors.some((x) => x.ruleId === 'ramkiWL.frame.min')).toBe(true);
  });

  it('thickness advisory does not block Add', () => {
    const r = validateShape('QDa', [300, 200, 500], {
      ...OCYNK,
      wykonanie: 'Niskociśnieniowe',
      blacha: '1,1', // band wants 0,6
    });
    expect(r.propertyErrors.some((x) => x.ruleId === 'blacha.standard')).toBe(true);
    expect(r.valid).toBe(true);
  });
});
