"use client";

import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { useSignInForm } from "#auth/hooks/forms/useSignInForm";
import Link from "next/link";

export function SignInForm() {
  const { form, signIn } = useSignInForm();

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(signIn)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Link className="text-primary-300 underline" href="/">
            I forgot my password
          </Link>
        </div>

        <Button type="submit" className="mt-4 w-full">
          Sign in
        </Button>
      </form>
    </Form>
  );
}
