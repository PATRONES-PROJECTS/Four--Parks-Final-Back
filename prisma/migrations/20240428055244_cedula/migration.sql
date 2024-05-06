/*
  Warnings:

  - You are about to drop the column `identificacion_card` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[identification_card]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identification_card` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_identificacion_card_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "identificacion_card",
ADD COLUMN     "identification_card" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_identification_card_key" ON "users"("identification_card");
