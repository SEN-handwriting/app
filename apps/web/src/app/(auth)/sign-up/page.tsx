import { SignInWithGoogleButton } from "#auth/components/SignInWithGoogleButton";
import { SignUpForm } from "#auth/components/forms/SignUpForm";
import Link from "next/link";
import { Separator } from "@repo/ui/components/separator";

export default function SignUp() {
  return (
    <div className="grid min-h-dvh content-center">
      <div className="mx-auto h-full w-full max-w-md p-8">
        <h1 className="mb-6 text-3xl">Inscription</h1>
        <SignUpForm />

        <Separator className="my-4" />

        <SignInWithGoogleButton className="w-full" />

        <p className="mt-4 text-sm text-zinc-400">
          Vous avez déjà un compte ?{" "}
          <Link
            className="text-primary-300 underline hover:decoration-2"
            href="/sign-in"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
