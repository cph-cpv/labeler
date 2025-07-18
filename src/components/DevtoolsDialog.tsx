import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFilesContext } from "@/contexts/FilesContext";
import { pb } from "@/lib/pocketbase";
import { Bug, Plus } from "lucide-react";
import { useState } from "react";

export function DevtoolsDialog() {
  const [isCreating, setIsCreating] = useState(false);

  // Try to use the files context if available, otherwise fall back to page reload
  let refetchFiles: (() => void) | null = null;
  try {
    const context = useFilesContext();
    refetchFiles = context.refetchFiles;
  } catch {
    // Context not available, will use page reload
  }

  const createUnannotatedFiles = async (count: number) => {
    setIsCreating(true);
    try {
      const timestamp = new Date();
      const promises = [];

      for (let i = 0; i < count; i++) {
        const randomId = Math.floor(Math.random() * 100000);
        promises.push(
          pb.collection("files").create({
            name: `test_file_${randomId}.fastq`,
            path: `/mnt/test/test_file_${randomId}.fastq`,
            date: timestamp.toISOString().split("T")[0],
            // Leave annotation fields null/empty to make it unannotated
            quality_rating: null,
            dilution_factor: null,
            type: null,
          }),
        );
      }

      await Promise.all(promises);
      console.log(`Created ${count} unannotated test files`);

      // Refetch files to show the new files
      if (refetchFiles) {
        refetchFiles();
      } else {
        // Fall back to page reload if context is not available
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to create test files:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Bug className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Developer Tools</DialogTitle>
          <DialogDescription>
            Development and debugging tools for the application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-3">Database Tools</h3>
            <p className="text-sm text-gray-600 mb-3">
              Create test files without annotation data (appears in Unannotated
              section):
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 10, 20, 30, 50, 100].map((count) => (
                <Button
                  key={count}
                  onClick={() => createUnannotatedFiles(count)}
                  disabled={isCreating}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {count}
                </Button>
              ))}
            </div>
            {isCreating && (
              <p className="text-xs text-blue-600 mt-2 font-medium">
                Creating files...
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
