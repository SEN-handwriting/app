"use client";

import { signInWithGoogle } from "#auth/actions";
import { Button } from "@repo/ui/components/button";
import { GoogleIcon } from "@repo/ui/components/icons/GoogleIcon";

export function SignInWithGoogleButton({
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button {...props} color="secondary" onClick={() => signInWithGoogle()}>
      <GoogleIcon />
      Sign in with Google
    </Button>
  );
}
