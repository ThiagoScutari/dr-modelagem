import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const DIR = "./images/screenshots";
const VIEWPORT = { width: 390, height: 844 };

const pages = [
  { url: "/login", file: "01-login.png" },
  { url: "/dashboard", file: "02-dashboard.png" },
  { url: "/orcamentos", file: "03-orcamentos-lista.png" },
  { url: "/orcamentos/novo", file: "04-orcamento-novo.png" },
  { url: "/despesas", file: "06-despesas.png" },
  { url: "/foco", file: "07-foco-pomodoro.png" },
  { url: "/configuracoes", file: "08-configuracoes.png" },
  { url: "/configuracoes/precos", file: "09-tabela-precos.png" },
  { url: "/configuracoes/clientes", file: "10-clientes.png" },
];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Login first
  console.log("Logging in...");
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");

  // Screenshot login page before logging in
  await page.screenshot({ path: `${DIR}/01-login.png`, fullPage: false });
  console.log("✅ 01-login.png");

  // Perform login
  await page.fill('input[type="email"]', "debora@drmodelagem.com");
  await page.fill('input[type="password"]', "dr@modelagem2024");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForLoadState("networkidle");

  // Screenshot authenticated pages
  for (const p of pages.slice(1)) {
    console.log(`Navigating to ${p.url}...`);
    await page.goto(`${BASE}${p.url}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // extra wait for animations
    await page.screenshot({ path: `${DIR}/${p.file}`, fullPage: false });
    console.log(`✅ ${p.file}`);
  }

  await browser.close();
  console.log("\n🎉 All screenshots captured!");
}

main().catch(console.error);
