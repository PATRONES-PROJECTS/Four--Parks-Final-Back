-- CreateTable
CREATE TABLE "types_parking" (
    "id_type_parking" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "types_parking_pkey" PRIMARY KEY ("id_type_parking")
);

-- CreateTable
CREATE TABLE "locations" (
    "id_location" SERIAL NOT NULL,
    "id_city_fk" INTEGER NOT NULL,
    "name_location" VARCHAR(50) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id_location")
);

-- CreateTable
CREATE TABLE "cities" (
    "id_city" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id_city")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id_schedule" SERIAL NOT NULL,
    "day" VARCHAR(25) NOT NULL,
    "opening_time" INTEGER NOT NULL,
    "closing_time" INTEGER NOT NULL,
    "id_parking_fk" INTEGER NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id_schedule")
);

-- CreateTable
CREATE TABLE "parkings" (
    "id_parking" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT DEFAULT '',
    "address" VARCHAR(50) NOT NULL,
    "coordinates" VARCHAR(50) NOT NULL,
    "image_path" VARCHAR(255) NOT NULL,
    "has_loyalty_service" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "id_location_fk" INTEGER NOT NULL,
    "id_type_parking_fk" INTEGER NOT NULL,
    "id_user_fk" INTEGER NOT NULL,

    CONSTRAINT "parkings_pkey" PRIMARY KEY ("id_parking")
);

-- CreateTable
CREATE TABLE "parking_controllers" (
    "id_parking_controller" SERIAL NOT NULL,
    "capacity" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "id_vehicle_fk" INTEGER NOT NULL,
    "id_parking_fk" INTEGER NOT NULL,

    CONSTRAINT "parking_controllers_pkey" PRIMARY KEY ("id_parking_controller")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id_vehicle" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id_vehicle")
);

-- CreateTable
CREATE TABLE "roles" (
    "id_role" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT DEFAULT '',

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "user" VARCHAR(255) NOT NULL,
    "mail" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "identificacion_card" VARCHAR(50) NOT NULL,
    "id_active" BOOLEAN DEFAULT true,
    "id_role_fk" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "records" (
    "id_record" SERIAL NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "date" DATE NOT NULL,
    "ip_user" VARCHAR(50) NOT NULL,
    "id_user_fk" INTEGER NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id_record")
);

-- CreateTable
CREATE TABLE "loyalties" (
    "id_loyalty" SERIAL NOT NULL,
    "loyalty_points" INTEGER NOT NULL,
    "id_user_fk" INTEGER NOT NULL,

    CONSTRAINT "loyalties_pkey" PRIMARY KEY ("id_loyalty")
);

-- CreateTable
CREATE TABLE "cards" (
    "id_card" SERIAL NOT NULL,
    "number" VARCHAR(255) NOT NULL,
    "cvc" VARCHAR(25) NOT NULL,
    "expiration_date" VARCHAR(25) NOT NULL,
    "id_user_fk" INTEGER NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id_card")
);

-- CreateTable
CREATE TABLE "user_controllers" (
    "id_user_controller" SERIAL NOT NULL,
    "is_first_time" BOOLEAN DEFAULT true,
    "is_account_blocked" BOOLEAN DEFAULT false,
    "verificacion_token" VARCHAR(255),
    "login_attemps" INTEGER NOT NULL,
    "id_user_fk" INTEGER NOT NULL,

    CONSTRAINT "user_controllers_pkey" PRIMARY KEY ("id_user_controller")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id_reservation" SERIAL NOT NULL,
    "reservation_date" TIMESTAMP(3) NOT NULL,
    "entry_reservation_date" TIMESTAMP(3) NOT NULL,
    "departure_reservation_date" TIMESTAMP(3) NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "vehicle_code" VARCHAR(50) NOT NULL,
    "id_vehicle_fk" INTEGER NOT NULL,
    "id_user_fk" INTEGER NOT NULL,
    "id_parking_fk" INTEGER NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id_reservation")
);

-- CreateTable
CREATE TABLE "invoces" (
    "id_invoce" SERIAL NOT NULL,
    "reserve_amount" INTEGER NOT NULL,
    "service_amount" INTEGER NOT NULL,
    "extra_time_amount" INTEGER DEFAULT 0,
    "time" INTEGER NOT NULL,
    "payment_token" VARCHAR(255) NOT NULL DEFAULT '',
    "id_payment_method_fk" INTEGER NOT NULL,
    "id_reservation_fk" INTEGER NOT NULL,

    CONSTRAINT "invoces_pkey" PRIMARY KEY ("id_invoce")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id_payment_method" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id_payment_method")
);

