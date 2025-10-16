import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import {
  type Exception,
  type ExceptionCreation,
  useExceptions,
} from "@/hooks/useExceptions.ts";
import {
  usePocketBaseCollection,
  usePocketBaseCreation,
  usePocketBaseMutation,
  usePocketBaseRecord,
} from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, SampleExpanded, Virus } from "@/types.ts";
import { useForm } from "@tanstack/react-form";
import { CircleAlert, Trash2 } from "lucide-react";
import { VisuallyHidden } from "radix-ui";

type ExceptionsProps = {
  sampleId: string;
  viruses: Virus[];
};

export function Exceptions({ sampleId, viruses }: ExceptionsProps) {
  const { exceptions, isLoading } = useExceptions(sampleId);

  const { data: expandedSample, isLoading: isLoadingSample } =
    usePocketBaseRecord<SampleExpanded>("samples", sampleId, {
      expand: "viruses",
    });

  const { data: fastqs, isLoading: isLoadingFastqs } =
    usePocketBaseCollection<Fastq>("fastqs", {
      fields: "id,name",
      filter: `(sample.id = "${sampleId}")`,
    });

  const { create, isCreating } = usePocketBaseCreation<
    ExceptionCreation,
    Exception
  >("exceptions");
  const { remove: deleteException, isRemoving } =
    usePocketBaseMutation("exceptions");

  const form = useForm({
    defaultValues: {
      fastqId: "",
      virusId: "",
      type: "Contamination" as "Contamination" | "Missing",
    },
    validators: {
      onChangeAsyncDebounceMs: 100,
      onChangeAsync: ({ value }) => {
        // Check for duplicate exception
        const isDuplicate = exceptions?.some(
          (exception) =>
            exception.fastq.id === value.fastqId &&
            exception.virus.id === value.virusId &&
            exception.type === value.type,
        );

        if (isDuplicate) {
          return {
            form: "This exception already exists",
          };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value, formApi }) => {
      await create({
        fastq: value.fastqId,
        virus: value.virusId,
        type: value.type,
        sample: sampleId,
      });
      // Reset form after successful submission
      formApi.reset();
    },
  });

  if (
    isLoading ||
    isLoadingSample ||
    isLoadingFastqs ||
    expandedSample === null
  )
    return null;

  return (
    <>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>FASTQ</TableHead>
            <TableHead>Virus</TableHead>
            <TableHead className="w-42">Type</TableHead>
            <TableHead className="w-20">
              <VisuallyHidden.Root>Action</VisuallyHidden.Root>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exceptions?.flatMap((exception) => (
            <TableRow key={exception.id}>
              <TableCell>{exception.fastq.name}</TableCell>
              <TableCell>{exception.virus.name}</TableCell>
              <TableCell>{exception.type}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteException(exception.id)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
          <TableRow key="input">
            <TableCell>
              <form.Field
                name="fastqId"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "FASTQ is required" : undefined,
                }}
              >
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select FASTQ" />
                    </SelectTrigger>
                    <SelectContent>
                      {fastqs.map((fastq) => (
                        <SelectItem key={fastq.id} value={fastq.id}>
                          {fastq.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </TableCell>
            <TableCell>
              <form.Field
                name="virusId"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Virus is required" : undefined,
                }}
              >
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Virus" />
                    </SelectTrigger>
                    <SelectContent>
                      {viruses.map((virus) => (
                        <SelectItem key={virus.id} value={virus.id}>
                          {virus.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </TableCell>
            <TableCell>
              <form.Field
                name="type"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Type is required" : undefined,
                }}
              >
                {(field) => (
                  <Select<"Contamination" | "Missing">
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{field.state.value}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contamination">
                        Contamination
                      </SelectItem>
                      <SelectItem value="Missing">Missing</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </TableCell>
            <TableCell>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    className="w-fit"
                    disabled={!canSubmit || isSubmitting || isCreating}
                    onClick={form.handleSubmit}
                    size="sm"
                    type="button"
                  >
                    {isSubmitting || isCreating ? "Creating..." : "Create"}
                  </Button>
                )}
              </form.Subscribe>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <form.Subscribe selector={(state) => state.errors}>
        {(errors) => (
          <>
            {errors.length > 0 && (
              <p className="flex gap-1.5 items-center justify-end text-sm text-orange-500 mt-2">
                <CircleAlert size={16} />
                <span>{errors[0]?.form}</span>
              </p>
            )}
          </>
        )}
      </form.Subscribe>
    </>
  );
}
