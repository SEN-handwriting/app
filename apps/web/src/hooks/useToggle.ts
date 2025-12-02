import { useState } from "react";

export function useToggle(initialValue: boolean = false) {
  const [isTruthy, setIsTruthy] = useState(initialValue);

  function toggle(force?: boolean) {
    setIsTruthy(prev => force ?? !prev);
  }

  return [isTruthy, toggle] as const;
}
