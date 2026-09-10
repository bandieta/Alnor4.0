// Effective per-field numeric bounds, derived from the same rule set that
// `validateShape` uses. The app feeds these into the dimension inputs so a value
// can't be left outside its allowed range (clamp on blur) and the range is shown
// as a hint.

import { RULES } from './registry';
import type { FieldConstraints, ValidationContext } from './types';

const EMPTY_CTX: ValidationContext = { material: 'Ocynk', materialType: 'blacha' };

/**
 * @param symbol shape symbol, e.g. `"QDa"`
 * @param values current numeric dimension values (used for the dynamic bounds,
 *               e.g. `w ≤ L − 60`). Strings accepted.
 * @param ctx    material / execution context (affects side + length ceilings)
 */
export function fieldConstraints(
  symbol: string,
  values: Array<number | string>,
  ctx: ValidationContext = EMPTY_CTX,
): FieldConstraints {
  const nums = values.map((x) => {
    const n = parseFloat(String(x ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  });

  const out: FieldConstraints = {};
  for (const rule of RULES[symbol] ?? []) {
    if (!rule.bounds) continue;
    for (const b of rule.bounds(nums, ctx)) {
      if (b.index < 0) continue;
      const cur = out[b.index] ?? {};
      if (b.min != null) cur.min = cur.min == null ? b.min : Math.max(cur.min, b.min);
      if (b.max != null) cur.max = cur.max == null ? b.max : Math.min(cur.max, b.max);
      out[b.index] = cur;
    }
  }

  // If sibling data makes a max land below the min, drop the max rather than
  // producing an impossible field.
  for (const key of Object.keys(out)) {
    const c = out[Number(key)];
    if (c.min != null && c.max != null && c.max < c.min) delete c.max;
    if (c.max != null && c.max < 0) delete c.max;
  }
  return out;
}
