/*
  Warnings:

  - You are about to alter the column `extraPermissions` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `roleIds` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `permissions` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "roleIds" JSONB NOT NULL DEFAULT [],
    "extraPermissions" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Account" ("avatar", "createdAt", "email", "extraPermissions", "id", "name", "password", "roleIds", "updatedAt", "username") SELECT "avatar", "createdAt", "email", "extraPermissions", "id", "name", "password", "roleIds", "updatedAt", "username" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");
CREATE TABLE "new_Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Role" ("createdAt", "id", "name", "permissions", "updatedAt") SELECT "createdAt", "id", "name", "permissions", "updatedAt" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
