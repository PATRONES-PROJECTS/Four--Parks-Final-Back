/*
  Warnings:

  - Added the required column `id_schedule_fk` to the `parkings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parkings" ADD COLUMN     "id_schedule_fk" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_id_schedule_fk_fkey" FOREIGN KEY ("id_schedule_fk") REFERENCES "schedules"("id_schedule") ON DELETE CASCADE ON UPDATE NO ACTION;
