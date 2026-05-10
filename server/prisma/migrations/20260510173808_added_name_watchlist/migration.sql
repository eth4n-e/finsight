/*
  Warnings:

  - Added the required column `name` to the `WatchlistItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WatchlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_WatchlistItem" ("addedAt", "id", "ticker") SELECT "addedAt", "id", "ticker" FROM "WatchlistItem";
DROP TABLE "WatchlistItem";
ALTER TABLE "new_WatchlistItem" RENAME TO "WatchlistItem";
CREATE UNIQUE INDEX "WatchlistItem_ticker_key" ON "WatchlistItem"("ticker");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
