import * as v from "valibot";
import { auth } from "@repo/auth/server";
import { db } from "@repo/database/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const QuerySchema = v.object({
  lang: v.optional(v.string()),
});

export interface RevisionItem {
  userProgressId: string;
  characterId: string;
  character: { label: string; romaji: string[]; languageCode: string };
  practiceLevel: number;
  nextReview: string;
  repetitions: number;
  easeFactor: number;
}

export interface RevisionResponse {
  items: RevisionItem[];
  total: number;
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = v.safeParse(QuerySchema, {
    lang: request.nextUrl.searchParams.get("lang") ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  const { lang } = parsed.output;
  const userId = session.user.id;
  const now = new Date();

  const rows = await db.userProgress.findMany({
    where: {
      userId,
      nextReview: { lte: now },
      ...(lang ? { character: { language: { code: lang } } } : {}),
    },
    orderBy: { nextReview: "asc" },
    select: {
      id: true,
      characterId: true,
      practiceLevel: true,
      nextReview: true,
      repetitions: true,
      easeFactor: true,
      character: {
        select: {
          label: true,
          romaji: true,
          language: { select: { code: true } },
        },
      },
    },
  });

  const items: RevisionItem[] = rows.map((row) => ({
    userProgressId: row.id,
    characterId: row.characterId,
    character: {
      label: row.character.label,
      romaji: row.character.romaji ? (JSON.parse(row.character.romaji) as string[]) : [],
      languageCode: row.character.language.code,
    },
    practiceLevel: row.practiceLevel,
    nextReview: row.nextReview.toISOString(),
    repetitions: row.repetitions,
    easeFactor: row.easeFactor,
  }));

  return NextResponse.json({ items, total: items.length } satisfies RevisionResponse);
}
