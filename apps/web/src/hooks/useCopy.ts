import { useToggle } from "./useToggle";

export function useCopy(delay: number = 2000) {
  const [isCopied, toggleIsCopied] = useToggle(false);

  function copy(text?: string) {
    if (!text || isCopied) return;
    navigator.clipboard.writeText(text);
    toggleIsCopied(true);

    setTimeout(() => {
      toggleIsCopied(false);
    }, delay);
  }

  return [isCopied, copy] as const;
}
