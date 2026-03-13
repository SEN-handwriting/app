import { authClient } from "@repo/auth/client";
import { SignInSchemaOutput } from "@repo/validation/auth/sign-in";
import { SignUpSchemaOutput } from "@repo/validation/auth/sign-up";

export async function signIn(data: SignInSchemaOutput) {
  return authClient.signIn.email({
    email: data.email,
    password: data.password,
    callbackURL: "/",
  });
}

export async function signUp(data: SignUpSchemaOutput) {
  return authClient.signUp.email({
    email: data.email,
    name: data.username,
    password: data.password,
    callbackURL: "/",
  });
}

export function signInWithGoogle() {
  return authClient.signIn.social({
    provider: "google",
  });
}

export async function logout() {
  return authClient.signOut();
}
