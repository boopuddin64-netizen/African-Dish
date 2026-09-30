/** Collision-resistant identifiers (crypto.randomUUID; falls back to getRandomValues for very old runtimes). */
export function generateId(prefix: string): string {
  const c: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === 'function') return `${prefix}_${c.randomUUID()}`;
  const bytes = new Uint8Array(16);
  c!.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}
