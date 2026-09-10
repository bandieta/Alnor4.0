// Numeric limits shared by the validation rules.
// Ported from Form1.cs: CheckComboBox3 (L27827), sprawdz_Pormien (L148),
// SprawdzEiF (L27840), the per-shape `l < .. || l > ..` range checks, and
// sprawdz_standard_ramek1..3 (L11220).

/** Minimum duct side (a / b …). CheckComboBox3. */
export const SIDE_MIN = 100;

/** Maximum duct side by material. CheckComboBox3: Ocynk 4000, otherwise 2501. */
export function sideMax(material: string): number {
  return material === 'Ocynk' ? 4000 : 2501;
}

/** Default length window (most shapes): `l < 100 || l > 20000`. */
export const LENGTH_MIN = 100;
export const LENGTH_MAX = 20000;
/** Chemo mode caps QDa length at 1500. */
export const LENGTH_MAX_CHEMO = 1500;

/**
 * Formed-radius rule (sprawdz_Pormien): a radius must be exactly 0 or ≥ 100.
 * QBa additionally snaps `r < 100` to 0 before drawing, so the effective
 * constraint the user sees is "0 or ≥ 100".
 */
export const RADIUS_MIN = 100;

/** When the radius is 0, both `e` and `f` must be ≥ 50 (sprawdz_Pormien). */
export const EF_MIN_NO_RADIUS = 50;

/** With a frame, `e` / `f` must be ≥ 30 (SprawdzEiF). */
export const EF_MIN_FRAME = 30;

/** With a radius, `e` / `f` must be ≥ r + 30 (SprawdzEiF overload). */
export const EF_RADIUS_MARGIN = 30;

/** Bend-angle window used by QBRa / QBR1a (`alfa > 90` / `alfa < 15`). */
export const ALFA_MIN = 15;
export const ALFA_MAX = 90;

/** Frame extension left on the flange, by pressure band — sprawdz_standard_ramek. */
export const FRAME_BANDS: { maxSide: number; frame: string }[] = [
  { maxSide: 1000, frame: 'P20' },
  { maxSide: 2500, frame: 'P30' },
  { maxSide: Infinity, frame: 'P40' },
];

/** Required sheet thickness (sprawdz_standard_blachy, L11106). Keyed by material + wykonanie. */
export interface ThicknessBand {
  minSide: number;
  maxSide: number;
  grubosc: string;
}
export const THICKNESS_TABLE: Record<string, ThicknessBand[]> = {
  'Ocynk|Niskociśnieniowe': [
    { minSide: 100, maxSide: 500, grubosc: '0,6' },
    { minSide: 501, maxSide: 1000, grubosc: '0,8' },
    { minSide: 1001, maxSide: 2000, grubosc: '1,0' },
    { minSide: 2001, maxSide: 4000, grubosc: '1,1' },
  ],
  'Ocynk|Średniociśnieniowe': [
    { minSide: 100, maxSide: 500, grubosc: '0,7' },
    { minSide: 501, maxSide: 1000, grubosc: '0,9' },
    { minSide: 1001, maxSide: 2000, grubosc: '1,1' },
    { minSide: 2001, maxSide: 4000, grubosc: '1,2' },
  ],
  'Kwasówka|': [
    { minSide: 100, maxSide: 1000, grubosc: '0,6' },
    { minSide: 1001, maxSide: 2501, grubosc: '0,8' },
  ],
  'Aluminium|': [{ minSide: 100, maxSide: 2501, grubosc: '0,8' }],
};
