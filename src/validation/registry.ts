// Per-shape rule lists. Field indices follow `src/data.ts` label order, which
// is identical to `dimensionValues` and the `tab` array used by
// `src/calculations.ts`. Relational rules are transcribed from the matching
// `if (symbol == "<SYM>")` block in Form1.cs — the .NET code frequently swaps
// the variable names `a`/`b` relative to the on-screen labels, so every rule
// here is expressed in terms of the *label letter* and carries a unit test with
// a known-violating input to guard against inversions.

import { SHAPE_DEFINITIONS } from '../data';
import type { Rule } from './types';
import {
  requiredAll,
  nonZero,
  sideRange,
  lengthRange,
  radiusRule,
  efMin,
  alfaRange,
  relation,
} from './factories';

/** Index of a label by its letter (case-insensitive, " [mm]" stripped). */
function ix(labels: string[], letter: string): number {
  const want = letter.toLowerCase();
  return labels.findIndex(
    (l) => l.replace(/\s*\[mm\]\s*/i, '').replace(/=.*/, '').trim().toLowerCase() === want,
  );
}

type Build = (labels: string[]) => Rule[];

const BUILDERS: Record<string, Build> = {
  QDa: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    lengthRange(ix(l, 'l'), l, { chemoMax: 1500 }),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'l')], l),
  ],

  QBa: (l) => qbLike(l, false),
  QBNa: (l) => [...qbLike(l, false), alfaRange(ix(l, 'alfa'), l)],
  QBFa: (l) => qbLike(l, false),

  QBFRa: (l) => [
    ...qbLike(l, true),
    relation(
      'QBFRa.b.leD',
      ix(l, 'b'),
      [ix(l, 'b'), ix(l, 'd')],
      (v) => v[ix(l, 'd')] >= v[ix(l, 'b')],
      '„b” nie może być większe od „d”',
      'walidacja.relacja.bLeD',
      (v) => ({ max: v[ix(l, 'd')] }),
    ),
  ],

  QBRa: (l) => [
    ...qbLike(l, true),
    alfaRange(ix(l, 'alfa'), l),
    // .NET: error when (label b) > (label d); message references b/d as drawn.
    relation(
      'QBRa.b.leD',
      ix(l, 'b'),
      [ix(l, 'b'), ix(l, 'd')],
      (v) => v[ix(l, 'b')] <= v[ix(l, 'd')],
      '„b” nie może być większe od „d”',
      'walidacja.relacja.bLeD',
      (v) => ({ max: v[ix(l, 'd')] }),
    ),
  ],

  QBR1a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    radiusRule(ix(l, 'r'), ix(l, 'e'), ix(l, 'f'), l),
    efMin(ix(l, 'e'), ix(l, 'f'), l),
    alfaRange(ix(l, 'alfa'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'e'), ix(l, 'f')], l),
    relation(
      'QBR1a.b.leD',
      ix(l, 'b'),
      [ix(l, 'b'), ix(l, 'd')],
      (v) => v[ix(l, 'b')] <= v[ix(l, 'd')],
      'Wymiar d musi być większy niż b',
      'walidacja.relacja.bLeD',
      (v) => ({ max: v[ix(l, 'd')] }),
    ),
  ],

  QESa: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'e')], l),
  ],

  QPR6a: (l) => reductionLike(l, { min: 100, max: 5000 }, ['c', 'd']),
  QPR2a: (l) => reductionLike(l, { min: 100, max: 5000 }, ['c', 'd']),
  PR1a: (l) => reductionLike(l, { min: 250, max: 5000 }, ['d']),
  PR7a: (l) => reductionLike(l, { min: 250, max: 5000 }, ['d']),
  QPR3a: (l) => reductionLike(l, { min: 100, max: 20000 }, []),
  QPR4a: (l) => reductionLike(l, { min: 100, max: 20000 }, ['d']),

  QD1a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    efMin(ix(l, 'e'), ix(l, 'f'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'e'), ix(l, 'f'), ix(l, 'l')], l),
  ],
  QD2a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    lengthRange(ix(l, 'l'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'l')], l),
  ],

  TR1a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    lengthRange(ix(l, 'l'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'l')], l),
    relation(
      'TR1a.d.leB',
      ix(l, 'd'),
      [ix(l, 'd'), ix(l, 'b')],
      (v) => v[ix(l, 'd')] <= v[ix(l, 'b')],
      'Wymiar b musi być większy lub równy d',
      'walidacja.relacja.dLeB',
      (v) => ({ max: v[ix(l, 'b')] }),
    ),
    relation(
      'TR1a.w.max',
      ix(l, 'w'),
      [ix(l, 'w'), ix(l, 'l')],
      (v) => v[ix(l, 'w')] <= v[ix(l, 'l')] - 60,
      (v) => `Zbyt duży wymiar w (max ${v[ix(l, 'l')] - 60} mm)`,
      'walidacja.relacja.wMax',
      (v) => ({ max: v[ix(l, 'l')] - 60 }),
    ),
  ],

  TR2a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    lengthRange(ix(l, 'l'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'l')], l),
    relation(
      'TR2a.d.max',
      ix(l, 'd'),
      [ix(l, 'd'), ix(l, 'b'), ix(l, 'l')],
      (v) => v[ix(l, 'd')] <= v[ix(l, 'b')] && v[ix(l, 'd')] <= v[ix(l, 'l')] - 60,
      (v) => `Zbyt duże d (max ${Math.min(v[ix(l, 'b')], v[ix(l, 'l')] - 60)} mm)`,
      'walidacja.relacja.dMax',
      (v) => ({ max: Math.min(v[ix(l, 'b')], v[ix(l, 'l')] - 60) }),
    ),
  ],

  TRa: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    lengthRange(ix(l, 'l'), l),
    radiusRule(ix(l, 'r'), ix(l, 'i'), ix(l, 'p'), l),
    radiusRule(ix(l, 'q'), ix(l, 'i'), ix(l, 'p'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'l')], l),
    relation(
      'TRa.d.leB',
      ix(l, 'd'),
      [ix(l, 'd'), ix(l, 'b')],
      (v) => v[ix(l, 'd')] <= v[ix(l, 'b')],
      'b musi być większe lub równe d',
      'walidacja.relacja.dLeB',
      (v) => ({ max: v[ix(l, 'b')] }),
    ),
    relation(
      'TRa.L.min',
      ix(l, 'l'),
      [ix(l, 'l'), ix(l, 'h'), ix(l, 'q'), ix(l, 'r'), ix(l, 'i')],
      (v) =>
        v[ix(l, 'l')] >=
        v[ix(l, 'h')] + v[ix(l, 'q')] + v[ix(l, 'r')] + v[ix(l, 'i')] + 30,
      (v) =>
        `Zbyt małe L (min. ${
          v[ix(l, 'h')] + v[ix(l, 'q')] + v[ix(l, 'r')] + v[ix(l, 'i')] + 30
        } mm)`,
      'walidacja.relacja.lMin',
      (v) => ({
        min: v[ix(l, 'h')] + v[ix(l, 'q')] + v[ix(l, 'r')] + v[ix(l, 'i')] + 30,
      }),
    ),
  ],

  TR3a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    radiusRule(ix(l, 'g'), ix(l, 'i'), ix(l, 'j'), l),
    radiusRule(ix(l, 'f'), ix(l, 'i'), ix(l, 'j'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'g'), ix(l, 'f')], l),
  ],

  TR4a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    radiusRule(ix(l, 'g'), ix(l, 'i'), ix(l, 'j'), l),
    efMin(ix(l, 'i'), ix(l, 'j'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'i'), ix(l, 'j')], l),
    relation(
      'TR4a.a.geC',
      ix(l, 'c'),
      [ix(l, 'a'), ix(l, 'c')],
      (v) => v[ix(l, 'a')] >= v[ix(l, 'c')],
      'a musi być większe lub równe c',
      'walidacja.relacja.aGeC',
      (v) => ({ max: v[ix(l, 'a')] }),
    ),
    relation(
      'TR4a.L.min',
      ix(l, 'l'),
      [ix(l, 'l'), ix(l, 'd'), ix(l, 'g'), ix(l, 'i')],
      (v) =>
        v[ix(l, 'l')] === 100 ||
        v[ix(l, 'l')] >= v[ix(l, 'd')] + v[ix(l, 'g')] + 60 + v[ix(l, 'i')],
      (v) =>
        `Zbyt małe L (min. ${
          v[ix(l, 'd')] + v[ix(l, 'g')] + 60 + v[ix(l, 'i')]
        } mm)`,
      'walidacja.relacja.lMin',
      (v) => ({ min: v[ix(l, 'd')] + v[ix(l, 'g')] + 60 + v[ix(l, 'i')] }),
    ),
  ],

  TR5a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    lengthRange(ix(l, 'l'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'l')], l),
  ],

  TR6a: (l) => [
    sideRange(ix(l, 'a'), l),
    lengthRange(ix(l, 'l'), l),
    nonZero([ix(l, 'a'), ix(l, 'l')], l),
    relation(
      'TR6a.f.leA',
      ix(l, 'f'),
      [ix(l, 'f'), ix(l, 'a')],
      (v) => v[ix(l, 'f')] <= v[ix(l, 'a')],
      (v) => `Zbyt duże f (max ${v[ix(l, 'a')]} mm)`,
      'walidacja.relacja.fMax',
      (v) => ({ max: v[ix(l, 'a')] }),
    ),
    relation(
      'TR6a.L.min',
      ix(l, 'l'),
      [ix(l, 'l'), ix(l, 'e')],
      (v) => v[ix(l, 'l')] >= v[ix(l, 'e')] + 100,
      (v) => `Zbyt małe L (min. ${v[ix(l, 'e')] + 100} mm)`,
      'walidacja.relacja.lMin',
      (v) => ({ min: v[ix(l, 'e')] + 100 }),
    ),
  ],

  TR7a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    radiusRule(ix(l, 'r'), ix(l, 'i'), ix(l, 'j'), l),
    radiusRule(ix(l, 'q'), ix(l, 'i'), ix(l, 'j'), l),
    efMin(ix(l, 'i'), ix(l, 'j'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'i'), ix(l, 'j')], l),
    relation(
      'TR7a.b.ltD',
      ix(l, 'b'),
      [ix(l, 'b'), ix(l, 'd')],
      (v) => v[ix(l, 'b')] < v[ix(l, 'd')],
      '„d” musi być większe od „b”',
      'walidacja.relacja.bLtD',
      (v) => ({ max: v[ix(l, 'd')] - 1 }),
    ),
  ],

  TR8a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    lengthRange(ix(l, 'l'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'l')], l),
    relation(
      'TR8a.w.max',
      ix(l, 'w'),
      [ix(l, 'w'), ix(l, 'l')],
      (v) => v[ix(l, 'w')] <= v[ix(l, 'l')] - 60,
      (v) => `Zbyt duży wymiar w (max ${v[ix(l, 'l')] - 60} mm)`,
      'walidacja.relacja.wMax',
      (v) => ({ max: v[ix(l, 'l')] - 60 }),
    ),
    relation(
      'TR8a.g.ltD',
      ix(l, 'g'),
      [ix(l, 'g'), ix(l, 'd')],
      (v) => v[ix(l, 'g')] < v[ix(l, 'd')],
      'g musi być mniejsze niż d',
      'walidacja.relacja.gLtD',
      (v) => ({ max: v[ix(l, 'd')] - 1 }),
    ),
  ],

  TR9a: (l) => [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    lengthRange(ix(l, 'l'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'l')], l),
    relation(
      'TR9a.d1.max',
      ix(l, 'd1'),
      [ix(l, 'd1'), ix(l, 'l')],
      (v) => v[ix(l, 'd1')] <= v[ix(l, 'l')] - 60,
      (v) => `Wartość d1 poza zakresem (max ${v[ix(l, 'l')] - 60} mm)`,
      'walidacja.pozaZakresem',
      (v) => ({ max: v[ix(l, 'l')] - 60 }),
    ),
    relation(
      'TR9a.d1.ltD',
      ix(l, 'd1'),
      [ix(l, 'd1'), ix(l, 'd')],
      (v) => v[ix(l, 'd1')] < v[ix(l, 'd')],
      'd1 musi być mniejsze niż d',
      'walidacja.relacja.d1LtD',
      (v) => ({ max: v[ix(l, 'd')] - 1 }),
    ),
    relation(
      'TR9a.d1.ltB',
      ix(l, 'd1'),
      [ix(l, 'd1'), ix(l, 'b')],
      (v) => v[ix(l, 'd1')] < v[ix(l, 'b')],
      'd1 musi być mniejsze niż b',
      'walidacja.relacja.d1LtB',
      (v) => ({ max: v[ix(l, 'b')] - 1 }),
    ),
  ],

  CZ1a: (l) => crossLike(l, 'w', 'w1'),
  CZ2a: (l) => crossLike(l, 'd', 'd1'),
};

