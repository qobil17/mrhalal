-- CreateEnum
CREATE TYPE "ProductLabel" AS ENUM ('RECOMMENDED', 'DISCOUNT');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "label" "ProductLabel";

-- CreateTable
CREATE TABLE "banners" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banners_isActive_idx" ON "banners"("isActive");

-- CreateIndex
CREATE INDEX "products_label_idx" ON "products"("label");

-- CreateIndex
CREATE INDEX "products_expiryDate_idx" ON "products"("expiryDate");
