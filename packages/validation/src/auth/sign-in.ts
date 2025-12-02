import * as v from "valibot";
import { emailSchema } from "./email";
import { passwordSchema } from "./password";

export const signInSchema = v.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignInSchemaInput = v.InferInput<typeof signInSchema>;
export type SignInSchemaOutput = v.InferOutput<typeof signInSchema>;
