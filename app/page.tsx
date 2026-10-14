"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  FaPlus,
  FaMagnifyingGlass,
  FaRightFromBracket,
} from "react-icons/fa6";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import Redes from "@/components/Redes";
import Footer from "@/components/Footer";
import TikTokFeed from "@/components/TikTokFeed";

type Rol = "admin" | "uploader" | "guest";

type Perfil = {
  display_name: string | null;
  avatar_url: string | null;
  role: Rol;
};

type Clip = {
  id: string;
  title: string;
  game: string | null;
  description: string | null;
  video_url: string;
  created_at: string;
};

const nombreRol: Record<Rol, string> = {
  admin: "Admin",
  uploader: "Uploader",
  guest: "Invitado",
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [juegoActivo, setJuegoActivo] = useState<string | null>(null);

  // 1) Saber si hay sesión; si no la hay, ir al login
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        router.replace("/login");
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  // 2) Con sesión, cargar perfil, clips y enlaces de los videos
  useEffect(() => {
    if (!user) return;
    const idUsuario = user.id;

    async function cargar() {
      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, role")
        .eq("id", idUsuario)
        .single();
      setPerfil(p as Perfil | null);

      const { data: c } = await supabase
        .from("clips")
        .select("id, title, game, description, video_url, created_at")
        .order("created_at", { ascending: false });
      const lista = (c as Clip[]) ?? [];
      setClips(lista);

      if (lista.length > 0) {
        const { data: firmadas } = await supabase.storage
          .from("clips")
          .createSignedUrls(
            lista.map((x) => x.video_url),
            3600
          );
        const mapa: Record<string, string> = {};
        for (const f of firmadas ?? []) {
          if (f.path && f.signedUrl) mapa[f.path] = f.signedUrl;
        }
        setUrls(mapa);
      }

      setCargando(false);
    }

    cargar();
  }, [user]);

  // Lista de juegos para los filtros
  const juegos = useMemo(
    () =>
      Array.from(
        new Set(clips.map((c) => c.game).filter((g): g is string => !!g))
      ),
    [clips]
  );

  async function salir() {
    await supabase.auth.signOut();
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="cargador" />
      </main>
    );
  }

  const rol: Rol = perfil?.role ?? "guest";
  const puedeSubir = rol === "admin" || rol === "uploader";
  const nombre = perfil?.display_name ?? user?.email ?? "Sin nombre";

  const visibles = clips.filter((c) => {
    const texto = `${c.title} ${c.game ?? ""} ${c.description ?? ""}`.toLowerCase();
    const coincide = texto.includes(busqueda.toLowerCase());
    const juegoOk = !juegoActivo || c.game === juegoActivo;
    return coincide && juegoOk;
  });

  return (
    <main className="min-h-screen">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#040604]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Logo />

          <div className="flex items-center gap-3">
            {perfil?.avatar_url && (
              <img
                src={perfil.avatar_url}
                alt=""
                className="anillo h-9 w-9 rounded-full"
              />
            )}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{nombre}</p>
              <p className="text-xs text-gray-400">{nombreRol[rol]}</p>
            </div>
            <button
              onClick={salir}
              title="Salir"
              className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm transition hover:bg-white/10"
            >
              <FaRightFromBracket />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Portada con el banner */}
      <section className="mx-auto max-w-6xl px-6 pb-6 pt-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto w-full max-w-xl"
        >
          <Image
            src="/banner.png"
            alt="La Muchachada"
            width={1200}
            height={320}
            className="animate-pulso-neon h-auto w-full"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-gray-400"
        >
          Los mejores momentos de la muchachada, en un solo lugar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-6 flex justify-center"
        >
          <Redes />
        </motion.div>
      </section>

      {/* Buscador, filtros y botón de subir */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="tarjeta flex min-w-[220px] flex-1 items-center gap-3 rounded-xl px-4 py-3">
            <FaMagnifyingGlass className="text-gray-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título, juego o descripción..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
            />
          </div>

          {puedeSubir && (
            <Link
              href="/subir"
              className="boton-marca inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm"
            >
              <FaPlus /> Subir clip
            </Link>
          )}
        </div>

        {juegos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setJuegoActivo(null)}
              className={`chip ${juegoActivo === null ? "chip-activo" : ""}`}
            >
              Todos
            </button>
            {juegos.map((j) => (
              <button
                key={j}
                onClick={() => setJuegoActivo(j === juegoActivo ? null : j)}
                className={`chip ${juegoActivo === j ? "chip-activo" : ""}`}
              >
                {j}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Galería */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        {clips.length === 0 ? (
          <p className="py-16 text-center text-gray-400">
            Todavía no hay clips.
          </p>
        ) : visibles.length === 0 ? (
          <p className="py-16 text-center text-gray-400">
            No encontramos clips con esa búsqueda.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((clip, i) => (
              <motion.li
                key={clip.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.07, 0.5) }}
                whileHover={{ y: -6 }}
                className="tarjeta overflow-hidden rounded-2xl"
              >
                {urls[clip.video_url] ? (
                  <video
                    src={`${urls[clip.video_url]}#t=0.1`}
                    controls
                    preload="metadata"
                    playsInline
                    className="aspect-video w-full bg-black"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-black text-sm text-gray-500">
                    Video no disponible
                  </div>
                )}
                <div className="p-4">
                  <p className="text-lg font-semibold">{clip.title}</p>
                  {clip.game && (
                    <span className="insignia mt-2">{clip.game}</span>
                  )}
                  {clip.description && (
                    <p className="mt-2 text-sm text-gray-400">
                      {clip.description}
                    </p>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <TikTokFeed />
      <Footer />
    </main>
  );
}