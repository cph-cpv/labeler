import type { Sample, SampleExpanded } from "@/types.ts";

export function formatSamples(samples: SampleExpanded[]): Sample[] {
  return samples.map((sample) => {
    return {
      ...sample,
      viruses: sample.expand?.viruses ? sample.expand.viruses : [],
      fastqs: sample.expand?.fastqs_via_sample
        ? sample.expand.fastqs_via_sample
        : [],
    };
  });
}
