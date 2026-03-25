-- CreateTable
CREATE TABLE "presenter_config" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "observations" TEXT NOT NULL,
    "telegramToken" TEXT,
    "telegramChatId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presenter_config_pkey" PRIMARY KEY ("id")
);
