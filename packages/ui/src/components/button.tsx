"use client";

import { Slot } from "@radix-ui/react-slot";
import { tv, VariantProps, TVCompoundVariants } from "tailwind-variants";
import { cn } from "@repo/ui/lib/utils";

export type ButtonProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  keyof VariantProps<typeof button>
> &
  VariantProps<typeof button> & {
    asChild?: boolean;
  };

export const button = tv({
  base: [
    "inline-flex cursor-pointer items-center justify-center gap-2 border border-transparent text-center whitespace-nowrap select-none",
    "outline-offset-0 transition-[outline-offset] duration-20 ease-in-out",
    "active:translate-y-px",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],

  variants: {
    color: {
      primary: "",
      secondary: "",

      // danger: "",
      // success: "",
      // warning: "",
      // info: "",
    },

    variant: {
      solid: "shadow-reflect",
      flat: "shadow-reflect",
    },

    radius: {
      rounded: "rounded-xl",
      full: "rounded-full",
    },

    size: {
      md: "px-4 py-2.5 text-sm [&_svg]:size-4",
      lg: "px-5 py-2.5 text-base [&_svg]:size-6",
      "icon-md": "size-9 p-2.5 [&_svg]:size-4",
      "icon-lg": "size-14 p-4 [&_svg]:size-6",
    },
  },

  compoundVariants: [
    {
      variant: "solid",
      color: "primary",
      className:
        "bg-primary-900 hover:bg-primary-800 focus-visible:outline-primary-600 text-white",
    },
    {
      variant: "solid",
      color: "secondary",
      className:
        "bg-white text-black hover:bg-neutral-200 focus-visible:outline-white",
    },
    {
      variant: "flat",
      color: "secondary",
      className:
        "bg-neutral-800 text-white hover:bg-neutral-700 focus-visible:outline-neutral-500",
    },
  ],

  defaultVariants: {
    color: "primary",
    variant: "solid",
    radius: "full",
    size: "md",
  },
});

export function Button({
  asChild,
  color,
  size,
  variant,
  radius,
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      {...props}
      className={button({ color, size, variant, radius, className })}
    />
  );
}

export function ButtonGroup({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div {...props} className={cn("flex items-center gap-4", className)}>
      {children}
    </div>
  );
}
