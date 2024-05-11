/*
  Warnings:

  - A unique constraint covering the columns `[id_user_fk]` on the table `parkings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "parkings" ALTER COLUMN "id_user_fk" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "parkings_id_user_fk_key" ON "parkings"("id_user_fk");
