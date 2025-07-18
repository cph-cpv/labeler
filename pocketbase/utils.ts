export function isMainModule(): boolean {
  return import.meta.url === `file://${process.argv[1]}`;
}
