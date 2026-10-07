"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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

      // Enlaces temporales (duran 1 hora) para reproducir los videos
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

  async function salir() {
    await supabase.auth.signOut();
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-gray-400">Cargando...</p>
      </main>
    );
  }

  const rol: Rol = perfil?.role ?? "guest";
  const puedeSubir = rol === "admin" || rol === "uploader";
  const nombre = perfil?.display_name ?? user?.email ?? "Sin nombre";

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Barra superior */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h1 className="text-2xl font-bold">Mis Clips 🎮</h1>

        <div className="flex items-center gap-3">
          {perfil?.avatar_url && (
            <img
              src={perfil.avatar_url}
              alt=""
              className="h-9 w-9 rounded-full"
            />
          )}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{nombre}</p>
            <p className="text-xs text-gray-400">{nombreRol[rol]}</p>
          </div>
          <button
            onClick={salir}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm transition hover:bg-white/10"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Contenido */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Galería</h2>

          {puedeSubir && (
            <Link
              href="/subir"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold transition hover:bg-green-700"
            >
              Subir clip
            </Link>
          )}
        </div>

        {clips.length === 0 ? (
          <p className="text-gray-400">Todavía no hay clips.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clips.map((clip) => (
              <li
                key={clip.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
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
                  <p className="font-semibold">{clip.title}</p>
                  {clip.game && (
                    <p className="text-sm text-gray-400">{clip.game}</p>
                  )}
                  {clip.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {clip.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}