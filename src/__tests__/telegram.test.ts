import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Telegram — reset de senha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("gera senha temporária no formato Palavra@NNNN", async () => {
    const { generateTempPassword } = await import(
      "../app/api/auth/reset-password/route"
    );
    for (let i = 0; i < 20; i++) {
      const senha = generateTempPassword();
      expect(senha).toMatch(/^[A-Za-z]+@\d{4}$/);
    }
  });

  it("retorna resposta genérica para email inexistente (status 200)", async () => {
    const { POST } = await import(
      "../app/api/auth/reset-password/route"
    );
    const req = new Request(
      "http://localhost/api/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ email: "naoexiste@teste.com" }),
        headers: { "Content-Type": "application/json" },
      }
    );
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain("Telegram");
  });

  it("envia mensagem Telegram via sendTelegramMessage", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    vi.stubEnv("TELEGRAM_BOT_TOKEN", "fake-token");
    vi.stubEnv("TELEGRAM_CHAT_ID", "123456789");

    // Re-import to pick up env
    const { sendTelegramMessage } = await import("../lib/telegram");
    const result = await sendTelegramMessage("123456789", "Teste de senha");

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("sendMessage"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Teste de senha"),
      })
    );
  });
});
