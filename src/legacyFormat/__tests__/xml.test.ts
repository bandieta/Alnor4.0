import { describe, it, expect } from 'vitest';
import { serializeKsztaltkaList, parseKsztaltkaList, ROOT_TAG } from '../xml';
import type { Ksztaltka } from '../../types';

function makeKsztaltka(overrides: Partial<Ksztaltka> = {}): Ksztaltka {
  return {
    obcy: false,
    symbol: 'QDa',
    oznaczenie: '100',
    nazwa: 'Kanał prosty',
    sztuk: '2',
    uwagi: '',
    przekroj: '300x200',
    material: 'Ocynk',
    materialChemo: '',
    gruboscChemo: '',
    wykonanieChemo: '',
    isChemo: false,
    Qnazwa: '',
    Qzamawia: '',
    Qdata: '',
    blacha: '0,6',
    wykonanie: 'A',
    klasa_szczelnosci: 'A',
    l_wzmoc: '',
    ramkawl: '',
    ramkawyl: '',
    ramkaod: '',
    powierznia: '1.50',
    powierzniaIz: '',
    pelny_symbol: 'QDa-100',
    pelny_symbolIz: '',
    izolowana: false,
    plaszcz: '',
    gruboscIlozacji: '',
    tab: ['300', '200', '500', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ...overrides,
  };
}

describe('legacy XML serialization', () => {
  it('wraps records in the exact root .NET\'s XmlSerializer expects for List<ksztaltka>', () => {
    const xml = serializeKsztaltkaList([makeKsztaltka()]);
    expect(xml).toContain(`<${ROOT_TAG}`);
    // "ksztaltka" (the C# class) is declared all-lowercase, and XmlSerializer's
    // default List<T> root is "ArrayOf" + T's case-preserved name — NOT the
    // more natural-looking "ArrayOfKsztaltka".
    expect(ROOT_TAG).toBe('ArrayOfksztaltka');
    expect(xml).toContain('<ksztaltka>');
  });

  it('serializes booleans as lowercase true/false and every ksztaltka.cs field name verbatim', () => {
    const xml = serializeKsztaltkaList([makeKsztaltka({ obcy: true, isChemo: true, izolowana: true })]);
    for (const field of ['obcy', 'isChemo', 'izolowana']) {
      expect(xml).toMatch(new RegExp(`<${field}>true</${field}>`));
    }
    for (const field of [
      'symbol', 'oznaczenie', 'nazwa', 'sztuk', 'uwagi', 'przekroj', 'material',
      'materialChemo', 'gruboscChemo', 'wykonanieChemo', 'Qnazwa', 'Qzamawia', 'Qdata',
      'blacha', 'wykonanie', 'klasa_szczelnosci', 'l_wzmoc', 'ramkawl', 'ramkawyl', 'ramkaod',
      'powierznia', 'powierzniaIz', 'pelny_symbol', 'pelny_symbolIz', 'plaszcz', 'gruboscIlozacji',
    ]) {
      expect(xml).toContain(`<${field}`);
    }
  });

  it('serializes tab as exactly 17 <string> children', () => {
    const xml = serializeKsztaltkaList([makeKsztaltka()]);
    const tabMatch = xml.match(/<tab>([\s\S]*?)<\/tab>/);
    expect(tabMatch).not.toBeNull();
    const strings = tabMatch![1].match(/<string(?:\s[^>]*)?(?:\/>|>[\s\S]*?<\/string>)/g);
    expect(strings).toHaveLength(17);
  });

  it('escapes and unescapes XML-sensitive characters in free text fields', () => {
    const k = makeKsztaltka({ uwagi: 'a < b & "c" > d' });
    const xml = serializeKsztaltkaList([k]);
    expect(xml).not.toContain('a < b & "c" > d');
    const [parsed] = parseKsztaltkaList(xml);
    expect(parsed.uwagi).toBe('a < b & "c" > d');
  });

  it('round-trips every field of a full record', () => {
    const k = makeKsztaltka({
      obcy: true,
      isChemo: true,
      izolowana: true,
      materialChemo: 'PVC',
      plaszcz: 'Aluzinc',
      gruboscIlozacji: '40mm',
      tab: Array.from({ length: 17 }, (_, i) => String(i * 10)),
    });
    const xml = serializeKsztaltkaList([k]);
    const [parsed] = parseKsztaltkaList(xml);
    expect(parsed).toEqual(k);
  });

  it('round-trips multiple records and empty-string fields as self-closing tags', () => {
    const rows = [makeKsztaltka({ oznaczenie: '100' }), makeKsztaltka({ oznaczenie: '101', uwagi: '' })];
    const xml = serializeKsztaltkaList(rows);
    const parsed = parseKsztaltkaList(xml);
    expect(parsed).toEqual(rows);
  });

  it('returns an empty list for an empty input list', () => {
    expect(parseKsztaltkaList(serializeKsztaltkaList([]))).toEqual([]);
  });
});
