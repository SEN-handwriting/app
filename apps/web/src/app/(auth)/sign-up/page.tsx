import { SignInWithGithubButton } from "#auth/components/SignInWithGithubButton";
import { SignUpForm } from "#auth/components/forms/SignUpForm";
import { Navbar } from "#/components/layouts/Navbar";
import Link from "next/link";
import { SignInWithDiscordButton } from "#auth/components/SignInWithDiscordButton";

export default function SignUp() {
  return (
    <div className="grid min-h-dvh content-center">
      <Navbar />

      <div className="mx-auto h-full w-full max-w-2xl p-8">
        <h1 className="text-3xl font-bold">Sign up</h1>
        <SignUpForm />

        {/* <span className="block text-center text-xs font-medium text-zinc-500 uppercase">
          or
        </span>

        <SignInWithGithubButton className="w-full" />
        <SignInWithDiscordButton className="w-full" /> */}

        <p className="mt-4">
          Already have an account?{" "}
          <Link
            className="text-blue-300 underline hover:decoration-2"
            href="/sign-in"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
