/*
  Warnings:

  - Added the required column `time` to the `records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "records" ADD COLUMN     "time" VARCHAR(25) NOT NULL;
