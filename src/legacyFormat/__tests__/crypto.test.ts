import { describe, it, expect } from 'vitest';
import { createCipheriv } from 'node:crypto';
import { encryptLegacy, decryptLegacy, utf16leBytes, utf16leToString } from '../crypto';

// Independent oracle: Node's own AES-128-CBC/PKCS7 implementation, keyed the
// same way as the legacy .NET app (see crypto.ts), used to confirm our
// Web Crypto usage matches the standard rather than just round-tripping
// against itself.
const KEY_IV = Buffer.from(utf16leBytes('dupazbit'));

function nodeEncrypt(plaintext: Buffer): Buffer {
  const cipher = createCipheriv('aes-128-cbc', KEY_IV, KEY_IV);
  return Buffer.concat([cipher.update(plaintext), cipher.final()]);
}

describe('legacy AES-128-CBC crypto', () => {
  it('matches an independent AES-128-CBC/PKCS7 implementation', async () => {
    const plaintext = utf16leBytes('<hello>world</hello>');
    const expected = nodeEncrypt(Buffer.from(plaintext));
    const actual = Buffer.from(await encryptLegacy(plaintext));
    expect(actual.equals(expected)).toBe(true);
  });

  it('decrypts ciphertext produced by the independent implementation', async () => {
    const plaintext = Buffer.from(utf16leBytes('round trip via node:crypto'));
    const ciphertext = nodeEncrypt(plaintext);
    const decrypted = Buffer.from(await decryptLegacy(ciphertext));
    expect(decrypted.equals(plaintext)).toBe(true);
  });

  it.each([
    ['empty', ''],
    ['short', 'a'],
    ['multi-kb', 'x'.repeat(5000)],
  ])('round-trips %s payloads through encryptLegacy/decryptLegacy', async (_name, text) => {
    const plaintext = utf16leBytes(text);
    const cipher = await encryptLegacy(plaintext);
    const roundTripped = await decryptLegacy(cipher);
    expect(utf16leToString(roundTripped)).toBe(text);
  });

  it('rejects ciphertext encrypted with a different key', async () => {
    const cipher = createCipheriv('aes-128-cbc', Buffer.alloc(16, 1), Buffer.alloc(16, 1));
    const bogus = Buffer.concat([cipher.update('not legacy data'), cipher.final()]);
    await expect(decryptLegacy(bogus)).rejects.toThrow();
  });
});
