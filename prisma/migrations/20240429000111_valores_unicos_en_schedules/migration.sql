/*
  Warnings:

  - A unique constraint covering the columns `[initial_day,final_day,opening_time,closing_time]` on the table `schedules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "schedules_initial_day_final_day_opening_time_closing_time_key" ON "schedules"("initial_day", "final_day", "opening_time", "closing_time");
