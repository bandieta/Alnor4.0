// Reusable rule factories. Each returns a `Rule` whose `check()` produces a
// `RuleViolation` (or null). Messages are Polish, ready to display; a
// `messageKey` + `params` pair is kept alongside for future i18n.

import type { Rule, RuleViolation, ValidationContext } from './types';
import {
  SIDE_MIN,
  sideMax,
  LENGTH_MIN,
  LENGTH_MAX,
  LENGTH_MAX_CHEMO,
  RADIUS_MIN,
  EF_MIN_NO_RADIUS,
  EF_MIN_FRAME,
  EF_RADIUS_MARGIN,
  ALFA_MIN,
  ALFA_MAX,
} from './constants';

const LETTERS = 'abcdefghijklmnop'.split('');
/** Human label for a field index, stripped of the " [mm]" suffix. */
export function fieldLetter(labels: string[], index: number): string {
  const raw = labels[index] ?? LETTERS[index] ?? `#${index}`;
  return raw.replace(/\s*\[mm\]\s*/i, '').trim();
}

function v(
  index: number,
  ruleId: string,
  message: string,
  messageKey: string,
  params?: Record<string, string | number>,
  suggest?: RuleViolation['suggest'],
): RuleViolation {
  return { index, ruleId, scope: 'dimension', message, messageKey, params, suggest };
}

/** Every non-"..." field must be filled in. */
export function requiredAll(labels: string[]): Rule {
  return {
    id: 'required',
    fields: labels.map((_, i) => i).filter((i) => labels[i] !== '...'),
    check: (_values, _ctx, raw) => {
      const out: RuleViolation[] = [];
      labels.forEach((label, i) => {
        if (label === '...') return;
        if (!raw[i] || raw[i].trim() === '') {
          out.push(
            v(i, `required.${i}`, 'Pole wymagane', 'walidacja.wymagane', { label }),
          );
        }
      });
      return out;
    },
  };
}

/** `values[index] > 0` — the ".NET zle dane!" family, one rule per field group. */
export function nonZero(indices: number[], labels: string[]): Rule {
  return {
    id: `nonZero.${indices.join('-')}`,
    fields: indices,
    check: (values, _ctx, raw) => {
      const out: RuleViolation[] = [];
      for (const i of indices) {
        if (!raw[i] || raw[i].trim() === '') continue; // "required" covers empties
        if (values[i] <= 0) {
          out.push(
            v(
              i,
              `nonZero.${i}`,
              `Wartość ${fieldLetter(labels, i)} musi być większa od 0`,
              'walidacja.dodatni',
              { label: fieldLetter(labels, i) },
              { min: 1 },
            ),
          );
        }
      }
      return out;
    },
  };
}

/** Duct side within [100, sideMax(material)]. Port of CheckComboBox3. */
export function sideRange(index: number, labels: string[]): Rule {
  return {
    id: `side.${index}`,
    fields: [index],
    bounds: (_values, ctx) => [{ index, min: SIDE_MIN, max: sideMax(ctx.material) }],
    check: (values, ctx, raw) => {
      if (!raw[index] || raw[index].trim() === '') return null;
      const max = sideMax(ctx.material);
      const val = values[index];
      if (val < SIDE_MIN || val > max) {
        const label = fieldLetter(labels, index);
        return v(
          index,
          `${label}.side.range`,
          `Wartość ${label} poza zakresem (${SIDE_MIN}–${max} mm)`,
          'walidacja.pozaZakresem',
          { label, min: SIDE_MIN, max },
          { min: SIDE_MIN, max },
        );
      }
      return null;
    },
  };
}

/** Length within a per-shape window; chemo mode may tighten the upper bound. */
export function lengthRange(
  index: number,
  labels: string[],
  opts: { min?: number; max?: number; chemoMax?: number } = {},
): Rule {
  const min = opts.min ?? LENGTH_MIN;
  const max = opts.max ?? LENGTH_MAX;
  const upperFor = (ctx: ValidationContext) =>
    ctx.materialType === 'chemo' && opts.chemoMax != null
      ? Math.min(max, opts.chemoMax ?? LENGTH_MAX_CHEMO)
      : max;
  return {
    id: `length.${index}`,
    fields: [index],
    bounds: (_values, ctx) => [{ index, min, max: upperFor(ctx) }],
    check: (values, ctx, raw) => {
      if (!raw[index] || raw[index].trim() === '') return null;
      const upper = upperFor(ctx);
      const val = values[index];
      if (val < min || val > upper) {
        const label = fieldLetter(labels, index);
        return v(
          index,
          `${label}.range`,
          `Wartość ${label} poza zakresem (${min}–${upper} mm)`,
          'walidacja.pozaZakresem',
          { label, min, max: upper },
          { min, max: upper },
        );
      }
      return null;
    },
  };
}

