import * as v from "valibot";
import { auth } from "@repo/auth/server";
import { db } from "@repo/database/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const QuerySchema = v.object({
  limit: v.optional(
    v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(100)),
  ),
});

export interface SessionSummary {
  id: string;
  languageCode: string;
  languageName: string;
  startedAt: string;
  endedAt: string | null;
  totalAttempts: number;
  successfulAttempts: number;
  successRate: number;
  durationMs: number | null;
}

export interface SessionsResponse {
  items: SessionSummary[];
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsed = v.safeParse(QuerySchema, {
    limit: limitParam ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  const limit = parsed.output.limit ?? 10;

  const rows = await db.practiceSession.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: "desc" },
    take: limit,
    select: {
      id: true,
      startedAt: true,
      completedAt: true,
      totalChars: true,
      correctCount: true,
      language: { select: { code: true, name: true } },
    },
  });

  const items: SessionSummary[] = rows.map((row) => ({
    id: row.id,
    languageCode: row.language.code,
    languageName: row.language.name,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.completedAt?.toISOString() ?? null,
    totalAttempts: row.totalChars,
    successfulAttempts: row.correctCount,
    successRate: row.totalChars > 0 ? Math.round((row.correctCount / row.totalChars) * 100) : 0,
    durationMs: row.completedAt
      ? row.completedAt.getTime() - row.startedAt.getTime()
      : null,
  }));

  return NextResponse.json({ items } satisfies SessionsResponse);
}
