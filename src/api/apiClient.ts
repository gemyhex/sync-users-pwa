import axios, { AxiosInstance } from 'axios';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function decryptEnvelope(envelope: { d: string; t: string; n: string }): Promise<any> {
  const decodedD = base64ToBytes(envelope.d); // Uint8Array
  const ivBytes = base64ToBytes(envelope.n);   // Uint8Array
  const tagBytes = base64ToBytes(envelope.t);  // Uint8Array

  // first 16 bytes = AES-128 key (use 32 for AES-256 if server uses that)
  const keyBytes = decodedD.slice(0, 16); // Uint8Array

  // rest of d = ciphertext body
  const ciphertextBody = decodedD.slice(16); // Uint8Array

  // append tag to ciphertext (GCM expects tag appended at end)
  const fullCiphertext = new Uint8Array(ciphertextBody.length + tagBytes.length);
  fullCiphertext.set(ciphertextBody, 0);
  fullCiphertext.set(tagBytes, ciphertextBody.length);

  // importKey accepts ArrayBuffer | ArrayBufferView; pass the Uint8Array directly
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);

  // Make copies as Uint8Array (ArrayBufferView), which is a valid BufferSource and satisfies TS
  const ivForCrypto = new Uint8Array(ivBytes);           // ArrayBufferView
  const ciphertextForCrypto = new Uint8Array(fullCiphertext); // ArrayBufferView

  // decrypt accepts BufferSource (ArrayBuffer or ArrayBufferView). Passing Uint8Array satisfies TS.
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivForCrypto },
    key,
    ciphertextForCrypto
  );

  const plaintext = new TextDecoder().decode(decryptedBuffer);
  try {
    return JSON.parse(plaintext);
  } catch {
    return plaintext;
  }
}


async function getFetchJson(url: string) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`);
  if (!res.ok) throw new Error(`API request failed: ${res.statusText}`);
  const json = await res.json();

  if (!json?.data || !json?.data?.d) {
    console.warn('[apiClient] Unexpected API format:', json);
    throw new Error('Invalid envelope format');
  }

  return json.data;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL = import.meta.env.VITE_API_BASE_URL || 'https://calls.trolley.systems/api') {
    this.client = axios.create({ baseURL });
  }

  private async maybeDecrypt(res: any) {
    const data = res?.data;
    if (data?.d && data?.t && data?.n) {
      return decryptEnvelope(data);
    }
    if (data?.data?.d && data?.data?.t && data?.data?.n) {
      return decryptEnvelope(data.data);
    }
    return data;
  }

  async getDecrypted<T = any>(url: string): Promise<T> {
    const res = await this.client.get(url);
    return this.maybeDecrypt(res);
  }

  async postDecrypted<T = any>(url: string, body?: any): Promise<T> {
    const res = await this.client.post(url, body);
    return this.maybeDecrypt(res);
  }

  // legacy helper if you were using raw fetch elsewhere
  async fetchGetRaw(url: string) {
    return getFetchJson(url);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
