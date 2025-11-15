-- AlterTable
-- Add deleted and deletedAt columns
ALTER TABLE "ChatMessage" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "editedAt" TIMESTAMP(3);

-- Add updatedAt with default value for existing rows
ALTER TABLE "ChatMessage" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to set updatedAt to createdAt if it's null
UPDATE "ChatMessage" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
