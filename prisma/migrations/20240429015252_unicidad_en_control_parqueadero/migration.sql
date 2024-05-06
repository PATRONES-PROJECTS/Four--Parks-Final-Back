/*
  Warnings:

  - A unique constraint covering the columns `[id_vehicle_fk,id_parking_fk]` on the table `parking_controllers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "parking_controllers_id_vehicle_fk_id_parking_fk_key" ON "parking_controllers"("id_vehicle_fk", "id_parking_fk");
