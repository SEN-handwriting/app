-- CreateTable
CREATE TABLE "user_language_preference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_language_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_language_preference_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "user_language_preference_userId_idx" ON "user_language_preference"("userId");

-- CreateIndex
CREATE INDEX "user_language_preference_languageId_idx" ON "user_language_preference"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "user_language_preference_userId_languageId_key" ON "user_language_preference"("userId", "languageId");
