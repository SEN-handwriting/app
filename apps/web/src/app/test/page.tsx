"use client";

import { Button, button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";
import { Gamepad2 } from "lucide-react";

function getVariants<T extends Record<string, unknown>>(e: T) {
  return Object.keys(e) as (keyof T)[];
}

export default function Test() {
  return (
    <div className="p-8">
      <Section name="Button">
        <Grid className="grid-cols-4">
          {getVariants(button.variants.variant).map(variant =>
            getVariants(button.variants.color).map(color =>
              getVariants(button.variants.size).map(size => (
                <GridItem key={`${color}-${size}-${variant}`}>
                  {!size.includes("icon") ? (
                    <>
                      <Button color={color} size={size} variant={variant}>
                        {variant} {color} {size}
                      </Button>

                      <Button color={color} size={size} variant={variant}>
                        <Gamepad2 />
                        {variant} {color} {size}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size={size} variant={variant} color={color}>
                        <Gamepad2 />
                      </Button>
                    </>
                  )}
                </GridItem>
              )),
            ),
          )}
        </Grid>
      </Section>

      <Section name="Input">
        <div className="max-w-xl">
          <Label htmlFor="input">Input</Label>
          <Input id="input" />
        </div>
      </Section>
    </div>
  );
}

function Section({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8 rounded-xl border border-dashed border-zinc-800 p-8">
      <details open>
        <summary className="cursor-pointer text-xl text-zinc-300 uppercase italic">
          {name}
        </summary>

        <div className="mt-4">{children}</div>
      </details>
    </div>
  );
}

function Grid({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid grid-cols-5 gap-4", className)} {...props} />;
}

function GridItem({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className="grid place-content-center place-items-start items-start gap-8 rounded-lg border border-dashed border-zinc-800 p-16 hover:border-solid"
      {...props}
    />
  );
}
