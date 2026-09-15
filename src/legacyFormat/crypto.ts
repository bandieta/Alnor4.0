// AES-128-CBC (PKCS7), key = IV = the UTF-16LE bytes of the legacy .NET app's
// hard-coded password. Ported from AlnorIzoChemoUpdate_repo/AlnorCAM/projekto/
// Form1.cs (button3_Click / button2_Click): a RijndaelManaged is keyed with
// `new UnicodeEncoding().GetBytes("dupazbit")` used as *both* Key and IV.
// UnicodeEncoding is UTF-16LE, so 8 ASCII chars -> exactly 16 bytes, which
// auto-selects Rijndael's 128-bit key size; its default block size (128 bit)
// is unchanged, so the whole scheme reduces to plain AES-128-CBC.
const PASSWORD = 'dupazbit';

export function utf16leBytes(s: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(s.length * 2);
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    bytes[i * 2] = code & 0xff;
    bytes[i * 2 + 1] = (code >> 8) & 0xff;
  }
  return bytes;
}

export function utf16leToString(bytes: Uint8Array<ArrayBufferLike>): string {
  let s = '';
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    s += String.fromCharCode(bytes[i] | (bytes[i + 1] << 8));
  }
  return s;
}

const KEY_IV = utf16leBytes(PASSWORD);

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', KEY_IV, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
}

export async function encryptLegacy(plaintext: Uint8Array<ArrayBuffer>): Promise<ArrayBuffer> {
  const key = await importKey();
  return crypto.subtle.encrypt({ name: 'AES-CBC', iv: KEY_IV }, key, plaintext);
}

/** Throws (padding/OperationError) if `ciphertext` wasn't produced with this key/IV. */
export async function decryptLegacy(ciphertext: ArrayBuffer): Promise<Uint8Array<ArrayBuffer>> {
  const key = await importKey();
  const plain = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: KEY_IV }, key, ciphertext);
  return new Uint8Array(plain);
}
