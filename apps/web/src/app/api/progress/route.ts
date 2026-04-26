import { auth } from "@repo/auth/server";
import { db } from "@repo/database/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// GET /api/progress?characterId=xxx
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ practiceLevel: 0 });

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

  // Auto-enroll in course on first interaction
  if (character.courseId) {
    await db.userCourse.upsert({
      where: { userId_courseId: { userId, courseId: character.courseId } },
      create: { userId, courseId: character.courseId },
      update: {},
    });
  }

  // Get or create today's practice session for this language
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

  // Record attempt
  await db.strokeAttempt.create({
    data: { sessionId: practiceSession.id, characterId, score, isSuccess },
  });

  // Upsert UserProgress — increment practiceLevel on success (capped at 2)
  const existing = await db.userProgress.findUnique({
    where: { userId_characterId: { userId, characterId } },
    select: { practiceLevel: true },
  });

  const currentLevel = existing?.practiceLevel ?? 0;
  const newLevel = isSuccess ? Math.min(5, currentLevel + 1) : currentLevel;

  await db.userProgress.upsert({
    where: { userId_characterId: { userId, characterId } },
    create: {
      userId,
      characterId,
      practiceLevel: newLevel,
      successCount: isSuccess ? 1 : 0,
      failCount: isSuccess ? 0 : 1,
      lastPracticed: new Date(),
    },
    update: {
      practiceLevel: newLevel,
      ...(isSuccess ? { successCount: { increment: 1 } } : { failCount: { increment: 1 } }),
      lastPracticed: new Date(),
    },
  });

  // Update session stats
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
