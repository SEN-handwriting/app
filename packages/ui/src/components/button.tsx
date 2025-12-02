"use client";

import { Slot } from "@radix-ui/react-slot";
import { tv, VariantProps } from "tailwind-variants";
import { cn } from "@repo/ui/lib/utils";

export type ButtonProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  keyof VariantProps<typeof button>
> &
  VariantProps<typeof button> & {
    asChild?: boolean;
  };

const button = tv({
  base: [
    "inline-flex cursor-pointer items-center justify-center gap-2 border border-transparent px-2 py-1 text-center whitespace-nowrap select-none",
    "outline-offset-0 transition-[outline-offset] duration-[20ms] ease-in-out",
    "active:translate-y-px",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "[&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  ],

  variants: {
    color: {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600",
      secondary:
        "bg-white text-black hover:bg-gray-100 focus-visible:outline-white",

      danger: "",
      // success: "",
      // warning: "",
      // info: "",
    },

    variant: {
      solid: "",
      dashed: "border-dashed",
      ghost: "",
      flat: "",
    },

    radius: {
      rounded: "rounded-xl",
      full: "rounded-full",
    },

    size: {
      sm: "px-1.5 py-0.5 text-xs [&_svg]:size-3",
      md: "px-4 py-2 text-sm [&_svg]:size-4",
      lg: "px-5 py-2.5 text-base [&_svg]:size-5",
      test: "h-11 px-5.5 py-2.5 text-base [&_svg]:size-4",
      "icon-sm": "size-8 p-1.5",
    },
  },

  defaultVariants: {
    color: "primary",
    variant: "solid",
    radius: "rounded",
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
