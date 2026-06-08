-- AlterTable
ALTER TABLE "Recipe" RENAME COLUMN "serves" TO "yieldQuantity";
ALTER TABLE "Recipe" ADD COLUMN "yieldUnit" TEXT NOT NULL DEFAULT 'servings';
