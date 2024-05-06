/*
  Warnings:

  - You are about to drop the column `id_schedule_fk` on the `parkings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "parkings" DROP CONSTRAINT "parkings_id_schedule_fk_fkey";

-- AlterTable
ALTER TABLE "parkings" DROP COLUMN "id_schedule_fk";
