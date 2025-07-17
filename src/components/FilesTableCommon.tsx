import { formatDate } from "@/utils";
import type { Fastq } from "@/types.ts";
import { Link } from "@/components/ui/link.tsx";
import { UnknownText } from "@/components/ui/unknown-text.tsx";

export interface BaseFilesTableProps {
  fastqs: Fastq[];
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string) => void;
  onSelectAll: () => void;
}

export function FileCheckboxCell({ 
  fastq, 
  selectedFiles, 
  onFileSelect 
}: { 
  fastq: Fastq; 
  selectedFiles: Set<string>; 
  onFileSelect: (fileId: string) => void; 
}) {
  return (
    <label className="flex items-center justify-center cursor-pointer p-2">
      <input
        type="checkbox"
        checked={selectedFiles.has(fastq.id.toString())}
        onChange={() => onFileSelect(fastq.id.toString())}
        className="rounded"
        aria-label={`Select ${fastq.name}`}
      />
    </label>
  );
}

export function SelectAllCheckbox({ 
  selectedFiles, 
  fastqs, 
  onSelectAll 
}: { 
  selectedFiles: Set<string>; 
  fastqs: Fastq[]; 
  onSelectAll: () => void; 
}) {
  return (
    <label className="flex items-center justify-center cursor-pointer p-2">
      <input
        type="checkbox"
        checked={selectedFiles.size === fastqs.length && fastqs.length > 0}
        onChange={onSelectAll}
        className="rounded"
        aria-label="Select all files"
      />
    </label>
  );
}

export function FileNameCell({ fastq }: { fastq: Fastq }) {
  return (
    <Link 
      to="/files/$id" 
      params={{ id: fastq.id.toString() }}
    >
      {fastq.name}
    </Link>
  );
}

export function RunDateCell({ fastq }: { fastq: Fastq }) {
  return <span>{formatDate(fastq.timestamp)}</span>;
}

export function TypeCell({ fastq }: { fastq: Fastq }) {
  return (
    <>
      {fastq.type || <UnknownText>Unknown</UnknownText>}
    </>
  );
}

export function SampleCell() {
  return <UnknownText>Unassigned</UnknownText>;
}