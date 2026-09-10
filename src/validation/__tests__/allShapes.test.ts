import { describe, it, expect } from 'vitest';
import { validateShape } from '..';
import type { ValidationContext } from '..';
import { GOOD } from './fixtures';

const OCYNK: ValidationContext = { material: 'Ocynk', materialType: 'blacha' };

describe('known-good fixtures pass', () => {
  for (const [symbol, values] of Object.entries(GOOD)) {
    it(`${symbol} — no violations`, () => {
      const r = validateShape(symbol, values, OCYNK);
      expect(
        r.violations.map((x) => `${x.ruleId}@${x.index}: ${x.message}`),
      ).toEqual([]);
      expect(r.valid).toBe(true);
    });
  }
});

describe('empty input → every field flagged required', () => {
  for (const [symbol, values] of Object.entries(GOOD)) {
    it(`${symbol}`, () => {
      const r = validateShape(symbol, new Array(values.length).fill(''), OCYNK);
      const required = r.dimensionErrors.filter((x) => x.ruleId.startsWith('required.'));
      expect(required.length).toBe(values.length);
      expect(r.valid).toBe(false);
    });
  }
});
