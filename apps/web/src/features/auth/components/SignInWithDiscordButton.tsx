"use client";

import { signInWithDiscord } from "#auth/actions";
import { Button } from "@repo/ui/components/button";
import { DiscordIcon } from "@repo/ui/components/icons/DiscordIcon";
import { cn } from "@repo/ui/lib/utils";

export function SignInWithDiscordButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      color="secondary"
      onClick={() => signInWithDiscord()}
      className={cn(
        "border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:bg-zinc-700 active:bg-zinc-700",
        className,
      )}
    >
      <DiscordIcon />
      Sign in with Discord
    </Button>
  );
}
