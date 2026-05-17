import { SignInWithGoogleButton } from "#auth/components/SignInWithGoogleButton";
import { SignInForm } from "#auth/components/forms/SignInForm";
import { Separator } from "@repo/ui/components/separator";
import Link from "next/link";

export default function SignIn() {
  return (
    <div className="grid min-h-dvh content-center">
      <div className="mx-auto h-full w-full max-w-md p-8">
        <h1 className="mb-6 text-3xl">Connexion</h1>
        <SignInForm />

        <Separator className="my-4" />

        <SignInWithGoogleButton className="w-full" />

        <p className="mt-4 text-sm text-zinc-400">
          Vous n'avez pas encore de compte ?{" "}
          <Link
            className="text-primary-300 underline hover:decoration-2"
            href="/sign-up"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
