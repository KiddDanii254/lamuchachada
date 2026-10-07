"use client";

import { useEffect, useState } from "react";
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

  // 2) Con sesión, cargar el perfil y los clips
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
        .select("id, title, game, created_at")
        .order("created_at", { ascending: false });
      setClips((c as Clip[]) ?? []);

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
  const nombre =
    perfil?.display_name ?? user?.email ?? "Sin nombre";

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
            <button
              disabled
              title="Lo activamos en el siguiente paso"
              className="cursor-not-allowed rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold opacity-50"
            >
              Subir clip (próximamente)
            </button>
          )}
        </div>

        {clips.length === 0 ? (
          <p className="text-gray-400">Todavía no hay clips.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clips.map((clip) => (
              <li
                key={clip.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="font-semibold">{clip.title}</p>
                {clip.game && (
                  <p className="text-sm text-gray-400">{clip.game}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}