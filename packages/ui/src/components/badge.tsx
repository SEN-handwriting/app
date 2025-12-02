import { VariantProps, tv } from "tailwind-variants";

const badge = tv({
  base: "rounded-full px-1 text-xs font-semibold uppercase not-italic select-none",

  variants: {
    variant: {
      solid: "",
      outline: "border",
    },
    color: {
      primary: "",
      secondary: "",
      new: "",

      success: "",
      warning: "",
      error: "",
      info: "",
    },
  },
  defaultVariants: {
    variant: "solid",
    color: "primary",
  },

  compoundVariants: [
    { variant: "solid", color: "primary", className: "" },
    { variant: "solid", color: "secondary", className: "" },
    {
      variant: "solid",
      color: "new",
      // className: "bg-teal-600 text-teal-100",
      className: "bg-pink-600 text-pink-100",
    },
    { variant: "solid", color: "success", className: "" },
    { variant: "solid", color: "warning", className: "" },
    { variant: "solid", color: "error", className: "" },
    { variant: "solid", color: "info", className: "" },

    { variant: "outline", color: "primary", className: "" },
    { variant: "outline", color: "secondary", className: "border-zinc-600" },
    { variant: "outline", color: "new", className: "" },
    {
      variant: "outline",
      color: "success",
      className: "border-emerald-500 text-emerald-500",
    },
    { variant: "outline", color: "warning", className: "" },
    { variant: "outline", color: "error", className: "" },
    { variant: "outline", color: "info", className: "" },
  ],
});

type BadgeVariants = VariantProps<typeof badge>;

export function Badge({
  color,
  variant,
  children,
  className,
  ...props
}: BadgeVariants & React.ComponentProps<"span">) {
  return (
    <span {...props} className={badge({ color, variant, className })}>
      {children}
    </span>
  );
}
