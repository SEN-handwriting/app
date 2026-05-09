import { auth } from "@repo/auth/server";
import { db } from "@repo/database/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function calculateSM2(
  isSuccess: boolean,
  repetitions: number,
  easeFactor: number,
  interval: number,
): { repetitions: number; easeFactor: number; interval: number; nextReview: Date } {
  if (isSuccess) {
    const newRepetitions = repetitions + 1;
    const newInterval =
      repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.round(interval * easeFactor);
    const newEaseFactor = Math.min(2.5, Math.max(1.3, easeFactor + 0.1));
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);
    return { repetitions: newRepetitions, easeFactor: newEaseFactor, interval: newInterval, nextReview };
  }
  const newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + 1);
  return { repetitions: 0, easeFactor: newEaseFactor, interval: 1, nextReview };
}

// GET /api/progress?characterId=xxx  →  { practiceLevel: number }
// GET /api/progress?lang=ja-JP       →  { items: [...], totalCharacters: number }
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ practiceLevel: 0 });

  const lang = request.nextUrl.searchParams.get("lang");

  if (lang) {
    const [items, language] = await Promise.all([
      db.userProgress.findMany({
        where: { userId: session.user.id, character: { language: { code: lang } } },
        select: {
          characterId: true,
          practiceLevel: true,
          nextReview: true,
          character: { select: { label: true, romaji: true } },
        },
      }),
      db.language.findUnique({
        where: { code: lang },
        select: { _count: { select: { characters: true } } },
      }),
    ]);
    return NextResponse.json({
      items: items.map((p) => ({
        characterId: p.characterId,
        practiceLevel: p.practiceLevel,
        nextReview: p.nextReview.toISOString(),
        character: {
          label: p.character.label,
          romaji: p.character.romaji ? (JSON.parse(p.character.romaji) as string[]) : [],
        },
      })),
      totalCharacters: language?._count.characters ?? 0,
    });
  }

  const characterId = request.nextUrl.searchParams.get("characterId");
  if (!characterId) return NextResponse.json({ practiceLevel: 0 });

  const progress = await db.userProgress.findUnique({
    where: { userId_characterId: { userId: session.user.id, characterId } },
    select: { practiceLevel: true },
  });
  return NextResponse.json({ practiceLevel: progress?.practiceLevel ?? 0 });
}

// POST /api/progress
// Body: { characterId: string, score: number, isSuccess: boolean }
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    characterId: string;
    score: number;
    isSuccess: boolean;
  };
  const { characterId, score, isSuccess } = body;
  const userId = session.user.id;

  const character = await db.character.findUnique({
    where: { id: characterId },
    select: { courseId: true, languageId: true },
  });
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  if (character.courseId) {
    await db.userCourse.upsert({
      where: { userId_courseId: { userId, courseId: character.courseId } },
      create: { userId, courseId: character.courseId },
      update: {},
    });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let practiceSession = await db.practiceSession.findFirst({
    where: { userId, languageId: character.languageId, startedAt: { gte: todayStart } },
  });
  if (!practiceSession) {
    practiceSession = await db.practiceSession.create({
      data: { userId, languageId: character.languageId },
    });
  }

  await db.strokeAttempt.create({
    data: { sessionId: practiceSession.id, characterId, score, isSuccess },
  });

  const existing = await db.userProgress.findUnique({
    where: { userId_characterId: { userId, characterId } },
    select: { practiceLevel: true, repetitions: true, easeFactor: true, interval: true },
  });

  const currentLevel = existing?.practiceLevel ?? 0;
  const newLevel = isSuccess ? Math.min(5, currentLevel + 1) : currentLevel;
  const sm2 = calculateSM2(
    isSuccess,
    existing?.repetitions ?? 0,
    existing?.easeFactor ?? 2.5,
    existing?.interval ?? 0,
  );

  await db.userProgress.upsert({
    where: { userId_characterId: { userId, characterId } },
    create: {
      userId,
      characterId,
      practiceLevel: newLevel,
      successCount: isSuccess ? 1 : 0,
      failCount: isSuccess ? 0 : 1,
      lastPracticed: new Date(),
      repetitions: sm2.repetitions,
      interval: sm2.interval,
      easeFactor: sm2.easeFactor,
      nextReview: sm2.nextReview,
    },
    update: {
      practiceLevel: newLevel,
      ...(isSuccess ? { successCount: { increment: 1 } } : { failCount: { increment: 1 } }),
      lastPracticed: new Date(),
      repetitions: sm2.repetitions,
      interval: sm2.interval,
      easeFactor: sm2.easeFactor,
      nextReview: sm2.nextReview,
    },
  });

  const newTotal = practiceSession.totalChars + 1;
  const newCorrect = practiceSession.correctCount + (isSuccess ? 1 : 0);
  await db.practiceSession.update({
    where: { id: practiceSession.id },
    data: {
      totalChars: newTotal,
      correctCount: newCorrect,
      score: newTotal > 0 ? (newCorrect / newTotal) * 100 : 0,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ practiceLevel: newLevel, mastered: newLevel >= 5 });
}
