// Hand-rolled XML read/write for the legacy wire format — no DOMParser/
// XMLSerializer, so this behaves identically under Vitest (node) and the
// browser/Playwright. The shape is fixed and flat (see ksztaltka.cs), so a
// small tag-scanning parser is simpler and more predictable than pulling in
// a DOM implementation just for this.
//
// Mirrors `AlnorIzoChemoUpdate_repo/AlnorCAM/projekto/ksztaltka.cs` — a plain
// field bag serialized by .NET's XmlSerializer as `List<ksztaltka>`. Field
// *names* below must match the C# field names verbatim; declaration order is
// kept the same for readability but isn't load-bearing (XmlSerializer.
// Deserialize matches elements by name, not position).
import type { Ksztaltka } from '../types';

// .NET's XmlSerializer default root for `List<T>` is "ArrayOf" + T's exact,
// case-preserved CLR type name (no [XmlType]/[XmlRoot] override exists on the
// legacy `ksztaltka` class, which is declared all-lowercase) — so this must
// be "ArrayOfksztaltka", not the more natural-looking "ArrayOfKsztaltka".
// Getting the case wrong would make the real .NET app's XmlSerializer.
// Deserialize reject files this app exports.
export const ROOT_TAG = 'ArrayOfksztaltka';
const RECORD_TAG = 'ksztaltka';
const TAB_LENGTH = 17;

type FieldType = 'string' | 'bool';

const FIELDS: [keyof Ksztaltka, FieldType][] = [
  ['obcy', 'bool'],
  ['symbol', 'string'],
  ['oznaczenie', 'string'],
  ['nazwa', 'string'],
  ['sztuk', 'string'],
  ['uwagi', 'string'],
  ['przekroj', 'string'],
  ['material', 'string'],
  ['materialChemo', 'string'],
  ['gruboscChemo', 'string'],
  ['wykonanieChemo', 'string'],
  ['isChemo', 'bool'],
  ['Qnazwa', 'string'],
  ['Qzamawia', 'string'],
  ['Qdata', 'string'],
  ['blacha', 'string'],
  ['wykonanie', 'string'],
  ['klasa_szczelnosci', 'string'],
  ['l_wzmoc', 'string'],
  ['ramkawl', 'string'],
  ['ramkawyl', 'string'],
  ['ramkaod', 'string'],
  ['powierznia', 'string'],
  ['powierzniaIz', 'string'],
  ['pelny_symbol', 'string'],
  ['pelny_symbolIz', 'string'],
  ['izolowana', 'bool'],
  ['plaszcz', 'string'],
  ['gruboscIlozacji', 'string'],
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function elementXml(tag: string, text: string): string {
  return text === '' ? `<${tag} />` : `<${tag}>${escapeXml(text)}</${tag}>`;
}

/** All top-level `<tag>...</tag>` / `<tag />` occurrences' inner text (unescaped). */
function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?(?:/>|>([\\s\\S]*?)</${tag}>)`, 'g');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    out.push(m[1] !== undefined ? unescapeXml(m[1]) : '');
  }
  return out;
}

function extractOne(xml: string, tag: string): string {
  const [first] = extractAll(xml, tag);
  return first ?? '';
}

function serializeKsztaltka(k: Ksztaltka): string {
  const fieldsXml = FIELDS.map(([field, type]) => {
    const value = k[field];
    return type === 'bool' ? `<${field}>${value ? 'true' : 'false'}</${field}>` : elementXml(field, String(value ?? ''));
  }).join('');
  const tab = k.tab ?? [];
  const tabXml = Array.from({ length: TAB_LENGTH }, (_, i) => elementXml('string', tab[i] ?? '')).join('');
  return `<${RECORD_TAG}>${fieldsXml}<tab>${tabXml}</tab></${RECORD_TAG}>`;
}

export function serializeKsztaltkaList(rows: Ksztaltka[]): string {
  const body = rows.map(serializeKsztaltka).join('');
  return (
    `<?xml version="1.0" encoding="utf-16"?>\r\n` +
    `<${ROOT_TAG} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">` +
    `${body}</${ROOT_TAG}>`
  );
}

function parseKsztaltka(body: string): Ksztaltka {
  const k = {} as Ksztaltka;
  for (const [field, type] of FIELDS) {
    const raw = extractOne(body, field as string);
    (k as unknown as Record<string, unknown>)[field] = type === 'bool' ? raw === 'true' : raw;
  }
  const tab = extractAll(extractOne(body, 'tab'), 'string');
  while (tab.length < TAB_LENGTH) tab.push('');
  k.tab = tab.slice(0, TAB_LENGTH);
  return k;
}

export function parseKsztaltkaList(xml: string): Ksztaltka[] {
  return extractAll(xml, RECORD_TAG).map(parseKsztaltka);
}
