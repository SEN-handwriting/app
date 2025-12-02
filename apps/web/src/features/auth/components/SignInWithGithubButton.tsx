"use client";

import { signInWithGithub } from "#auth/actions";
import { Button } from "@repo/ui/components/button";
import { GithubIcon } from "@repo/ui/components/icons/GithubIcon";
import { cn } from "@repo/ui/lib/utils";

export function SignInWithGithubButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      color="secondary"
      onClick={() => signInWithGithub()}
      className={cn(
        "border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:bg-zinc-700 active:bg-zinc-700",
        className,
      )}
    >
      <GithubIcon />
      Sign in with GitHub
    </Button>
  );
}
