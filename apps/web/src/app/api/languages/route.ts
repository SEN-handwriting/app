import { NextResponse } from "next/server";
import { db } from "@repo/database/client";

/**
 * GET /api/languages
 * Retourne toutes les langues actives avec le nombre de caractères.
 */
export async function GET() {
  try {
    const languages = await db.language.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { characters: true, courses: true } } },
    });

    return NextResponse.json(
      languages.map((l) => ({
        id: l.id,
        code: l.code,
        name: l.name,
        script: l.script,
        characterCount: l._count.characters,
        courseCount: l._count.courses,
      })),
    );
  } catch (err) {
    console.error("[GET /api/languages]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
