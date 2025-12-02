import { valibotResolver } from "@hookform/resolvers/valibot";
import { signUpSchema, SignUpSchemaInput } from "@repo/validation/auth/sign-up";
import { useForm } from "react-hook-form";
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

  return { form, signUp };
}
