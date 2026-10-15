"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FaGoogle, FaDiscord } from "react-icons/fa6";
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
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="tarjeta w-full max-w-sm rounded-3xl p-8 text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mx-auto w-56"
        >
          <Image
            src="/logo.png"
            alt="La Muchachada DX"
            width={448}
            height={448}
            loading="eager"
            className="animate-pulso-neon h-auto w-full"
          />
        </motion.div>

        <p className="mt-4 text-sm text-gray-400">
          Entra con tu cuenta para ver los clips de la muchachada.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => entrar("google")}
            className="flex items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-black"
          >
            <FaGoogle /> Continuar con Google
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => entrar("discord")}
            className="flex items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-4 py-3 font-semibold text-white"
          >
            <FaDiscord /> Continuar con Discord
          </motion.button>
        </div>

        <a
          href="/privacidad"
          className="mt-6 inline-block text-xs text-gray-500 underline"
        >
          Política de privacidad
        </a>
      </motion.div>
    </main>
  );
}