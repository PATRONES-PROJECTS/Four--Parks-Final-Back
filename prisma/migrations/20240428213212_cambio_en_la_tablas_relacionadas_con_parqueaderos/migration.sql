/*
  Warnings:

  - You are about to drop the column `coordinates` on the `parkings` table. All the data in the column will be lost.
  - You are about to drop the column `id_location_fk` on the `parkings` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the `locations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_city_fk` to the `parkings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_schedule_fk` to the `parkings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `parkings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `parkings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `final_day` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initial_day` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_id_city_fk_fkey";

-- DropForeignKey
ALTER TABLE "parkings" DROP CONSTRAINT "parkings_id_location_fk_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_id_parking_fk_fkey";

-- AlterTable
ALTER TABLE "parkings" DROP COLUMN "coordinates",
DROP COLUMN "id_location_fk",
ADD COLUMN     "id_city_fk" INTEGER NOT NULL,
ADD COLUMN     "id_schedule_fk" INTEGER NOT NULL,
ADD COLUMN     "latitude" VARCHAR(25) NOT NULL,
ADD COLUMN     "longitude" VARCHAR(25) NOT NULL;

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "day",
ADD COLUMN     "final_day" INTEGER NOT NULL,
ADD COLUMN     "initial_day" INTEGER NOT NULL;

-- DropTable
DROP TABLE "locations";

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_id_city_fk_fkey" FOREIGN KEY ("id_city_fk") REFERENCES "cities"("id_city") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_id_schedule_fk_fkey" FOREIGN KEY ("id_schedule_fk") REFERENCES "schedules"("id_schedule") ON DELETE CASCADE ON UPDATE NO ACTION;
