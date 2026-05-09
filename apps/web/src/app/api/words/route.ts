import { type NextRequest, NextResponse } from "next/server";
import { db } from "@repo/database/client";

/**
 * GET /api/words
 *
 * Query params:
 *   lang    – filter by language code  (ex: ja-JP, ru-RU)
 *   level   – filter by course level   (ex: 1, 2)
 *   id      – fetch a single word by ID
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lang = searchParams.get("lang");
  const level = searchParams.get("level");
  const id = searchParams.get("id");

  try {
    const words = await db.word.findMany({
      where: {
        ...(id ? { id } : {}),
        course: {
          language: lang ? { code: lang } : undefined,
          level: level ? Number(level) : undefined,
          type: "word",
        },
      },
      include: { course: { include: { language: true } } },
      orderBy: [{ course: { level: "asc" } }, { id: "asc" }],
    });

    const result = words.map((w) => ({
      id: w.id,
      text: w.text,
      reading: w.reading,
      meaning: w.meaning,
      audioText: w.audioText,
      courseLevel: w.course!.level,
      lang: w.course!.language.code,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/words]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
