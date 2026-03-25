import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const DIR = "./images/screenshots";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Login
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[type="email"]', "debora@drmodelagem.com");
  await page.fill('input[type="password"]', "dr@modelagem2024");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);

  // Dashboard
  await page.screenshot({ path: `${DIR}/desktop-01-dashboard.png` });
  console.log("✅ desktop-01-dashboard.png");

  // Orcamentos
  await page.goto(`${BASE}/orcamentos`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/desktop-02-orcamentos.png` });
  console.log("✅ desktop-02-orcamentos.png");

  // Foco
  await page.goto(`${BASE}/foco`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/desktop-03-foco.png` });
  console.log("✅ desktop-03-foco.png");

  await browser.close();
}

main().catch(console.error);
