/*
  Warnings:

  - Added the required column `total_amount` to the `invoces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `reservations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoces" ADD COLUMN     "refund_amount" INTEGER DEFAULT 0,
ADD COLUMN     "total_amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "state" VARCHAR(25) NOT NULL;
