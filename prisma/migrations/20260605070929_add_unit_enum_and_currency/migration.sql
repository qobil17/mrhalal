/*
  Warnings:

  - The `unit` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "unit" AS ENUM ('G', 'KG', 'L', 'ML', 'PIECE');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'KRW',
DROP COLUMN "unit",
ADD COLUMN     "unit" "unit" NOT NULL DEFAULT 'KG';
