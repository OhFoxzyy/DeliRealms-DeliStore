/*
  Warnings:

  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `pages` ADD COLUMN `code` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('User', 'Admin', 'Owner') NOT NULL DEFAULT 'User';
