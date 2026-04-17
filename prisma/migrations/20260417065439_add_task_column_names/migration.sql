-- CreateTable
CREATE TABLE `TaskColumnName` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `name1` VARCHAR(191) NOT NULL DEFAULT 'Vazifalar',
    `name2` VARCHAR(191) NOT NULL DEFAULT 'Jarayonda',
    `name3` VARCHAR(191) NOT NULL DEFAULT 'Ko''rib chiqilmoqda',
    `name4` VARCHAR(191) NOT NULL DEFAULT 'Bajarildi',
    `name5` VARCHAR(191) NOT NULL DEFAULT 'Bajarilmadi',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TaskColumnName_projectId_key`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaskColumnName` ADD CONSTRAINT `TaskColumnName_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
