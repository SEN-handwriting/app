import { NextResponse } from "next/server";

/**
 * GET /api/kanjivg/[char]
 *
 * Fetches stroke-order SVG paths for any Japanese character from the
 * KanjiVG dataset (https://kanjivg.tagaini.net — CC BY-SA 3.0).
 *
 * Example: /api/kanjivg/%E3%81%82  →  paths for あ
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ char: string }> },
) {
  const { char } = await params;
  const decoded = decodeURIComponent(char);
  const codepoint = decoded.codePointAt(0)?.toString(16).padStart(5, "0");

  if (!codepoint) {
    return NextResponse.json({ error: "Invalid character" }, { status: 400 });
  }

  try {
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codepoint}.svg`;

    const response = await fetch(url, {
      next: { revalidate: 86400 }, // cache 24h server-side
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Character not found in KanjiVG (U+${codepoint})` },
        { status: 404 },
      );
    }

    const svgText = await response.text();

    // Extract <path> elements with kvg stroke IDs, preserving order
    const strokePaths: { order: number; d: string }[] = [];
    const pathRegex =
      /<path[^>]*id="kvg:[^"]*-s(\d+)"[^>]*d="([^"]+)"/g;
    let match: RegExpExecArray | null;

    while ((match = pathRegex.exec(svgText)) !== null) {
      strokePaths.push({ order: parseInt(match[1]), d: match[2] });
    }

    strokePaths.sort((a, b) => a.order - b.order);
    const svgPaths = strokePaths.map((s) => s.d);

    return NextResponse.json({
      character: decoded,
      codepoint: `U+${codepoint.toUpperCase()}`,
      svgPaths,
      strokeCount: svgPaths.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch KanjiVG data" },
      { status: 500 },
    );
  }
}