/** QBa / QBNa / QBFa / QBFRa / QBRa share this core. */
function qbLike(l: string[], withRadiusMargin: boolean): Rule[] {
  const rules: Rule[] = [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    radiusRule(ix(l, 'r'), ix(l, 'e'), ix(l, 'f'), l),
    efMin(ix(l, 'e'), ix(l, 'f'), l),
    nonZero([ix(l, 'a'), ix(l, 'b'), ix(l, 'e'), ix(l, 'f')], l),
  ];
  if (withRadiusMargin) {
    rules.push(efMin(ix(l, 'e'), ix(l, 'f'), l, ix(l, 'r')));
  }
  return rules;
}

/** QPR* / PR* rectangular reductions. */
function reductionLike(
  l: string[],
  len: { min: number; max: number },
  extraPositive: string[],
): Rule[] {
  return [
    sideRange(ix(l, 'a'), l),
    sideRange(ix(l, 'b'), l),
    lengthRange(ix(l, 'l'), l, { min: len.min, max: len.max }),
    nonZero(
      [ix(l, 'a'), ix(l, 'b'), ix(l, 'l'), ...extraPositive.map((x) => ix(l, x))].filter(
        (i) => i >= 0,
      ),
      l,
    ),
  ];
}

/** CZ1a / CZ2a crosses. `wKey`/`w1Key` are the branch depths (w/w1 or d/d1). */
function crossLike(l: string[], wKey: string, w1Key: string): Rule[] {
  const b = ix(l, 'b');
  const d = ix(l, 'd');
  const d1 = ix(l, 'd1');
  const L = ix(l, 'l');
  const w = ix(l, wKey);
  const w1 = ix(l, w1Key);
  return [
    sideRange(ix(l, 'a'), l),
    sideRange(b, l),
    lengthRange(L, l),
    nonZero([ix(l, 'a'), b, L], l),
    relation(
      'CZ.b.geD',
      d,
      [b, d],
      (v) => v[b] >= v[d],
      'Wymiar b musi być większy lub równy d',
      'walidacja.relacja.bGeD',
      (v) => ({ max: v[b] }),
    ),
    relation(
      'CZ.b.geD1',
      d1,
      [b, d1],
      (v) => v[b] >= v[d1],
      'Wymiar b musi być większy lub równy d1',
      'walidacja.relacja.bGeD1',
      (v) => ({ max: v[b] }),
    ),
    relation(
      'CZ.L.min',
      L,
      [L, w, w1],
      (v) => v[L] >= Math.max(v[w], v[w1]) + 60,
      (v) => `Zbyt małe L (min. ${Math.max(v[w], v[w1]) + 60} mm)`,
      'walidacja.relacja.lMin',
      (v) => ({ min: Math.max(v[w], v[w1]) + 60 }),
    ),
  ];
}

/** SYMBOL -> compiled Rule[]. Every shape in `data.ts` gets an entry. */
export const RULES: Record<string, Rule[]> = Object.fromEntries(
  SHAPE_DEFINITIONS.map((def) => {
    const build = BUILDERS[def.symbol];
    const rules: Rule[] = [requiredAll(def.labels)];
    if (build) rules.push(...build(def.labels).filter((r) => r.fields.every((i) => i >= 0)));
    return [def.symbol, rules];
  }),
);
