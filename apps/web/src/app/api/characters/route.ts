import { type NextRequest, NextResponse } from "next/server";
import { characters } from "../../../data/characters";

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

  let result = [...characters];

  if (lang) result = result.filter((c) => c.lang === lang);
  if (level) result = result.filter((c) => c.courseLevel === parseInt(level));
  if (id) result = result.filter((c) => c.id === id);

  return NextResponse.json(result);
}
