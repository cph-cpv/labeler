import { useHotkeys } from "react-hotkeys-hook";


export const useMultiSelectHotkey = (
  hotkey: string,
  selected: unknown[],
  setOpen: (open: boolean) => void,
) => {
  useHotkeys(
    hotkey,
    () => {
      if (selected.length > 0) {
        setOpen(true);
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: ["input"],
      enabled: selected.length > 0,
      ignoreEventWhen: (e) => {
      const target = e.target;

      // Ignore (don't trigger hotkey) for text inputs, textarea, etc.
      if (target.tagName === 'INPUT' &&
          target.type !== 'checkbox' &&
          target.type !== 'radio') {
        return true;
      }

      if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return true;
      }

      // Don't ignore for checkboxes/radios and other elements
      return false;
  }
    },

  );
};