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

export function signInWithGithub() {
  return authClient.signIn.social({
    provider: "github",
  });
}

export function signInWithDiscord() {
  return authClient.signIn.social({
    provider: "discord",
  });
}

export async function logout() {
  return authClient.signOut();
}
