/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,dayOfWeek]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Schedule_doctorId_dayOfWeek_key" ON "Schedule"("doctorId", "dayOfWeek");
