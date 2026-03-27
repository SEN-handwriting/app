"use client";

import { useProfile } from "#auth/hooks/useProfile";
import { logout } from "#auth/actions";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

export default function ProfilePage() {
  const { data, isPending } = useProfile();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="grid min-h-dvh content-center">
        <p className="text-center text-zinc-400">Chargement…</p>
      </div>
    );
  }

  if (!data?.user) {
    router.replace("/sign-in");
    return null;
  }

  const { user } = data;

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <main className="container mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold mb-6">Mon profil</h1>

      <div className="rounded-xl border border-zinc-800 p-6 space-y-4">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Nom</p>
          <p className="text-lg font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Email</p>
          <p className="text-lg font-medium">{user.email}</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/stats"
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Voir mes stats →
        </Link>
      </div>

      <div className="mt-6 flex gap-4">
        <Button asChild variant="flat">
          <Link href="/langue">Voir les cours</Link>
        </Button>
        <Button color="secondary" onClick={handleLogout}>
          Se déconnecter
        </Button>
      </div>
    </main>
  );
}
