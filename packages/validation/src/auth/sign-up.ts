import * as v from "valibot";
import { emailSchema } from "./email";
import { passwordSchema } from "./password";
import { usernameSchema } from "./username";

export const signUpSchema = v.pipe(
  v.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  }),
  v.check(
    input => input.password === input.confirmPassword,
    "Passwords do not match"
  )
);

export type SignUpSchemaInput = v.InferInput<typeof signUpSchema>;
export type SignUpSchemaOutput = v.InferOutput<typeof signUpSchema>;
