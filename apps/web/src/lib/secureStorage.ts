import { StateStorage } from 'zustand/middleware';

const SECRET_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || 'keynest-secure-storage-key-2026';
const DEFAULT_EXPIRATION_MS = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds

// Custom synchronous RC4 encryption for client-side storage security
function rc4(key: string, str: string): string {
  const s: number[] = [];
  let j = 0;
  let x;
  let res = '';
  for (let i = 0; i < 256; i++) {
    s[i] = i;
  }
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
  }
  let i = 0;
  j = 0;
  for (let y = 0; y < str.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
    res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
  }
  return res;
}

export function encrypt(value: string): string {
  const encrypted = rc4(SECRET_KEY, value);
  if (typeof window !== 'undefined') {
    return window.btoa(unescape(encodeURIComponent(encrypted)));
  }
  return Buffer.from(encrypted, 'binary').toString('base64');
}

export function decrypt(encryptedB64: string): string {
  try {
    const encrypted = typeof window !== 'undefined'
      ? decodeURIComponent(escape(window.atob(encryptedB64)))
      : Buffer.from(encryptedB64, 'base64').toString('binary');
    return rc4(SECRET_KEY, encrypted);
  } catch (e) {
    return '';
  }
}

interface StoragePayload {
  value: string;
  expiresAt: number;
}

export const secureStorage: StateStorage & {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string, expirationMs?: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
} = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return null;

    const decrypted = decrypt(encryptedData);
    if (!decrypted) return null;

    try {
      const payload: StoragePayload = JSON.parse(decrypted);
      if (payload.expiresAt && Date.now() > payload.expiresAt) {
        // Expired! Clear the item
        localStorage.removeItem(key);
        return null;
      }
      return payload.value;
    } catch (e) {
      // Fallback for unencrypted / legacy keys or JSON parsing errors
      return null;
    }
  },

  setItem(key: string, value: string, expirationMs: number = DEFAULT_EXPIRATION_MS): void {
    if (typeof window === 'undefined') return;

    const payload: StoragePayload = {
      value,
      expiresAt: Date.now() + expirationMs,
    };

    const serialized = JSON.stringify(payload);
    const encrypted = encrypt(serialized);
    localStorage.setItem(key, encrypted);
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
};
