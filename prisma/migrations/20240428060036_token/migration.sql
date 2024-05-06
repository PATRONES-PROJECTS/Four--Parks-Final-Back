/*
  Warnings:

  - You are about to drop the column `verificacion_token` on the `user_controllers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_controllers" DROP COLUMN "verificacion_token",
ADD COLUMN     "verification_token" VARCHAR(255);
