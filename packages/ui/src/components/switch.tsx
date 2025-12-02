"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@repo/ui/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer group",
        "inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border shadow-xs transition-all outline-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        // unchecked
        "data-[state=unchecked]:border-zinc-600 data-[state=unchecked]:bg-zinc-500",
        "data-[state=unchecked]:outline-zinc-300",

        // checked
        "data-[state=checked]:border-blue-700 data-[state=checked]:bg-blue-600",
        "data-[state=checked]:outline-blue-500",
        "data-[state=checked]:focus-visible:border-blue-600 data-[state=checked]:focus-visible:bg-blue-500",
        "data-[state=checked]:hover:bg-blue-500",
        "data-[state=checked]:active:bg-blue-400",

        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-white",
          "pointer-events-none block size-3 rounded-full outline-0 transition-all",
          "data-[state=unchecked]:translate-x-[2px]",
          "data-[state=unchecked]:group-active:w-[calc(var(--spacing)*3+2px)]",

          "data-[state=checked]:bg-blue-50",
          "data-[state=checked]:translate-x-[calc(100%+4px)]",
          "data-[state=checked]:group-active:w-[calc(var(--spacing)*3+2px)]",
          "data-[state=checked]:group-active:translate-x-[calc(var(--spacing)*3+2px)]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
