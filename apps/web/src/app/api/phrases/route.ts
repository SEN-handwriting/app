import { type NextRequest, NextResponse } from "next/server";
import { db } from "@repo/database/client";

/**
 * GET /api/phrases
 *
 * Query params:
 *   lang    – filter by language code (ex: ja-JP, ru-RU)
 *   level   – filter by course level  (ex: 1, 2)
 *   id      – fetch a single phrase by ID
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lang  = searchParams.get("lang");
  const level = searchParams.get("level");
  const id    = searchParams.get("id");

  try {
    const phrases = await db.phrase.findMany({
      where: {
        ...(id ? { id } : {}),
        course: {
          language: lang  ? { code: lang }    : undefined,
          level:    level ? Number(level)      : undefined,
          type: "phrase",
        },
      },
      include: { course: { include: { language: true } } },
      orderBy: [{ course: { level: "asc" } }, { id: "asc" }],
    });

    const result = phrases.map((p) => ({
      id:          p.id,
      text:        p.text,
      reading:     p.reading,
      translation: p.translation,
      audioText:   p.audioText,
      courseLevel: p.course!.level,
      lang:        p.course!.language.code,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/phrases]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
