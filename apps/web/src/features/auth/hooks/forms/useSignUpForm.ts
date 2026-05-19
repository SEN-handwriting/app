import { valibotResolver } from "@hookform/resolvers/valibot";
import { signUpSchema, SignUpSchemaInput } from "@repo/validation/auth/sign-up";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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

  async function handleSignUp(data: SignUpSchemaInput) {
    const result = await signUp(data);
    if (!result?.error) {
      router.push("/");
    }
  }

  return { form, signUp: handleSignUp };
}
