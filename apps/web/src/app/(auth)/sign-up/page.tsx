import { SignUpForm } from "#auth/components/forms/SignUpForm";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="grid min-h-dvh content-center">
      <div className="mx-auto h-full w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6">Créer un compte</h1>
        <SignUpForm />
        <p className="mt-4 text-sm text-zinc-400">
          Déjà un compte ?{" "}
          <Link className="text-blue-300 underline hover:decoration-2" href="/sign-in">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
