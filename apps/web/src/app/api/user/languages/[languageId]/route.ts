import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@repo/auth/server";
import { db } from "@repo/database/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ languageId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { languageId } = await params;
  const body = await request.json() as { status: string };

  if (body.status !== "active" && body.status !== "inactive") {
    return NextResponse.json({ error: "status doit être 'active' ou 'inactive'" }, { status: 400 });
  }

  const userId = session.user.id;

  await db.userLanguagePreference.upsert({
    where: { userId_languageId: { userId, languageId } },
    create: { userId, languageId, status: body.status },
    update: { status: body.status },
  });

  return NextResponse.json({ ok: true });
}
