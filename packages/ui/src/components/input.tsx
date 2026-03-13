import { tv } from "tailwind-variants";
import { cn } from "@repo/ui/lib/utils";

const input = tv({
  base: [
    "flex h-12 w-full rounded-2xl px-3 py-1",
    "text-lg shadow-sm transition-colors",
    "outline-white/10",

    "file:border-0",
    "file:bg-transparent",
    "file:text-sm",
    "file:font-medium",
    "file:text-foreground",

    "focus-visible:bg-white/10",
    "focus-visible:outline",
    "focus-visible:outline-white/50",

    "disabled:cursor-default",
    "disabled:opacity-50",

    "border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10",

    "placeholder:text-muted-foreground",
  ],
});

export function Input({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input">) {
  return <input {...props} className={cn(input({ className }))} />;
}
