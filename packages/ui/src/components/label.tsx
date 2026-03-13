"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@repo/ui/lib/utils";

const label = tv({
  base: "cursor-pointer text-lg leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
});

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof label>) {
  return (
    <LabelPrimitive.Root className={cn(label({ className }))} {...props} />
  );
}
