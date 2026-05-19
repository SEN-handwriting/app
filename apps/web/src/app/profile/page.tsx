"use client";

import { useProfile } from "#auth/hooks/useProfile";
import { logout } from "#auth/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";

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
    <main className="container mx-auto max-w-2xl px-4 py-6 pb-24 md:pb-10 space-y-6">
      <Link href="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-white text-sm transition-colors py-1">
        ← Dashboard
      </Link>
      {/* Avatar + nom */}
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 text-xl">
          <AvatarImage src={(user.image ?? undefined) as string | undefined} />
          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-zinc-400">{user.email}</p>
        </div>
      </div>

      {/* Infos */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
        <div className="px-5 py-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Nom</p>
          <p className="font-medium">{user.name}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 gap-3">
        <Link
          href="/dashboard"
          className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📊</span>
            <span className="font-medium">Mes statistiques</span>
          </div>
          <span className="text-zinc-500">→</span>
        </Link>
        <Link
          href="/mes-cours"
          className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📚</span>
            <span className="font-medium">Mes cours</span>
          </div>
          <span className="text-zinc-500">→</span>
        </Link>
        <Link
          href="/langue"
          className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🌐</span>
            <span className="font-medium">Explorer les langues</span>
          </div>
          <span className="text-zinc-500">→</span>
        </Link>
      </div>

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        className="w-full rounded-xl border border-red-900 bg-red-950/30 px-5 py-4 text-red-400 font-medium hover:bg-red-950/60 transition-colors text-left"
      >
        Se déconnecter
      </button>
    </main>
  );
}
