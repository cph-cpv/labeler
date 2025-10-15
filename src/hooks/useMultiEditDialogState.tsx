import { useCallback, useState } from "react";
import { useHotkeysContext } from "react-hotkeys-hook";

export function useMultiEditDialogState() {
  const [open, setOpen] = useState(false);
  const { enableScope, disableScope } = useHotkeysContext();

  const onSetOpen = useCallback(
    (open: boolean) => {
      open ? disableScope("multiEdit") : enableScope("multiEdit");
      setOpen(open);
    },
    [setOpen, enableScope, disableScope],
  );
  return [open, onSetOpen];
}
