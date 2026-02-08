/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `roadmap_items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `blog_posts` ADD COLUMN `contributorIds` JSON NULL,
    ADD COLUMN `description` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `components` ADD COLUMN `componentCode` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `cssVariables` JSON NULL,
    ADD COLUMN `spacingScale` JSON NULL;

-- AlterTable
ALTER TABLE `roadmap_items` ADD COLUMN `eta` VARCHAR(191) NULL,
    ADD COLUMN `slug` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sessions` ADD COLUMN `ipAddress` VARCHAR(191) NULL,
    ADD COLUMN `userAgent` TEXT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `banReason` TEXT NULL,
    ADD COLUMN `bannedAt` DATETIME(3) NULL,
    ADD COLUMN `isBanned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastLoginAt` DATETIME(3) NULL,
    ADD COLUMN `lastLoginIp` VARCHAR(191) NULL,
    MODIFY `role` ENUM('hobby', 'pro', 'elite', 'admin', 'banned') NOT NULL DEFAULT 'hobby';

-- CreateTable
CREATE TABLE `login_history` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `userAgent` TEXT NULL,
    `success` BOOLEAN NOT NULL,
    `failReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `login_history_userId_idx`(`userId`),
    INDEX `login_history_ipAddress_idx`(`ipAddress`),
    INDEX `login_history_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('hobby', 'pro', 'elite', 'admin', 'banned') NOT NULL,
    `resource` ENUM('project', 'page', 'component', 'user', 'blog', 'doc', 'roadmap', 'deployment', 'settings', 'analytics') NOT NULL,
    `action` ENUM('create', 'read', 'update', 'delete', 'manage') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `role_permissions_role_idx`(`role`),
    UNIQUE INDEX `role_permissions_role_resource_action_key`(`role`, `resource`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_permissions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `resource` ENUM('project', 'page', 'component', 'user', 'blog', 'doc', 'roadmap', 'deployment', 'settings', 'analytics') NOT NULL,
    `action` ENUM('create', 'read', 'update', 'delete', 'manage') NOT NULL,
    `allowed` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_permissions_userId_idx`(`userId`),
    UNIQUE INDEX `user_permissions_userId_resource_action_key`(`userId`, `resource`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` ENUM('user_login', 'user_logout', 'user_register', 'user_banned', 'user_unbanned', 'role_changed', 'permission_granted', 'permission_revoked', 'project_created', 'project_deleted', 'content_flagged', 'content_approved', 'content_rejected', 'settings_changed') NOT NULL,
    `resource` VARCHAR(191) NULL,
    `resourceId` VARCHAR(191) NULL,
    `details` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flagged_content` (
    `id` VARCHAR(191) NOT NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `contentId` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `reportedBy` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `flagged_content_status_idx`(`status`),
    INDEX `flagged_content_contentType_contentId_idx`(`contentType`, `contentId`),
    INDEX `flagged_content_reportedBy_idx`(`reportedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moderation_actions` (
    `id` VARCHAR(191) NOT NULL,
    `flaggedContentId` VARCHAR(191) NOT NULL,
    `moderatorId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `moderation_actions_flaggedContentId_idx`(`flaggedContentId`),
    INDEX `moderation_actions_moderatorId_idx`(`moderatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `component_versions` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `content` JSON NULL,
    `style` JSON NULL,
    `code` LONGTEXT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `component_versions_componentId_idx`(`componentId`),
    UNIQUE INDEX `component_versions_componentId_version_key`(`componentId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_collaborators` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('viewer', 'editor', 'admin') NOT NULL DEFAULT 'viewer',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `page_collaborators_pageId_idx`(`pageId`),
    INDEX `page_collaborators_userId_idx`(`userId`),
    UNIQUE INDEX `page_collaborators_pageId_userId_key`(`pageId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_comments` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `elementId` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `page_comments_pageId_idx`(`pageId`),
    INDEX `page_comments_userId_idx`(`userId`),
    INDEX `page_comments_elementId_idx`(`elementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_comment_threads` (
    `id` VARCHAR(191) NOT NULL,
    `commentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `page_comment_threads_commentId_idx`(`commentId`),
    INDEX `page_comment_threads_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_sections` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `elementId` VARCHAR(191) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `page_sections_pageId_idx`(`pageId`),
    INDEX `page_sections_elementId_idx`(`elementId`),
    UNIQUE INDEX `page_sections_pageId_elementId_key`(`pageId`, `elementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_preview_links` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `password` TEXT NULL,
    `expiresAt` DATETIME(3) NULL,
    `accessCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `page_preview_links_token_key`(`token`),
    INDEX `page_preview_links_pageId_idx`(`pageId`),
    INDEX `page_preview_links_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `roadmap_items_slug_key` ON `roadmap_items`(`slug`);

-- CreateIndex
CREATE INDEX `users_isBanned_idx` ON `users`(`isBanned`);

-- AddForeignKey
ALTER TABLE `login_history` ADD CONSTRAINT `login_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flagged_content` ADD CONSTRAINT `flagged_content_reportedBy_fkey` FOREIGN KEY (`reportedBy`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_actions` ADD CONSTRAINT `moderation_actions_flaggedContentId_fkey` FOREIGN KEY (`flaggedContentId`) REFERENCES `flagged_content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_actions` ADD CONSTRAINT `moderation_actions_moderatorId_fkey` FOREIGN KEY (`moderatorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `component_versions` ADD CONSTRAINT `component_versions_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `components`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_collaborators` ADD CONSTRAINT `page_collaborators_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_collaborators` ADD CONSTRAINT `page_collaborators_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_comments` ADD CONSTRAINT `page_comments_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_comments` ADD CONSTRAINT `page_comments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_comment_threads` ADD CONSTRAINT `page_comment_threads_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `page_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_comment_threads` ADD CONSTRAINT `page_comment_threads_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_sections` ADD CONSTRAINT `page_sections_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_preview_links` ADD CONSTRAINT `page_preview_links_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
