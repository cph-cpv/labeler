export type FastqDilution =
  | "1:1"
  | "1:2"
  | "1:10"
  | "1:20"
  | "1:25"
  | "1:50"
  | "1:100"
  | "1:200";

export const DILUTIONS: FastqDilution[] = [
  "1:1",
  "1:2",
  "1:10",
  "1:20",
  "1:25",
  "1:50",
  "1:100",
  "1:200",
];

export function isValidDilution(value: string): boolean {
  return DILUTIONS.includes(value as FastqDilution);
}

export function formatDilution(factor?: string): string {
  return factor || "";
}

/**
 * Parses a string value into a valid FastqDilution or null.
 * Returns null for empty strings or invalid dilution values.
 * Valid dilution factors are: "1:1", "1:2", "1:10", "1:20", "1:25", "1:50", "1:100", "1:200".
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
