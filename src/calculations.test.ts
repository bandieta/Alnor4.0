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
  frameBandStandard,
  isFrameAtLeast,
  computeBok,
  generateFullSymbol,
  type FullSymbolParams,
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

describe('frameBandStandard / isFrameAtLeast', () => {
  it('bands match Form1.cs sprawdz_standard_ramek1/2/3', () => {
    expect(frameBandStandard(500)).toBe('P20');
    expect(frameBandStandard(1000)).toBe('P20');
    expect(frameBandStandard(1500)).toBe('P30');
    expect(frameBandStandard(2501)).toBe('P30');
    expect(frameBandStandard(3000)).toBe('P40');
  });

  it('P30/P40 satisfy a P20 requirement but not vice versa', () => {
    expect(isFrameAtLeast('P30', 'P20')).toBe(true);
    expect(isFrameAtLeast('P20', 'P30')).toBe(false);
  });
});

describe('computeBok', () => {
  it('is max(a, b) for a plain shape', () => {
    expect(computeBok('QDa', [300, 700, 500])).toBe(700);
  });

  it('widens against c/d for QPR6a/QPR2a', () => {
    expect(computeBok('QPR6a', [300, 200, 900, 150, 500, 0, 0])).toBe(900);
  });

  it('widens against d (tab[2]) for QBFRa/QPR4a', () => {
    expect(computeBok('QBFRa', [300, 200, 950, 30, 30, 90])).toBe(950);
  });
});

describe('generateFullSymbol', () => {
  const base: FullSymbolParams = {
    symbol: 'QDa',
    tab: [300, 200, 500],
    bok: 300,
    isChemo: false,
    material: 'Ocynk',
    materialChemo: '',
    gruboscChemo: '',
    wykonanie: 'Niskociśnieniowe',
    blacha: '0,6', // the standard for bok=300 in this band
    izolowana: false,
    plaszcz: '',
    klasaSzczelnosci: 'A',
    lwzmoc: 'standard',
    ramkiWL: 'P20',
    ramkiWYL: 'P20',
  };

  it('QDa, standard everything: N-C, standard thickness, no suffixes', () => {
    expect(generateFullSymbol(base)).toBe('QDa-N-C-300x200-500 ');
  });

  it('Średniociśnieniowe uses the S- prefix', () => {
    expect(generateFullSymbol({ ...base, wykonanie: 'Średniociśnieniowe', blacha: '0,7' })).toBe(
      'QDa-S-C-300x200-500 '
    );
  });

  it('Kwasówka/Aluminium use K/A, not KW/OCY', () => {
    expect(generateFullSymbol({ ...base, material: 'Kwasówka', blacha: '0,6' })).toContain('-K');
    expect(generateFullSymbol({ ...base, material: 'Aluminium', blacha: '0,8' })).toContain('-A-');
  });

  it('non-standard thickness gets a #thickness marker with no separating dash before it', () => {
    expect(generateFullSymbol({ ...base, blacha: '1,1' })).toBe('QDa-N-C#1,1-300x200-500 ');
  });

  it('insulated with no jacket mismatch appends -I only', () => {
    expect(generateFullSymbol({ ...base, izolowana: true, plaszcz: 'Ocynk' })).toBe(
      'QDa-N-C-I-300x200-500 '
    );
  });

  it('insulated with a different jacket material appends the jacket letter too', () => {
    expect(generateFullSymbol({ ...base, izolowana: true, plaszcz: 'Kwasówka' })).toBe(
      'QDa-N-C-I-K-300x200-500 '
    );
  });

  it('sealing class B appends -Kl.B', () => {
    expect(generateFullSymbol({ ...base, klasaSzczelnosci: 'B' })).toBe('QDa-N-C-300x200-500 -Kl.B');
  });

  it('non-standard reinforcement appends -Wzm.{value}', () => {
    expect(generateFullSymbol({ ...base, lwzmoc: '2' })).toBe('QDa-N-C-300x200-500 -Wzm.2');
  });

  it('an oversized frame vs. the size-based standard appends -WL/-WYL', () => {
    // bok=300 -> standard frame is P20; picking P30 should flag as non-standard
    expect(generateFullSymbol({ ...base, ramkiWL: 'P30' })).toBe('QDa-N-C-300x200-500 -WL30');
    expect(generateFullSymbol({ ...base, ramkiWYL: 'P30' })).toBe('QDa-N-C-300x200-500 -WYL30');
  });

  it('chemo mode: material-thickness prefix, no execution letter, no frame/class suffixes affect the prefix', () => {
    const chemo: FullSymbolParams = {
      ...base,
      isChemo: true,
      materialChemo: 'PVC',
      gruboscChemo: '5',
    };
    expect(generateFullSymbol(chemo)).toBe('QDa-PVC-5-300x200-500 ');
  });

  it('QBNa: dimension block is a-b-e-f-r-alfa, matching PelnySymbolQBNa', () => {
    expect(
      generateFullSymbol({
        ...base,
        symbol: 'QBNa',
        tab: [300, 200, 30, 30, 150, 90],
        blacha: '0,6',
      })
    ).toBe('QBNa-N-C-300x200-30-30-150-90 ');
  });

  it('QBRa: b and d are swapped relative to storage order (labels: a,d,b,e,f,r,alfa)', () => {
    // tab = [a, d, b, e, f, r, alfa]
    expect(
      generateFullSymbol({
        ...base,
        symbol: 'QBRa',
        tab: [300, 50, 200, 30, 30, 150, 90],
        blacha: '0,6',
      })
    ).toBe('QBRa-N-C-300x200-50-30-30-150-90 ');
  });

  it('TR3a: hardcoded "ee=100" constant appears literally, not from tab', () => {
    // labels: a,b,c,d,m,k,i,j,g,f
    const tr3aTab = [300, 200, 100, 90, 40, 35, 60, 65, 20, 25];
    const result = generateFullSymbol({ ...base, symbol: 'TR3a', tab: tr3aTab, blacha: '0,6' });
    expect(result).toContain('-100-');
  });
});
