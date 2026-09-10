import { describe, it, expect } from 'vitest';
import { SHAPE_DEFINITIONS } from '../../data';
import { RULES } from '../registry';
import { GOOD } from './fixtures';

describe('registry structure', () => {
  it('every shape in data.ts has a rule list', () => {
    for (const def of SHAPE_DEFINITIONS) {
      expect(RULES[def.symbol], def.symbol).toBeDefined();
      expect(RULES[def.symbol].length).toBeGreaterThan(0);
    }
  });

  it('every rule references only valid field indices', () => {
    for (const def of SHAPE_DEFINITIONS) {
      const n = def.labels.length;
      for (const rule of RULES[def.symbol]) {
        for (const i of rule.fields) {
          expect(i, `${def.symbol}/${rule.id}`).toBeGreaterThanOrEqual(0);
          expect(i, `${def.symbol}/${rule.id}`).toBeLessThan(n);
        }
      }
    }
  });

  it('every shape has a known-good fixture with the right arity', () => {
    for (const def of SHAPE_DEFINITIONS) {
      expect(GOOD[def.symbol], def.symbol).toBeDefined();
      expect(GOOD[def.symbol].length, def.symbol).toBe(def.labels.length);
    }
  });
});
