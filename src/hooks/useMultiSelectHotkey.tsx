import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const useMultiSelectHotkey = (
  hotkey: string,
  selected: unknown[],
  setOpen: (open: boolean) => void,
) => {
  const ignoreEvent = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    console.log(e);
    // Ignore (don't trigger hotkey) for text inputs, textarea, etc.
    if (
      target.tagName === "INPUT" &&
      (target as HTMLInputElement).type !== "checkbox" &&
      (target as HTMLInputElement).type !== "radio"
    ) {
      console.log("returning true");
      return true;
    }

    if (target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
      console.log("returning true");
      return true;
    }

    // Don't ignore for checkboxes/radios and other elements
    console.log("returning false");
    return false;
  }, []);

  useHotkeys(
    hotkey,
    () => {
      setOpen(true);
    },
    {
      preventDefault: true,
      enableOnFormTags: ["input"],
      enabled: selected.length > 0,
      ignoreEventWhen: ignoreEvent,
      scopes: "multiEdit",
    },
    [setOpen, selected],
  );
};
