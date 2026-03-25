"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset password state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleResetPassword() {
    const targetEmail = resetEmail || email;
    if (!targetEmail.trim()) {
      setResetMessage("Digite seu e-mail acima.");
      return;
    }

    setResetting(true);
    setResetMessage("");

    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail.trim() }),
      });
      setResetMessage("Senha enviada pelo Telegram!");
    } catch {
      setResetMessage("Erro ao enviar. Tente novamente.");
    }

    setResetting(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-creme to-espuma-light px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt="DR Estúdio de Modelagem"
            width={120}
            height={120}
            priority
            className="rounded-full"
          />
          <h1 className="font-display text-2xl font-light tracking-wide text-noite">
            Estúdio de Modelagem
          </h1>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-noite/70"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!resetEmail) setResetEmail(e.target.value);
              }}
              placeholder="seu@email.com"
              className="input-base"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-noite/70"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-noite/40 tap-target flex items-center justify-center"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-coral font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-mar py-3.5 text-sm font-medium text-white transition-colors hover:bg-mar-dark disabled:opacity-60 tap-target"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Esqueci minha senha */}
        <div className="text-center">
          {!showReset ? (
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-sm text-noite/50 hover:text-noite/70 transition-colors"
            >
              Esqueci minha senha
            </button>
          ) : (
            <div className="space-y-3 rounded-xl bg-white/50 p-4">
              <p className="text-xs text-noite/60">
                Uma senha temporária será enviada pelo Telegram.
              </p>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-base text-sm"
              />
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-noite/10 py-2.5 text-xs font-medium text-noite/70 hover:bg-noite/15 disabled:opacity-60 tap-target"
              >
                {resetting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                {resetting ? "Enviando..." : "Enviar senha pelo Telegram"}
              </button>
              {resetMessage && (
                <p className="text-xs font-medium text-floresta">
                  {resetMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
