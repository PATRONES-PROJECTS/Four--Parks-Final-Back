/*
  Warnings:

  - You are about to drop the `invoces` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoces" DROP CONSTRAINT "invoces_id_payment_method_fk_fkey";

-- DropForeignKey
ALTER TABLE "invoces" DROP CONSTRAINT "invoces_id_reservation_fk_fkey";

-- DropTable
DROP TABLE "invoces";

-- CreateTable
CREATE TABLE "invoices" (
    "id_invoice" SERIAL NOT NULL,
    "reserve_amount" INTEGER NOT NULL,
    "service_amount" INTEGER NOT NULL,
    "extra_time_amount" INTEGER DEFAULT 0,
    "refund_amount" INTEGER DEFAULT 0,
    "total_amount" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "payment_token" VARCHAR(255) NOT NULL DEFAULT '',
    "id_payment_method_fk" INTEGER NOT NULL,
    "id_reservation_fk" INTEGER NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id_invoice")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_id_reservation_fk_key" ON "invoices"("id_reservation_fk");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_id_payment_method_fk_fkey" FOREIGN KEY ("id_payment_method_fk") REFERENCES "payment_methods"("id_payment_method") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_id_reservation_fk_fkey" FOREIGN KEY ("id_reservation_fk") REFERENCES "reservations"("id_reservation") ON DELETE CASCADE ON UPDATE NO ACTION;
