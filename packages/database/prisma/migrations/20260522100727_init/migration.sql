-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stats" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "script" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'character',
    "level" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prerequisiteId" TEXT,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "practiceLevel" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "nextReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "lastPracticed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalChars" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,

    CONSTRAINT "practice_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phrase" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "courseId" TEXT,
    "text" TEXT NOT NULL,
    "reading" TEXT,
    "translation" TEXT NOT NULL,
    "audioText" TEXT,
    "courseLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_course" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_language_preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_language_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stroke_attempt" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "strokeData" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "isSuccess" BOOLEAN NOT NULL DEFAULT false,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stroke_attempt_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "user_stats_userId_idx" ON "user_stats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "language_code_key" ON "language"("code");

-- CreateIndex
CREATE INDEX "course_languageId_idx" ON "course"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "course_languageId_type_level_key" ON "course"("languageId", "type", "level");

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

-- CreateIndex
CREATE INDEX "user_language_preference_userId_idx" ON "user_language_preference"("userId");

-- CreateIndex
CREATE INDEX "user_language_preference_languageId_idx" ON "user_language_preference"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "user_language_preference_userId_languageId_key" ON "user_language_preference"("userId", "languageId");

-- CreateIndex
CREATE INDEX "stroke_attempt_sessionId_idx" ON "stroke_attempt"("sessionId");

-- CreateIndex
CREATE INDEX "stroke_attempt_characterId_idx" ON "stroke_attempt"("characterId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_session" ADD CONSTRAINT "practice_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_session" ADD CONSTRAINT "practice_session_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word" ADD CONSTRAINT "word_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word" ADD CONSTRAINT "word_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrase" ADD CONSTRAINT "phrase_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrase" ADD CONSTRAINT "phrase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course" ADD CONSTRAINT "user_course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course" ADD CONSTRAINT "user_course_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_language_preference" ADD CONSTRAINT "user_language_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_language_preference" ADD CONSTRAINT "user_language_preference_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stroke_attempt" ADD CONSTRAINT "stroke_attempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "practice_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stroke_attempt" ADD CONSTRAINT "stroke_attempt_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
