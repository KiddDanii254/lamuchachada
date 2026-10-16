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
  FaGear,
  FaDownload,
  FaTrashCan,
} from "react-icons/fa6";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import Redes from "@/components/Redes";
import Footer from "@/components/Footer";
import TikTokFeed from "@/components/TikTokFeed";
import Avatar from "@/components/Avatar";
import ClipVideo from "@/components/ClipVideo";

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
  uploaded_by: string;
  created_at: string;
};

type Uploader = {
  user_id: string;
  nombre: string | null;
  avatar: string | null;
};

type Aviso = { tipo: "ok" | "error"; texto: string };

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
  const [uploaders, setUploaders] = useState<Uploader[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [juegoActivo, setJuegoActivo] = useState<string | null>(null);
  const [filtroUsuario, setFiltroUsuario] = useState("todos");
  const [borrando, setBorrando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);

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

  // 2) Con sesión, cargar perfil, clips y la lista de quienes suben clips
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
        .select(
          "id, title, game, description, video_url, uploaded_by, created_at"
        )
        .order("created_at", { ascending: false });
      setClips((c as Clip[]) ?? []);

      const { data: up } = await supabase.rpc("get_uploaders");
      setUploaders((up as Uploader[]) ?? []);

      setCargando(false);
    }

    cargar();
  }, [user]);

  // 3) El aviso de resultado desaparece solo a los 5 segundos
  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(null), 5000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

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

  // Solo admin y uploader pueden descargar
  async function descargar(clip: Clip) {
    const extension = clip.video_url.split(".").pop() ?? "mp4";
    const nombreArchivo = clip.title.replace(/[\\/:*?"<>|]/g, "");
    const { data, error } = await supabase.storage
      .from("clips")
      .createSignedUrl(clip.video_url, 60, {
        download: `${nombreArchivo}.${extension}`,
      });
    if (error || !data) {
      setAviso({ tipo: "error", texto: "No se pudo preparar la descarga." });
      return;
    }
    window.location.href = data.signedUrl;
  }

  // Borrar un clip (las reglas de la base de datos verifican el permiso)
  async function borrarClip(clip: Clip) {
    if (
      !confirm(`¿Borrar "${clip.title}"? Esta acción no se puede deshacer.`)
    ) {
      return;
    }
    setBorrando(clip.id);

    // 1) Borrar el registro
    const { data: borrados, error } = await supabase
      .from("clips")
      .delete()
      .eq("id", clip.id)
      .select("id");

    if (error || !borrados || borrados.length === 0) {
      setAviso({
        tipo: "error",
        texto: error?.message ?? "No tienes permiso para borrar este clip.",
      });
      setBorrando(null);
      return;
    }

    // 2) Borrar el archivo de video
    const { data: archivos, error: errorArchivo } = await supabase.storage
      .from("clips")
      .remove([clip.video_url]);

    setClips((actual) => actual.filter((c) => c.id !== clip.id));

    if (errorArchivo || !archivos || archivos.length === 0) {
      setAviso({
        tipo: "error",
        texto:
          "El clip se quitó de la galería, pero el archivo de video no se pudo eliminar. Revísalo en Supabase → Storage.",
      });
    } else {
      setAviso({ tipo: "ok", texto: `"${clip.title}" fue eliminado.` });
    }
    setBorrando(null);
  }

  function limpiarFiltros() {
    setBusqueda("");
    setJuegoActivo(null);
    setFiltroUsuario("todos");
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="cargador" />
      </main>
    );
  }

  const rol: Rol = perfil?.role ?? "guest";
  const esAdmin = rol === "admin";
  const puedeSubir = rol === "admin" || rol === "uploader";
  const nombre = perfil?.display_name ?? user?.email ?? "Sin nombre";

  const nombrePorId: Record<string, string> = {};
  for (const u of uploaders) {
    nombrePorId[u.user_id] = u.nombre ?? "Sin nombre";
  }
  const uploadersOrdenados = [...uploaders].sort((a, b) =>
    (a.nombre ?? "").localeCompare(b.nombre ?? "")
  );

  const visibles = clips.filter((c) => {
    const texto = `${c.title} ${c.game ?? ""} ${c.description ?? ""}`.toLowerCase();
    const coincide = texto.includes(busqueda.toLowerCase());
    const juegoOk = !juegoActivo || c.game === juegoActivo;
    const usuarioOk =
      filtroUsuario === "todos" ||
      (filtroUsuario === "yo"
        ? c.uploaded_by === user?.id
        : c.uploaded_by === filtroUsuario);
    return coincide && juegoOk && usuarioOk;
  });

  const hayFiltros =
    busqueda !== "" || juegoActivo !== null || filtroUsuario !== "todos";

  return (
    <main className="min-h-screen">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#040604]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Logo />

          <div className="flex items-center gap-3">
            {esAdmin && (
              <Link
                href="/panel"
                title="Panel de admin"
                className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm transition hover:bg-white/10"
              >
                <FaGear />
                <span className="hidden sm:inline">Panel</span>
              </Link>
            )}

            <Avatar url={perfil?.avatar_url ?? null} nombre={nombre} />
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
            sizes="(max-width: 640px) 100vw, 576px"
            loading="eager"
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

        {/* Filtro por persona y por juego */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            className="rounded-xl border border-white/20 bg-[#0a120a] px-4 py-2 text-sm text-white outline-none focus:border-[#6dff00]"
          >
            <option value="todos">Subido por: todas las personas</option>
            {puedeSubir && <option value="yo">Mis clips</option>}
            {uploadersOrdenados.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.nombre ?? "Sin nombre"}
                {u.user_id === user?.id ? " (tú)" : ""}
              </option>
            ))}
          </select>

          {juegos.length > 0 && (
            <>
              <button
                onClick={() => setJuegoActivo(null)}
                className={`chip ${juegoActivo === null ? "chip-activo" : ""}`}
              >
                Todos los juegos
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
            </>
          )}

          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-gray-400 underline transition hover:text-white"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {clips.length > 0 && (
          <p className="mt-4 text-xs text-gray-500">
            Mostrando {visibles.length} de {clips.length}{" "}
            {clips.length === 1 ? "clip" : "clips"}
          </p>
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
            No encontramos clips con esos filtros.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((clip, i) => {
              const esMio = clip.uploaded_by === user?.id;
              const puedeBorrar = esAdmin || (rol === "uploader" && esMio);

              return (
                <motion.li
                  key={clip.id}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(i * 0.07, 0.5),
                  }}
                  className="tarjeta overflow-hidden rounded-2xl"
                >
                  <ClipVideo
                    ruta={clip.video_url}
                    puedeDescargar={puedeSubir}
                  />
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
                    <p className="mt-2 text-xs text-gray-500">
                      Subido por{" "}
                      {esMio ? "ti" : nombrePorId[clip.uploaded_by] ?? "alguien"}
                    </p>

                    {(puedeSubir || puedeBorrar) && (
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                        {puedeSubir ? (
                          <button
                            onClick={() => descargar(clip)}
                            className="inline-flex items-center gap-2 text-xs text-gray-400 transition hover:text-[#6dff00]"
                          >
                            <FaDownload /> Descargar
                          </button>
                        ) : (
                          <span />
                        )}

                        {puedeBorrar && (
                          <button
                            onClick={() => borrarClip(clip)}
                            disabled={borrando === clip.id}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FaTrashCan />
                            {borrando === clip.id ? "Borrando..." : "Borrar"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </section>

      <TikTokFeed />
      <Footer />

      {/* Aviso de resultado */}
      {aviso && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`pointer-events-auto w-full max-w-md rounded-xl border px-4 py-3 text-sm shadow-lg ${
              aviso.tipo === "ok"
                ? "border-[#6dff00]/40 bg-[#0b1a0b] text-[#b8ff6b]"
                : "border-red-500/40 bg-[#1a0b0b] text-red-300"
            }`}
          >
            {aviso.texto}
          </motion.div>
        </div>
      )}
    </main>
  );
}