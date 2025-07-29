import type { FastqQuality } from "@/lib/quality.ts";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function validateQuality(value: number): FastqQuality {
  if (value >= 1 && value <= 5) {
    return value.toString() as FastqQuality;
  }
  throw new Error(`Invalid quality value: ${value}. Must be between 1 and 5.`);
}

/**
 * Guesses a sample name from a FASTQ filename by stripping out sequencing metadata.
 *
 * @param fastqName - The FASTQ filename to parse
 * @returns The guessed sample name
 */
export function guessSampleName(fastqName: string): string {
  // Remove file extension if present
  const nameWithoutExt = fastqName.replace(/\.(fastq|fq)(\.gz)?$/i, "");

  // Remove common FASTQ sequencing patterns:
  // _S\d+ (sample number), _L\d+ (lane), _R[12] (read direction), _\d+ (file number)
  return nameWithoutExt.replace(/_S\d+.*$/, "");
}

/**
 * Attempts to find a common sample name from an array of FASTQ filenames.
 *
 * @param fastqNames - Array of FASTQ filenames to analyze
 * @returns The common sample name if all files have the same sample name, undefined if inconsistent
 */
export function guessCommonSampleName(
  fastqNames: string[],
): string | undefined {
  if (fastqNames.length === 0) return undefined;

  const sampleNames = fastqNames.map(guessSampleName);
  const firstSampleName = sampleNames[0];

  // Check if all sample names are the same
  const allSame = sampleNames.every((name) => name === firstSampleName);

  return allSame ? firstSampleName : undefined;
}

/**
 * Gets the common value from an array of items if all items have the same value for a field.
 *
 * @param items - Array of items to check
 * @param fieldName - Name of the field to check
 * @returns The common value if all items have the same value, null otherwise
 */
export function getCommonValue<T, K extends keyof T>(
  items: T[],
  fieldName: K,
): T[K] | null {
  if (items.length === 0) return null;
  const firstValue = items[0][fieldName];
  return items.every((item) => item[fieldName] === firstValue)
    ? firstValue
    : null;
}
