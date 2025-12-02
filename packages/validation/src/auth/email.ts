import * as v from "valibot";

const MAX_EMAIL_LENGTH = 255;

export const emailSchema = v.pipe(
  v.string(),
  // WARN never use Regex for validation to avoid ReDoS attacks
  // for simplicity for now (and for testing), it's fine
  v.email("Please enter a valid email address"),
  v.maxLength(MAX_EMAIL_LENGTH)
);
