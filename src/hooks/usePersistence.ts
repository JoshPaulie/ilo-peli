import { useEffect } from 'react';

export function usePersistence<T>(key: string, value: T) {
  useEffect(() => {
    if (typeof value === 'object' && value instanceof Set) {
      localStorage.setItem(key, JSON.stringify(Array.from(value)));
    } else if (typeof value === 'object' && value !== null) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, String(value));
    }
  }, [key, value]);
}

export function getStoredValue<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

export function getStoredNumber(key: string, defaultValue: number): number {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  const parsed = parseInt(stored, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function getStoredString(key: string, defaultValue: string): string {
  return localStorage.getItem(key) || defaultValue;
}

export function getStoredBoolean(key: string, defaultValue: boolean): boolean {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
}

export function getStoredSet(key: string): Set<string> {
  const stored = localStorage.getItem(key);
  return stored ? new Set(JSON.parse(stored)) : new Set();
}
