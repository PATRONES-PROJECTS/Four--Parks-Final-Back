/*
  Warnings:

  - You are about to drop the column `login_attemps` on the `user_controllers` table. All the data in the column will be lost.
  - Added the required column `login_attempts` to the `user_controllers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_controllers" DROP COLUMN "login_attemps",
ADD COLUMN     "login_attempts" INTEGER NOT NULL;
