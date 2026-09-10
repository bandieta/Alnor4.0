// Validation module — public types.
//
// The rules are a port of the per-shape dimension checks in the legacy .NET
// WinForms app (`AlnorIzoChemoUpdate_repo/AlnorCAM/projekto/Form1.cs`). See
// `docs/REGULY_WALIDACJI.md` for the human-readable rule catalogue.

export type ViolationScope = 'dimension' | 'property';

/** Suggested value range for the click-to-apply tooltip chips. */
export interface Suggestion {
  min?: number;
  max?: number;
}

export interface RuleViolation {
  /** Dimension field index (matches `data.ts` label order / `dimensionValues` / the `tab` array). -1 for property scope. */
  index: number;
  /** Property key for `scope === 'property'` (e.g. `ramkiWL`). */
  field?: string;
  /** Stable id, e.g. `QDa.L.range` — referenced by unit tests and the docs. */
  ruleId: string;
  scope: ViolationScope;
  /** Ready-to-display Polish message. */
  message: string;
  /** i18n key + params, for future translation (the app currently shows `message`). */
  messageKey: string;
  params?: Record<string, string | number>;
  /** Drives the lower/upper chips shown in the field tooltip. */
  suggest?: Suggestion;
}

export interface ValidationContext {
  /** 'Ocynk' | 'Kwasówka' | 'Aluminium' for sheet metal, or the chemo material. */
  material: string;
  materialType: 'blacha' | 'chemo';
  wykonanie?: string;
  klasaSzczelnosci?: string;
  blacha?: string;
  ramki?: { wl?: string; wyl?: string; od?: string };
}

export interface ShapeValidationResult {
  violations: RuleViolation[];
  dimensionErrors: RuleViolation[];
  propertyErrors: RuleViolation[];
  valid: boolean;
}

/** An effective numeric bound on a single dimension field. */
export interface FieldBound {
  index: number;
  min?: number;
  max?: number;
}

export interface Rule {
  id: string;
  /** Dimension indices this rule concerns (for docs / field focus). */
  fields: number[];
  /**
   * @param values numeric values (`parseFloat(raw) || 0`)
   * @param ctx    material / execution context
   * @param raw    raw string values (to tell "empty" from "0")
   */
  check: (
    values: number[],
    ctx: ValidationContext,
    raw: string[],
  ) => RuleViolation | RuleViolation[] | null;
  /**
   * Effective min/max this rule imposes on its field(s) given the current
   * sibling values — used to constrain the input (clamp on blur, show a range
   * hint). Return `[]` when no numeric bound applies (e.g. the radius "0 or ≥100"
   * rule, or a relation whose siblings aren't filled in yet).
   */
  bounds?: (values: number[], ctx: ValidationContext) => FieldBound[];
}

/** Effective {min,max} per dimension field index. */
export type FieldConstraints = Record<number, { min?: number; max?: number }>;
