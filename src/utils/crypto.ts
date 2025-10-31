export function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
export function bytesToB64(bytes: Uint8Array) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

export async function deriveKeyPBKDF2(password: string, saltB64: string, iterations = 120000, length = 32) {
  // returns base64 derived key
  const enc = new TextEncoder().encode(password);
  const salt = b64ToBytes(saltB64);
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    length * 8 // bits
  );
  return bytesToB64(new Uint8Array(derivedBits));
}

export function genSaltB64(len = 16) {
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  return bytesToB64(a);
}
