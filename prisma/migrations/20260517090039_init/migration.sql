CREATE TABLE `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
);

CREATE TABLE `Owner` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `gender` ENUM('male', 'female', 'other') NOT NULL DEFAULT 'other',
  `street` VARCHAR(100) NOT NULL DEFAULT 'N/A',
  `number` VARCHAR(20) NOT NULL DEFAULT 'N/A',
  `neighborhood` VARCHAR(100) NOT NULL DEFAULT 'N/A',
  `city` VARCHAR(100) NOT NULL DEFAULT 'N/A',
  `state` VARCHAR(100) NOT NULL DEFAULT 'N/A',
  `zipCode` VARCHAR(10) NOT NULL DEFAULT '00000',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `Pet` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `species` VARCHAR(50) NOT NULL,
  `breed` VARCHAR(50) NOT NULL,
  `gender` ENUM('male', 'female') NOT NULL DEFAULT 'male',
  `birthDate` DATETIME NOT NULL,
  `photoUrl` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ownerId` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`)
);

CREATE TABLE `MedicalRecord` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `diagnosis` TEXT NOT NULL,
  `treatment` TEXT NOT NULL,
  `notes` TEXT NULL,
  `weight` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `petId` INT NOT NULL,
  `userId` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`),
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
);

CREATE TABLE `Vaccination` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `vaccineName` VARCHAR(100) NOT NULL,
  `dateApplied` DATETIME NOT NULL,
  `nextDoseDate` DATETIME NOT NULL,
  `petId` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`)
);

CREATE TABLE `Appointment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` DATETIME NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `petId` INT NOT NULL,
  `userId` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`),
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
);

CREATE TABLE `InventoryItem` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `category` ENUM('medical', 'operational') NOT NULL,
  `quantity` INT NOT NULL,
  `minStock` INT NOT NULL,
  `unit` VARCHAR(30) NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `InventoryMovement` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` ENUM('in', 'out') NOT NULL,
  `quantity` INT NOT NULL,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` VARCHAR(255) NOT NULL,
  `itemId` INT NOT NULL,
  `userId` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`itemId`) REFERENCES `InventoryItem`(`id`),
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
);