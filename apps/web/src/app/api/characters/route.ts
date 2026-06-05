import { type NextRequest, NextResponse } from "next/server";
import { db } from "@repo/database/client";
import type { Character } from "../../../data/characters";

function toCharacter(raw: {
  id: string;
  label: string;
  language: { code: string };
  audioText: string;
  svgPaths: string;
  strokeCount: number | null;
  meanings: string | null;
  romaji: string | null;
  readings: string | null;
  jlpt: string | null;
  courseLevel: number;
}): Character {
  return {
    id: raw.id,
    label: raw.label,
    lang: raw.language.code,
    audioText: raw.audioText,
    svgPaths: JSON.parse(raw.svgPaths) as string[],
    strokeCount: raw.strokeCount ?? undefined,
    meanings: raw.meanings ? (JSON.parse(raw.meanings) as string[]) : undefined,
    romaji: raw.romaji ? (JSON.parse(raw.romaji) as string[]) : undefined,
    readings: raw.readings
      ? (JSON.parse(raw.readings) as Character["readings"])
      : undefined,
    jlpt: raw.jlpt ?? undefined,
    courseLevel: raw.courseLevel,
  };
}

/**
 * GET /api/characters
 *
 * Query params:
 *   lang    – filter by language code  (ex: ja-JP, ru-RU)
 *   level   – filter by course level   (ex: 1, 2)
 *   id      – fetch a single character by ID
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang");
  const level = searchParams.get("level");
  const id = searchParams.get("id");
  const labels = searchParams.get("labels");

  try {
    const rows = await db.character.findMany({
      where: {
        ...(lang && { language: { code: lang } }),
        ...(level && { courseLevel: parseInt(level, 10) }),
        ...(id && { id }),
        ...(labels && { label: { in: labels.split(",") } }),
      },
      include: { language: true },
      orderBy: [{ courseLevel: "asc" }, { id: "asc" }],
    });

    return NextResponse.json(rows.map(toCharacter));
  } catch (err) {
    console.error("[GET /api/characters]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
