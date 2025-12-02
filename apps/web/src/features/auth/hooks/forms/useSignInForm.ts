import { valibotResolver } from "@hookform/resolvers/valibot";
import { signInSchema, SignInSchemaInput } from "@repo/validation/auth/sign-in";
import { useForm } from "react-hook-form";
import { signIn } from "#auth/actions";

export function useSignInForm() {
  const form = useForm<SignInSchemaInput>({
    resolver: valibotResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return { form, signIn };
}
