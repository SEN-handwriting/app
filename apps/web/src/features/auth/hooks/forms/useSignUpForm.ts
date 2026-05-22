import { valibotResolver } from "@hookform/resolvers/valibot";
import { signUpSchema, SignUpSchemaInput } from "@repo/validation/auth/sign-up";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "#auth/actions";

export function useSignUpForm() {
  const form = useForm<SignUpSchemaInput>({
    resolver: valibotResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSignUp(data: SignUpSchemaInput) {
    setError(null);
    setIsPending(true);
    try {
      const result = await signUp(data);
      if (result?.error) {
        setError(result.error.message ?? "Impossible de créer le compte.");
      } else {
        router.push("/");
      }
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setIsPending(false);
    }
  }

  return { form, signUp: handleSignUp, error, isPending };
}
