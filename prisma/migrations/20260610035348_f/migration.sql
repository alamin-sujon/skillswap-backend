/*
  Warnings:

  - A unique constraint covering the columns `[userAId,userBId,skillPostId]` on the table `matches` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `skillPostId` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "matches_userAId_userBId_key";

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "skillPostId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "matches_userAId_userBId_skillPostId_key" ON "matches"("userAId", "userBId", "skillPostId");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_skillPostId_fkey" FOREIGN KEY ("skillPostId") REFERENCES "skill_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
