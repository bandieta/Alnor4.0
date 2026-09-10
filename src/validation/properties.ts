// Property-scope checks: frame width (ramka) and sheet thickness (blacha).
// Ported from sprawdz_standard_ramek1..3 (Form1.cs L11220) and
// sprawdz_standard_blachy (L11106). These attach to the properties panel, not
// to a dimension field.

import type { RuleViolation, ValidationContext } from './types';
import { FRAME_BANDS, THICKNESS_TABLE } from './constants';

const FRAME_RANK: Record<string, number> = { P20: 20, P30: 30, P40: 40 };

/** Smallest frame allowed for the given max duct side. */
export function minFrameFor(maxSide: number): string {
  return FRAME_BANDS.find((b) => maxSide <= b.maxSide)?.frame ?? 'P40';
}

/**
 * @param maxSide  largest of the relevant duct sides
 * @param frames   current selections keyed by field name (`ramkiWL`, …)
 */
export function checkFrames(
  maxSide: number,
  frames: Record<string, string | undefined>,
): RuleViolation[] {
  if (!maxSide) return [];
  const min = minFrameFor(maxSide);
  const out: RuleViolation[] = [];
  for (const [field, value] of Object.entries(frames)) {
    if (!value) continue;
    if ((FRAME_RANK[value] ?? 0) < FRAME_RANK[min]) {
      out.push({
        index: -1,
        field,
        ruleId: `${field}.frame.min`,
        scope: 'property',
        message: `Za wąska ramka — minimum ${min} (największy bok ${maxSide} mm)`,
        messageKey: 'walidacja.ramkaZaWaska',
        params: { min, maxSide },
      });
    }
  }
  return out;
}

/** Advisory: the KOT-standard thickness for this side band / material / execution. */
export function checkThickness(
  maxSide: number,
  ctx: ValidationContext,
): RuleViolation[] {
  if (ctx.materialType === 'chemo' || !maxSide || !ctx.blacha) return [];
  const wykonanie = ctx.material === 'Ocynk' ? ctx.wykonanie ?? '' : '';
  const bands = THICKNESS_TABLE[`${ctx.material}|${wykonanie}`];
  if (!bands) return [];
  const band = bands.find((b) => maxSide >= b.minSide && maxSide <= b.maxSide);
  if (!band || band.grubosc === ctx.blacha) return [];
  return [
    {
      index: -1,
      field: 'blacha',
      ruleId: 'blacha.standard',
      scope: 'property',
      message: `Zalecana grubość blachy dla boku ${maxSide} mm to ${band.grubosc} mm`,
      messageKey: 'walidacja.blachaStandard',
      params: { maxSide, grubosc: band.grubosc },
    },
  ];
}
