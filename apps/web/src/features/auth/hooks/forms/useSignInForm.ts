import { valibotResolver } from "@hookform/resolvers/valibot";
import { signInSchema, SignInSchemaInput } from "@repo/validation/auth/sign-in";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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

  async function handleSignIn(data: SignInSchemaInput) {
    const result = await signIn(data);
    if (!result?.error) {
      router.push("/");
    }
  }

  return { form, signIn: handleSignIn };
}
