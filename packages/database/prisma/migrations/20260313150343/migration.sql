/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expiresAt" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" DATETIME,
    "refreshTokenExpiresAt" DATETIME,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "language" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "script" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "courseId" TEXT,
    "label" TEXT NOT NULL,
    "audioText" TEXT NOT NULL,
    "strokeCount" INTEGER,
    "jlpt" TEXT,
    "courseLevel" INTEGER NOT NULL DEFAULT 1,
    "svgPaths" TEXT NOT NULL,
    "meanings" TEXT,
    "romaji" TEXT,
    "readings" TEXT,
    CONSTRAINT "character_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "character_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "practiceLevel" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "nextReview" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "lastPracticed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_progress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "practice_session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "totalChars" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "score" REAL,
    CONSTRAINT "practice_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "practice_session_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stroke_attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "strokeData" TEXT,
    "score" REAL NOT NULL,
    "feedback" TEXT,
    "isSuccess" BOOLEAN NOT NULL DEFAULT false,
    "attemptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stroke_attempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "practice_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stroke_attempt_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "language_code_key" ON "language"("code");

-- CreateIndex
CREATE INDEX "course_languageId_idx" ON "course"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "course_languageId_level_key" ON "course"("languageId", "level");

-- CreateIndex
CREATE INDEX "character_languageId_idx" ON "character"("languageId");

-- CreateIndex
CREATE INDEX "character_courseId_idx" ON "character"("courseId");

-- CreateIndex
CREATE INDEX "user_progress_userId_idx" ON "user_progress"("userId");

-- CreateIndex
CREATE INDEX "user_progress_characterId_idx" ON "user_progress"("characterId");

-- CreateIndex
CREATE INDEX "user_progress_userId_nextReview_idx" ON "user_progress"("userId", "nextReview");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_characterId_key" ON "user_progress"("userId", "characterId");

-- CreateIndex
CREATE INDEX "practice_session_userId_idx" ON "practice_session"("userId");

-- CreateIndex
CREATE INDEX "practice_session_languageId_idx" ON "practice_session"("languageId");

-- CreateIndex
CREATE INDEX "stroke_attempt_sessionId_idx" ON "stroke_attempt"("sessionId");

-- CreateIndex
CREATE INDEX "stroke_attempt_characterId_idx" ON "stroke_attempt"("characterId");
