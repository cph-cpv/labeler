export function isMainModule(): boolean {
  if (typeof process === "undefined" || !process.argv[1]) return false;
  return import.meta.url.includes('reset_collections.ts') && process.argv[1].includes('reset_collections.ts');
}
