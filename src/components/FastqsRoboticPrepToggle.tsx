import { Switch } from "@/components/ui/switch.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq } from "@/types";

type FastqsRoboticPrepToggleProps = {
  fastq: Fastq;
};

export function FastqsRoboticPrepToggle({
  fastq,
}: FastqsRoboticPrepToggleProps) {
  const { update } = usePocketBaseMutation<Fastq>("fastqs");

  function handleCheckedChange(value: boolean) {
    update({
      id: fastq.id,
      data: { robotic_prep: value },
    });
  }

  return (
    <Switch
      checked={fastq.robotic_prep}
      onCheckedChange={handleCheckedChange}
      aria-label={`Toggle robotic prep for ${fastq.name}`}
    />
  );
}
