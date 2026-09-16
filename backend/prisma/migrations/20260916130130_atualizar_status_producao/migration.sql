-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Producao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'aguardando_material',
    "dataInicio" DATETIME,
    "dataFim" DATETIME,
    "orcamentoId" INTEGER NOT NULL,
    CONSTRAINT "Producao_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "Orcamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Producao" ("dataFim", "dataInicio", "id", "orcamentoId", "status") SELECT "dataFim", "dataInicio", "id", "orcamentoId", "status" FROM "Producao";
DROP TABLE "Producao";
ALTER TABLE "new_Producao" RENAME TO "Producao";
CREATE UNIQUE INDEX "Producao_orcamentoId_key" ON "Producao"("orcamentoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
