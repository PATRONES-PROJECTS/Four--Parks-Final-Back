/*
  Warnings:

  - You are about to drop the column `id_active` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "id_active",
ADD COLUMN     "is_active" BOOLEAN DEFAULT true;
