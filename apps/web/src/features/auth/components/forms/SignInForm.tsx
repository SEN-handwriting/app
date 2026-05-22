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
  const { form, signIn, error, isPending, success } = useSignInForm();

  return (
    <>
      {success && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border bg-green-950 border-green-500 text-green-100 text-sm" style={{ animation: "toastSlide 0.3s ease-out" }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 bg-green-500 text-white text-lg">✓</span>
          <p className="font-bold">Connecté ! Redirection…</p>
        </div>
      )}

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
                  <Input {...field} type="email" disabled={isPending || success} />
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
                  <Input {...field} type="password" disabled={isPending || success} />
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

          <Button type="submit" className="mt-4 w-full" disabled={isPending || success}>
            {isPending ? "Connexion…" : success ? "Connecté !" : "Se connecter"}
          </Button>
        </form>
      </Form>

      <style>{`
        @keyframes toastSlide {
          0%   { transform: translateY(-110%); opacity: 0; }
          100% { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </>
  );
}
