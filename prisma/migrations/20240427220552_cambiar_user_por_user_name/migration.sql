/*
  Warnings:

  - You are about to drop the column `user` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_name]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_user_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user",
ADD COLUMN     "user_name" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");
