"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();

  // Si ya hay sesión iniciada, mandar directo a la página principal
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    });
  }, [router]);

  async function entrar(proveedor: "google" | "discord") {
    await supabase.auth.signInWithOAuth({
      provider: proveedor,
      options: { redirectTo: `${window.location.origin}/` },
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6">
      <h1 className="text-5xl font-bold text-white">Mis Clips 🎮</h1>
      <p className="max-w-sm text-center text-gray-400">
        Entra con tu cuenta para ver los clips de la muchachada.
      </p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={() => entrar("google")}
          className="rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:bg-gray-200"
        >
          Continuar con Google
        </button>
        <button
          onClick={() => entrar("discord")}
          className="rounded-lg bg-[#5865F2] px-4 py-3 font-semibold text-white transition hover:bg-[#4752c4]"
        >
          Continuar con Discord
        </button>
      </div>

      <a href="/privacidad" className="text-sm text-gray-500 underline">
        Política de privacidad
      </a>
    </main>
  );
}