-- CreateIndex
CREATE INDEX "articles_updatedAt_idx" ON "articles"("updatedAt");

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");
