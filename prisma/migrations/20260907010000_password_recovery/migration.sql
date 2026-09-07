CREATE TABLE "PasswordReset" (
 "tokenHash" TEXT NOT NULL,
 "email" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("tokenHash")
);
CREATE INDEX "PasswordReset_email_idx" ON "PasswordReset"("email");