-- CreateIndex
CREATE UNIQUE INDEX "types_parking_name_key" ON "types_parking"("name");

-- CreateIndex
CREATE UNIQUE INDEX "location_unique" ON "locations"("id_city_fk", "name_location");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "parkings_name_key" ON "parkings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "parkings_address_key" ON "parkings"("address");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_name_key" ON "vehicles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_key" ON "users"("user");

-- CreateIndex
CREATE UNIQUE INDEX "users_mail_key" ON "users"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "users_identificacion_card_key" ON "users"("identificacion_card");

-- CreateIndex
CREATE UNIQUE INDEX "loyalties_id_user_fk_key" ON "loyalties"("id_user_fk");

-- CreateIndex
CREATE UNIQUE INDEX "cards_id_user_fk_key" ON "cards"("id_user_fk");

-- CreateIndex
CREATE UNIQUE INDEX "user_controllers_id_user_fk_key" ON "user_controllers"("id_user_fk");

-- CreateIndex
CREATE UNIQUE INDEX "invoces_id_reservation_fk_key" ON "invoces"("id_reservation_fk");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_id_city_fk_fkey" FOREIGN KEY ("id_city_fk") REFERENCES "cities"("id_city") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_id_parking_fk_fkey" FOREIGN KEY ("id_parking_fk") REFERENCES "parkings"("id_parking") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_id_location_fk_fkey" FOREIGN KEY ("id_location_fk") REFERENCES "locations"("id_location") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_id_type_parking_fk_fkey" FOREIGN KEY ("id_type_parking_fk") REFERENCES "types_parking"("id_type_parking") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_id_user_fk_fkey" FOREIGN KEY ("id_user_fk") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parking_controllers" ADD CONSTRAINT "parking_controllers_id_vehicle_fk_fkey" FOREIGN KEY ("id_vehicle_fk") REFERENCES "vehicles"("id_vehicle") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parking_controllers" ADD CONSTRAINT "parking_controllers_id_parking_fk_fkey" FOREIGN KEY ("id_parking_fk") REFERENCES "parkings"("id_parking") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_role_fk_fkey" FOREIGN KEY ("id_role_fk") REFERENCES "roles"("id_role") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_id_user_fk_fkey" FOREIGN KEY ("id_user_fk") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loyalties" ADD CONSTRAINT "loyalties_id_user_fk_fkey" FOREIGN KEY ("id_user_fk") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_id_user_fk_fkey" FOREIGN KEY ("id_user_fk") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_controllers" ADD CONSTRAINT "user_controllers_id_user_fk_fkey" FOREIGN KEY ("id_user_fk") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_id_vehicle_fk_fkey" FOREIGN KEY ("id_vehicle_fk") REFERENCES "vehicles"("id_vehicle") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_id_user_fk_fkey" FOREIGN KEY ("id_user_fk") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_id_parking_fk_fkey" FOREIGN KEY ("id_parking_fk") REFERENCES "parkings"("id_parking") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoces" ADD CONSTRAINT "invoces_id_payment_method_fk_fkey" FOREIGN KEY ("id_payment_method_fk") REFERENCES "payment_methods"("id_payment_method") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoces" ADD CONSTRAINT "invoces_id_reservation_fk_fkey" FOREIGN KEY ("id_reservation_fk") REFERENCES "reservations"("id_reservation") ON DELETE CASCADE ON UPDATE NO ACTION;
