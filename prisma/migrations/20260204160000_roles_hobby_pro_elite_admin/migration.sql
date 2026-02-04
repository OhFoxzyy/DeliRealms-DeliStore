-- Migrate Role enum from user/admin/owner to hobby/pro/elite/admin
-- Step 1: Add new enum values
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('user', 'admin', 'owner', 'hobby', 'pro', 'elite') NOT NULL DEFAULT 'user';

-- Step 2: Migrate existing data
UPDATE `users` SET `role` = 'hobby' WHERE `role` = 'user';
UPDATE `users` SET `role` = 'elite' WHERE `role` = 'owner';

-- Step 3: Switch to new enum (admin stays as admin)
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('hobby', 'pro', 'elite', 'admin') NOT NULL DEFAULT 'hobby';
