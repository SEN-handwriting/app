import { auth } from "@repo/auth/server";
import { db } from "@repo/database/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [progressCount, mastered, sessionCount] = await Promise.all([
    db.userProgress.count({ where: { userId } }),
    db.userProgress.count({ where: { userId, practiceLevel: 2 } }),
    db.practiceSession.count({ where: { userId } }),
  ]);

  return NextResponse.json({ progressCount, mastered, sessionCount });
}
