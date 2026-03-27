import { SignInForm } from "#auth/components/forms/SignInForm";
import Link from "next/link";

export default function SignIn() {
  return (
    <div className="grid min-h-dvh content-center">
      <div className="mx-auto h-full w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6">Se connecter</h1>
        <SignInForm />
        <p className="mt-4 text-sm text-zinc-400">
          Pas encore de compte ?{" "}
          <Link className="text-blue-300 underline hover:decoration-2" href="/sign-up">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
