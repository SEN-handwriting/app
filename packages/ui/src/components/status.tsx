import { tv, VariantProps } from "tailwind-variants";

const status = tv({
  base: "inline-block size-1 rounded-full",

  variants: {
    state: {
      online: "bg-green-500",
      offline: "bg-red-500",
    },
  },
});

export function Status({
  children,
  className,
  state,
  ...props
}: VariantProps<typeof status> & React.ComponentProps<"span">) {
  return (
    <span className={status({ state, className })} {...props}>
      {children}
    </span>
  );
}
