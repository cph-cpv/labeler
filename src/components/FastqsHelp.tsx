import { Button } from "@/components/ui/button.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { CheckCircle, Edit3, EyeOff, HelpCircle, ListTodo } from "lucide-react";

export function FastqsHelp() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help about FASTQ management</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h2 className="font-semibold">FASTQs View</h2>
          <div>
            <p className="text-sm text-muted-foreground">
              View and edit FASTQ annotations including type, quality rating,
              dilution factor, and sample assignments. Click on any field to
              edit.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Categories</h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <ListTodo className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">Todo</div>
                  <div className="text-muted-foreground">
                    FASTQs that need annotation or sample assignment.
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <EyeOff className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">Excluded</div>
                  <div className="text-muted-foreground">
                    FASTQs that have been excluded from processing.
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">Done</div>
                  <div className="text-muted-foreground">
                    FASTQs that are fully annotated and assigned.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Editing</h4>
            <div className="flex gap-2 text-sm">
              <Edit3 className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="text-muted-foreground">
                Click on type, quality, dilution, or sample fields to edit.
                Select multiple FASTQs for bulk operations.
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
