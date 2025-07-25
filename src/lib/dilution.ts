export type FastqDilution =
  | "1"
  | "2"
  | "10"
  | "20"
  | "25"
  | "50"
  | "100"
  | "200";

export const DILUTIONS: FastqDilution[] = [
  "1",
  "2",
  "10",
  "20",
  "25",
  "50",
  "100",
  "200",
];

export function isValidDilution(value: string): boolean {
  return DILUTIONS.includes(value as FastqDilution);
}

export function formatDilution(factor?: string): string {
  return `1:${factor}`;
}

/**
 * Parses a string value into a valid FastqDilution or null.
 * Returns null for empty strings or invalid dilution values.
 * Valid dilution factors are: "1", "2", "10", "20", "25", "50", "100", "200".
 *
 * @param value - The string value to parse
 * @returns The parsed FastqDilution value or null if invalid/empty
 */
export function parseDilution(value: string): FastqDilution | null {
  if (value === "") return null;
  return DILUTIONS.includes(value as FastqDilution)
    ? (value as FastqDilution)
    : null;
}
