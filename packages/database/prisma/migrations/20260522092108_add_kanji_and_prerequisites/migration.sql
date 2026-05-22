-- AlterTable
ALTER TABLE "user" ADD COLUMN "stats" TEXT;

-- CreateTable
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "courseId" TEXT,
    "text" TEXT NOT NULL,
    "kana" TEXT,
    "reading" TEXT,
    "meaning" TEXT NOT NULL,
    "audioText" TEXT,
    "courseLevel" INTEGER NOT NULL DEFAULT 1,
    "etymology" TEXT,
    "components" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "word_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "word_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "phrase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "courseId" TEXT,
    "text" TEXT NOT NULL,
    "reading" TEXT,
    "translation" TEXT NOT NULL,
    "audioText" TEXT,
    "courseLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "phrase_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "phrase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_course_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'character',
    "level" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prerequisiteId" TEXT,
    CONSTRAINT "course_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "course_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_course" ("createdAt", "description", "id", "languageId", "level", "title") SELECT "createdAt", "description", "id", "languageId", "level", "title" FROM "course";
DROP TABLE "course";
ALTER TABLE "new_course" RENAME TO "course";
CREATE INDEX "course_languageId_idx" ON "course"("languageId");
CREATE UNIQUE INDEX "course_languageId_type_level_key" ON "course"("languageId", "type", "level");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "user_stats_userId_idx" ON "user_stats"("userId");

-- CreateIndex
CREATE INDEX "word_languageId_idx" ON "word"("languageId");

-- CreateIndex
CREATE INDEX "word_courseId_idx" ON "word"("courseId");

-- CreateIndex
CREATE INDEX "phrase_languageId_idx" ON "phrase"("languageId");

-- CreateIndex
CREATE INDEX "phrase_courseId_idx" ON "phrase"("courseId");

-- CreateIndex
CREATE INDEX "user_course_userId_idx" ON "user_course"("userId");

-- CreateIndex
CREATE INDEX "user_course_courseId_idx" ON "user_course"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "user_course_userId_courseId_key" ON "user_course"("userId", "courseId");
