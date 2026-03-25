import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const DIR = "./images/screenshots";
const QUOTE_ID = "cmn5zacxf0000dwz6p2b719av";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Login
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[type="email"]', "debora@drmodelagem.com");
  await page.fill('input[type="password"]', "dr@modelagem2024");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  // Quote detail
  await page.goto(`${BASE}/orcamentos/${QUOTE_ID}`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/05-orcamento-detalhe.png`, fullPage: false });
  console.log("✅ 05-orcamento-detalhe.png");

  // Also re-take orcamentos list (now has data)
  await page.goto(`${BASE}/orcamentos`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/03-orcamentos-lista.png`, fullPage: false });
  console.log("✅ 03-orcamentos-lista.png (updated with data)");

  // Re-take dashboard (now has data)
  await page.goto(`${BASE}/dashboard`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/02-dashboard.png`, fullPage: false });
  console.log("✅ 02-dashboard.png (updated with data)");

  // Re-take clientes (now has Atelier Rosa)
  await page.goto(`${BASE}/configuracoes/clientes`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/10-clientes.png`, fullPage: false });
  console.log("✅ 10-clientes.png (updated with data)");

  await browser.close();
}

main().catch(console.error);
