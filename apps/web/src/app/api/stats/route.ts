import { auth } from "@repo/auth/server";
import { db } from "@repo/database/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function computeStreak(sessions: { startedAt: Date }[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => s.startedAt.toISOString().slice(0, 10)));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function last30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [progressCount, mastered, sessionCount, allSessions] = await Promise.all([
    db.userProgress.count({ where: { userId } }),
    db.userProgress.count({ where: { userId, practiceLevel: { gte: 5 } } }),
    db.practiceSession.count({ where: { userId } }),
    db.practiceSession.findMany({
      where: { userId },
      select: { startedAt: true },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  const streak = computeStreak(allSessions);
  const activeDaysSet = new Set(allSessions.map((s) => s.startedAt.toISOString().slice(0, 10)));
  const activityDays = last30Days().map((day) => ({ day, active: activeDaysSet.has(day) }));

  return NextResponse.json({ progressCount, mastered, sessionCount, streak, activityDays });
}
