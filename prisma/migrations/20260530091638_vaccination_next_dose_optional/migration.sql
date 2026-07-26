-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `appointment_ibfk_1`;

-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `appointment_ibfk_2`;

-- DropForeignKey
ALTER TABLE `inventorymovement` DROP FOREIGN KEY `inventorymovement_ibfk_1`;

-- DropForeignKey
ALTER TABLE `inventorymovement` DROP FOREIGN KEY `inventorymovement_ibfk_2`;

-- DropForeignKey
ALTER TABLE `medicalrecord` DROP FOREIGN KEY `medicalrecord_ibfk_1`;

-- DropForeignKey
ALTER TABLE `medicalrecord` DROP FOREIGN KEY `medicalrecord_ibfk_2`;

-- DropForeignKey
ALTER TABLE `pet` DROP FOREIGN KEY `pet_ibfk_1`;

-- DropForeignKey
ALTER TABLE `vaccination` DROP FOREIGN KEY `vaccination_ibfk_1`;

-- AlterTable
ALTER TABLE `appointment` MODIFY `date` DATETIME(3) NOT NULL,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `inventoryitem` MODIFY `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `inventorymovement` MODIFY `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `medicalrecord` MODIFY `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ALTER COLUMN `weight` DROP DEFAULT;

-- AlterTable
ALTER TABLE `owner` ALTER COLUMN `gender` DROP DEFAULT,
    ALTER COLUMN `street` DROP DEFAULT,
    ALTER COLUMN `number` DROP DEFAULT,
    ALTER COLUMN `neighborhood` DROP DEFAULT,
    ALTER COLUMN `city` DROP DEFAULT,
    ALTER COLUMN `state` DROP DEFAULT,
    ALTER COLUMN `zipCode` DROP DEFAULT,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `pet` ALTER COLUMN `gender` DROP DEFAULT,
    MODIFY `birthDate` DATETIME(3) NOT NULL,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `vaccination` MODIFY `dateApplied` DATETIME(3) NOT NULL,
    MODIFY `nextDoseDate` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `Pet` ADD CONSTRAINT `Pet_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vaccination` ADD CONSTRAINT `Vaccination_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryMovement` ADD CONSTRAINT `InventoryMovement_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `InventoryItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryMovement` ADD CONSTRAINT `InventoryMovement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