/** Formed radius: exactly 0, or ≥ 100. When 0, `e` and `f` must be ≥ 50. */
export function radiusRule(rIndex: number, eIndex: number, fIndex: number, labels: string[]): Rule {
  return {
    id: `radius.${rIndex}`,
    fields: [rIndex, eIndex, fIndex],
    check: (values, _ctx, raw) => {
      if (!raw[rIndex] || raw[rIndex].trim() === '') return null;
      const out: RuleViolation[] = [];
      const r = values[rIndex];
      if (r > 0 && r < RADIUS_MIN) {
        out.push(
          v(
            rIndex,
            'r.range',
            'Promień musi być równy 0 lub co najmniej 100 mm',
            'walidacja.promien',
            {},
            { min: RADIUS_MIN },
          ),
        );
      }
      if (r === 0) {
        for (const i of [eIndex, fIndex]) {
          if (!raw[i] || raw[i].trim() === '') continue;
          if (values[i] < EF_MIN_NO_RADIUS) {
            const label = fieldLetter(labels, i);
            out.push(
              v(
                i,
                `${label}.efMinNoRadius`,
                `Przy promieniu 0 wartość ${label} musi być ≥ ${EF_MIN_NO_RADIUS} mm`,
                'walidacja.efBezPromienia',
                { label, min: EF_MIN_NO_RADIUS },
                { min: EF_MIN_NO_RADIUS },
              ),
            );
          }
        }
      }
      return out;
    },
  };
}

/** `e` / `f` minimums. Port of SprawdzEiF: ≥ 30, or ≥ r + 30 when a radius is given. */
export function efMin(
  eIndex: number,
  fIndex: number,
  labels: string[],
  rIndex?: number,
): Rule {
  const minFor = (values: number[]) => {
    const r = rIndex != null ? values[rIndex] : 0;
    return r > 0 ? r + EF_RADIUS_MARGIN : EF_MIN_FRAME;
  };
  return {
    id: `efMin.${eIndex}-${fIndex}`,
    fields: rIndex != null ? [eIndex, fIndex, rIndex] : [eIndex, fIndex],
    bounds: (values) => {
      const min = minFor(values);
      return [
        { index: eIndex, min },
        { index: fIndex, min },
      ];
    },
    check: (values, _ctx, raw) => {
      const out: RuleViolation[] = [];
      const min = minFor(values);
      for (const i of [eIndex, fIndex]) {
        if (!raw[i] || raw[i].trim() === '') continue;
        if (values[i] < min) {
          const label = fieldLetter(labels, i);
          out.push(
            v(
              i,
              `${label}.efMin`,
              `Zbyt mała wartość ${label} (min. ${min} mm)`,
              'walidacja.efMin',
              { label, min },
              { min },
            ),
          );
        }
      }
      return out;
    },
  };
}

/** Bend angle within [15, 90] (QBRa / QBR1a). */
export function alfaRange(index: number, labels: string[]): Rule {
  return {
    id: `alfa.${index}`,
    fields: [index],
    bounds: () => [{ index, min: ALFA_MIN, max: ALFA_MAX }],
    check: (values, _ctx, raw) => {
      if (!raw[index] || raw[index].trim() === '') return null;
      const val = values[index];
      if (val < ALFA_MIN || val > ALFA_MAX) {
        const label = fieldLetter(labels, index);
        return v(
          index,
          `${label}.alfa.range`,
          `Kąt ${label} musi mieścić się w zakresie ${ALFA_MIN}–${ALFA_MAX}°`,
          'walidacja.alfa',
          { label, min: ALFA_MIN, max: ALFA_MAX },
          { min: ALFA_MIN, max: ALFA_MAX },
        );
      }
      return null;
    },
  };
}

/**
 * Generic relational constraint. `ok(values)` returns true when the constraint
 * holds. `anchor` is the field index the error is attached to; `suggest` builds
 * the tooltip range from the current values.
 */
export function relation(
  ruleId: string,
  anchor: number,
  fields: number[],
  ok: (values: number[], ctx: ValidationContext) => boolean,
  message: string | ((values: number[]) => string),
  messageKey: string,
  suggest?: (values: number[], ctx: ValidationContext) => RuleViolation['suggest'],
): Rule {
  const siblings = fields.filter((i) => i !== anchor);
  return {
    id: ruleId,
    fields,
    bounds: (values, ctx) => {
      if (!suggest) return [];
      // sibling values drive the bound — don't compute it until they're set
      if (siblings.some((i) => values[i] <= 0)) return [];
      const s = suggest(values, ctx);
      if (!s || (s.min == null && s.max == null)) return [];
      return [{ index: anchor, min: s.min, max: s.max }];
    },
    check: (values, ctx, raw) => {
      // only evaluate once every referenced field has a value
      if (fields.some((i) => !raw[i] || raw[i].trim() === '')) return null;
      if (ok(values, ctx)) return null;
      return v(
        anchor,
        ruleId,
        typeof message === 'function' ? message(values) : message,
        messageKey,
        undefined,
        suggest ? suggest(values, ctx) : undefined,
      );
    },
  };
}
