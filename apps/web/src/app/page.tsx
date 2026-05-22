import { db } from "@repo/database/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "../lib/auth-session";

const languages = [
  { code: "ja-JP", name: "Japonais", flag: "🇯🇵", script: "Hiragana" },
  { code: "ru-RU", name: "Russe", flag: "🇷🇺", script: "Cyrillique" },
];

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    const prefCount = await db.userLanguagePreference.count({
      where: { userId: session.user.id, status: "active" },
    });
    if (prefCount === 0) {
      redirect("/onboarding");
    }

    const lastSession = await db.practiceSession.findFirst({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" },
      include: { language: { select: { code: true } } },
    });
    if (lastSession) {
      redirect(`/langue/${encodeURIComponent(lastSession.language.code)}`);
    }
    redirect("/dashboard");
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-5xl font-bold mb-3">Sen</h1>
      <p className="text-lg text-zinc-500 mb-10">
        Apprends à écrire les écritures du monde
      </p>

      <div className="grid gap-4">
        {languages.map((lang) => (
          <Link
            key={lang.code}
            href={`/langue/${encodeURIComponent(lang.code)}`}
          >
            <div className="flex items-center gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-600 transition-colors cursor-pointer">
              <span className="text-5xl">{lang.flag}</span>
              <div>
                <h2 className="text-xl font-semibold">{lang.name}</h2>
                <p className="text-sm text-zinc-500 mt-1">{lang.script}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}