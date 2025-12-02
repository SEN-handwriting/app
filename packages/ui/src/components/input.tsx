import { tv } from "tailwind-variants";
import { cn } from "@repo/ui/lib/utils";

const input = tv({
  base: [
    "flex h-9 w-full rounded-xl px-3 py-1",
    "text-base shadow-sm transition-colors",

    "file:border-0",
    "file:bg-transparent",
    "file:text-sm",
    "file:font-medium",
    "file:text-foreground",

    "focus-visible:ring-1",
    "focus-visible:outline-none",

    "disabled:cursor-default",
    "disabled:opacity-50",

    "border border-zinc-700 p-4 text-left",

    "placeholder:text-muted-foreground",
    "md:text-sm",
  ],
});

export function Input({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input">) {
  return <input {...props} className={cn(input({ className }))} />;
}
