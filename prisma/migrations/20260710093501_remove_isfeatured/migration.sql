-- DropIndex
DROP INDEX "products_isFeatured_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "isFeatured";
