// Public entry point for the legacy-compatible project file format.
//
//   const blob = await exportProject(rows);          // -> AES-encrypted XML
//   const rows = await importProject(await file.arrayBuffer());
//
// This is the same file format the legacy WinForms app
// (AlnorIzoChemoUpdate_repo/AlnorCAM/projekto/Form1.cs) reads and writes, so
// files are interchangeable between the two apps.
import type { Ksztaltka } from '../types';
import { encryptLegacy, decryptLegacy, utf16leBytes, utf16leToString } from './crypto';
import { serializeKsztaltkaList, parseKsztaltkaList, ROOT_TAG } from './xml';

// .NET's XmlTextWriter(stream, Encoding.Unicode) emits a UTF-16LE BOM before
// the XML declaration; the legacy reader (XmlTextReader with no explicit
// encoding) relies on that BOM to detect UTF-16 vs. its UTF-8 default. Our
// own export must include it so the legacy app can read files back.
const BOM = '﻿';

export async function exportProject(rows: Ksztaltka[]): Promise<Blob> {
  const xml = BOM + serializeKsztaltkaList(rows);
  const cipher = await encryptLegacy(utf16leBytes(xml));
  return new Blob([cipher]);
}

/**
 * Throws if `bytes` isn't a legacy-format file (wrong key, or the decrypted
 * bytes aren't the expected XML shape). An empty project (0 shapes) is a
 * valid, non-throwing result — the `ArrayOfKsztaltka` wrapper is checked
 * instead of record count so it round-trips too.
 */
export async function importProject(bytes: ArrayBuffer): Promise<Ksztaltka[]> {
  const plain = await decryptLegacy(bytes);
  let xml = utf16leToString(plain);
  if (xml.charCodeAt(0) === 0xfeff) xml = xml.slice(1);
  if (!xml.includes(`<${ROOT_TAG}`)) throw new Error(`Decrypted file is not ${ROOT_TAG} XML`);
  return parseKsztaltkaList(xml);
}
