// Public entry point for the shape-dimension validation module.
//
//   import { validateShape } from './validation';
//   const result = validateShape('QDa', [50, 200, 500], ctx);
//   result.dimensionErrors  // -> [{ index: 0, message: 'Wartość a poza zakresem (100–4000 mm)', suggest: { min: 100, max: 4000 } }]
//
// Rules are ported from the legacy .NET app; see `docs/REGULY_WALIDACJI.md`.

import { SHAPE_DEFINITIONS } from '../data';
import { RULES } from './registry';
import { checkFrames, checkThickness } from './properties';
import type {
  RuleViolation,
  ShapeValidationResult,
  ValidationContext,
} from './types';

export type {
  RuleViolation,
  ShapeValidationResult,
  ValidationContext,
  Suggestion,
  Rule,
  FieldConstraints,
} from './types';
export { RULES } from './registry';
export { minFrameFor } from './properties';
export { fieldConstraints } from './constraints';

const EMPTY_CTX: ValidationContext = { material: 'Ocynk', materialType: 'blacha' };

function labelsFor(symbol: string): string[] {
  return SHAPE_DEFINITIONS.find((s) => s.symbol === symbol)?.labels ?? [];
}

/**
 * Run every rule registered for `symbol`.
 *
 * @param symbol shape symbol, e.g. `"QDa"`
 * @param values numeric dimension values (index === label index). Strings are accepted too.
 * @param ctx    material / execution context (defaults to Ocynk / blacha)
 */
export function validateShape(
  symbol: string,
  values: Array<number | string>,
  ctx: ValidationContext = EMPTY_CTX,
): ShapeValidationResult {
  const raw = values.map((x) => (x == null ? '' : String(x)));
  const nums = raw.map((x) => {
    const n = parseFloat(x.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  });

  const violations: RuleViolation[] = [];
  const seen = new Set<string>();
  const push = (rv: RuleViolation) => {
    const key = `${rv.scope}:${rv.index}:${rv.field ?? ''}:${rv.ruleId}`;
    if (seen.has(key)) return;
    seen.add(key);
    violations.push(rv);
  };

  for (const rule of RULES[symbol] ?? []) {
    const res = rule.check(nums, ctx, raw);
    if (!res) continue;
    if (Array.isArray(res)) res.forEach(push);
    else push(res);
  }

  // property-scope checks (frame width + sheet thickness), keyed off the max duct side
  const labels = labelsFor(symbol);
  const aI = labels.findIndex((x) => /^a\b/i.test(x.trim()));
  const bI = labels.findIndex((x) => /^b\b/i.test(x.trim()));
  const maxSide = Math.max(aI >= 0 ? nums[aI] : 0, bI >= 0 ? nums[bI] : 0);
  if (ctx.ramki && ctx.materialType !== 'chemo') {
    checkFrames(maxSide, {
      ramkiWL: ctx.ramki.wl,
      ramkiWYL: ctx.ramki.wyl,
      ramkiOd: ctx.ramki.od,
    }).forEach(push);
  }
  checkThickness(maxSide, ctx).forEach(push);

  const dimensionErrors = violations.filter((x) => x.scope === 'dimension');
  const propertyErrors = violations.filter((x) => x.scope === 'property');
  // "advisory" property notes (thickness) shouldn't block Add; frame + all
  // dimension errors do.
  const blocking = dimensionErrors.length + propertyErrors.filter((x) => x.ruleId !== 'blacha.standard').length;

  return { violations, dimensionErrors, propertyErrors, valid: blocking === 0 };
}
