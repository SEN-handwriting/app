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
  const { form, signIn, error, isPending } = useSignInForm();

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
                <Input {...field} type="email" disabled={isPending} />
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
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input {...field} type="password" disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Link className="text-primary-300 underline" href="/">
            Mot de passe oublié ?
          </Link>
        </div>

        {error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-4 w-full" disabled={isPending}>
          {isPending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </Form>
  );
}
