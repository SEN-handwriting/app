import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@repo/auth/server";
import { db } from "@repo/database/client";

const FLAG: Record<string, string> = {
  "ja-JP": "🇯🇵",
  "ru-RU": "🇷🇺",
};

export interface UserLanguageItem {
  languageId: string;
  languageCode: string;
  name: string;
  script: string | null;
  flag: string;
  hasProgress: boolean;
}

export interface UserLanguagesResponse {
  active: UserLanguageItem[];
  others: UserLanguageItem[];
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [allLanguages, userPrefs, progressCounts] = await Promise.all([
    db.language.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true, script: true },
    }),
    db.userLanguagePreference.findMany({
      where: { userId },
      select: { languageId: true, status: true },
    }),
    db.userProgress.groupBy({
      by: ["characterId"],
      where: { userId },
      _count: true,
    }),
  ]);

  // Determine which languageIds have user progress
  const langIdsWithProgress = new Set<string>();
  if (progressCounts.length > 0) {
    const chars = await db.character.findMany({
      where: { id: { in: progressCounts.map(p => p.characterId) } },
      select: { languageId: true },
    });
    chars.forEach(c => langIdsWithProgress.add(c.languageId));
  }

  const prefMap = new Map(userPrefs.map(p => [p.languageId, p.status]));

  const active: UserLanguageItem[] = [];
  const others: UserLanguageItem[] = [];

  for (const lang of allLanguages) {
    const status = prefMap.get(lang.id);
    const item: UserLanguageItem = {
      languageId: lang.id,
      languageCode: lang.code,
      name: lang.name,
      script: lang.script,
      flag: FLAG[lang.code] ?? "🌐",
      hasProgress: langIdsWithProgress.has(lang.id),
    };
    if (status === "active") {
      active.push(item);
    } else {
      others.push(item);
    }
  }

  return NextResponse.json({ active, others } satisfies UserLanguagesResponse);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { languageIds: string[] };
  if (!Array.isArray(body.languageIds) || body.languageIds.length === 0) {
    return NextResponse.json({ error: "languageIds requis (min 1)" }, { status: 400 });
  }

  const userId = session.user.id;

  await Promise.all(
    body.languageIds.map(languageId =>
      db.userLanguagePreference.upsert({
        where: { userId_languageId: { userId, languageId } },
        create: { userId, languageId, status: "active" },
        update: { status: "active" },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
