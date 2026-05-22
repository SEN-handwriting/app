import { valibotResolver } from "@hookform/resolvers/valibot";
import { signInSchema, SignInSchemaInput } from "@repo/validation/auth/sign-in";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "#auth/actions";

export function useSignInForm() {
  const form = useForm<SignInSchemaInput>({
    resolver: valibotResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignIn(data: SignInSchemaInput) {
    setError(null);
    setIsPending(true);
    try {
      const result = await signIn(data);
      if (result?.error) {
        setError(result.error.message ?? "Email ou mot de passe incorrect.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/"), 1500);
      }
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setIsPending(false);
    }
  }

  return { form, signIn: handleSignIn, error, isPending, success };
}
