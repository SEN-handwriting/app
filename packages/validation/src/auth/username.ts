import * as v from "valibot";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 32;

export const usernameSchema = v.pipe(
  v.string(),
  v.minLength(
    USERNAME_MIN_LENGTH,
    `Username must be at least ${USERNAME_MIN_LENGTH} characters`
  ),
  v.maxLength(
    USERNAME_MAX_LENGTH,
    `Username must be at most ${USERNAME_MAX_LENGTH} characters`
  )
);
