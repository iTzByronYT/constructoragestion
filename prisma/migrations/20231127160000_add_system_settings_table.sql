-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "language" TEXT NOT NULL DEFAULT 'es',
    "currency" TEXT NOT NULL DEFAULT 'HNL',
    "exchangeRate" REAL NOT NULL DEFAULT 24.5,
    "timezone" TEXT NOT NULL DEFAULT 'America/Tegucigalpa',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "autoBackup" BOOLEAN NOT NULL DEFAULT true,
    "backupFrequency" TEXT NOT NULL DEFAULT 'daily',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Insertar configuración por defecto
INSERT INTO "system_settings" ("id") VALUES ('default');
