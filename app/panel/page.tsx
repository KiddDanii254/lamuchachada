"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FaArrowLeft, FaTrashCan, FaFilm, FaUsers } from "react-icons/fa6";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import Avatar from "@/components/Avatar";

type Rol = "admin" | "uploader" | "guest";

type Clip = {
  id: string;
  title: string;
  game: string | null;
  video_url: string;
  uploaded_by: string;
  created_at: string;
};

type Usuario = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: Rol;
  created_at: string;
};

type Aviso = { tipo: "ok" | "error"; texto: string };

const nombreRol: Record<Rol, string> = {
  admin: "Admin",
  uploader: "Uploader",
  guest: "Invitado",
};

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Panel() {
  const router = useRouter();
  const [miId, setMiId] = useState<string | null>(null);
  const [rol, setRol] = useState<Rol | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pestana, setPestana] = useState<"clips" | "usuarios">("clips");
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  useEffect(() => {
    async function iniciar() {
      const { data } = await supabase.auth.getSession();
      const sesion = data.session;
      if (!sesion) {
        router.replace("/login");
        return;
      }

      const { data: perfil } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sesion.user.id)
        .single();
      const miRol = (perfil?.role ?? "guest") as Rol;
      if (miRol !== "admin" && miRol !== "uploader") {
        router.replace("/");
        return;
      }

      setMiId(sesion.user.id);
      setRol(miRol);

      // El uploader solo ve sus clips; el admin ve todos
      let consulta = supabase
        .from("clips")
        .select("id, title, game, video_url, uploaded_by, created_at");
      if (miRol === "uploader") {
        consulta = consulta.eq("uploaded_by", sesion.user.id);
      }
      const { data: c } = await consulta.order("created_at", {
        ascending: false,
      });
      setClips((c as Clip[]) ?? []);

      // Solo el admin carga la lista de usuarios
      if (miRol === "admin") {
        const { data: u } = await supabase
          .from("profiles")
          .select("id, email, display_name, avatar_url, role, created_at")
          .order("created_at", { ascending: true });
        setUsuarios((u as Usuario[]) ?? []);
      }

      setCargando(false);
    }
    iniciar();
  }, [router]);

  async function borrarClip(clip: Clip) {
    if (
      !confirm(`¿Borrar "${clip.title}"? Esta acción no se puede deshacer.`)
    ) {
      return;
    }
    setOcupado(clip.id);
    setAviso(null);

    // 1) Borrar el registro (las reglas de la base de datos verifican el permiso)
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
      setOcupado(null);
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
    setOcupado(null);
  }

  async function cambiarRol(usuario: Usuario, nuevo: Rol) {
    if (usuario.id === miId || usuario.role === nuevo) return;

    const nombre = usuario.display_name ?? usuario.email ?? "esta persona";
    if (
      nuevo === "admin" &&
      !confirm(`¿Dar permisos de ADMIN a ${nombre}? Podrá borrar todo y cambiar roles.`)
    ) {
      return;
    }

    setOcupado(usuario.id);
    setAviso(null);

    const { data, error } = await supabase
      .from("profiles")
      .update({ role: nuevo })
      .eq("id", usuario.id)
      .select("id");

    if (error || !data || data.length === 0) {
      setAviso({
        tipo: "error",
        texto: error?.message ?? "No se pudo cambiar el rol.",
      });
    } else {
      setUsuarios((actual) =>
        actual.map((u) => (u.id === usuario.id ? { ...u, role: nuevo } : u))
      );
      setAviso({
        tipo: "ok",
        texto: `${nombre} ahora es ${nombreRol[nuevo]}. Verá el cambio al recargar la página.`,
      });
    }
    setOcupado(null);
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="cargador" />
      </main>
    );
  }

  const esAdmin = rol === "admin";
  const nombrePorId: Record<string, string> = {};
  for (const u of usuarios) {
    nombrePorId[u.id] = u.display_name ?? u.email ?? "Sin nombre";
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#040604]/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Logo />
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm transition hover:bg-white/10"
          >
            <FaArrowLeft /> Volver a la galería
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-5xl">
            <span className="texto-degradado">
              {esAdmin ? "PANEL ADMIN" : "MI PANEL"}
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {esAdmin
              ? "Administra los clips y los permisos de todas las personas."
              : "Aquí puedes ver y borrar los clips que subiste."}
          </p>
        </motion.div>

        {/* Pestañas */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setPestana("clips")}
            className={`chip inline-flex items-center gap-2 ${
              pestana === "clips" ? "chip-activo" : ""
            }`}
          >
            <FaFilm />
            {esAdmin ? "Todos los clips" : "Mis clips"} ({clips.length})
          </button>
          {esAdmin && (
            <button
              onClick={() => setPestana("usuarios")}
              className={`chip inline-flex items-center gap-2 ${
                pestana === "usuarios" ? "chip-activo" : ""
              }`}
            >
              <FaUsers />
              Usuarios ({usuarios.length})
            </button>
          )}
        </div>

        {/* Aviso de resultado */}
        {aviso && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              aviso.tipo === "ok"
                ? "border-[#6dff00]/40 bg-[#6dff00]/10 text-[#b8ff6b]"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {aviso.texto}
          </div>
        )}

        {/* Lista de clips */}
        {pestana === "clips" && (
          <div className="mt-6 flex flex-col gap-3">
            {clips.length === 0 ? (
              <p className="py-12 text-center text-gray-400">
                {esAdmin ? "No hay clips todavía." : "Todavía no has subido clips."}
              </p>
            ) : (
              clips.map((clip) => (
                <div
                  key={clip.id}
                  className="tarjeta flex flex-wrap items-center justify-between gap-4 rounded-xl p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{clip.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      {clip.game && <span className="insignia">{clip.game}</span>}
                      <span>{fecha(clip.created_at)}</span>
                      {esAdmin && (
                        <span>
                          · Subido por{" "}
                          {nombrePorId[clip.uploaded_by] ?? "alguien"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => borrarClip(clip)}
                    disabled={ocupado === clip.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaTrashCan />
                    {ocupado === clip.id ? "Borrando..." : "Borrar"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Lista de usuarios (solo admin) */}
        {esAdmin && pestana === "usuarios" && (
          <div className="mt-6 flex flex-col gap-3">
            {usuarios.map((u) => {
              const nombre = u.display_name ?? u.email ?? "Sin nombre";
              const soyYo = u.id === miId;
              return (
                <div
                  key={u.id}
                  className="tarjeta flex flex-wrap items-center justify-between gap-4 rounded-xl p-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar url={u.avatar_url} nombre={nombre} tamano={40} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {nombre}
                        {soyYo && (
                          <span className="ml-2 text-xs text-[#6dff00]">
                            (tú)
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {u.email ?? "Sin correo"} · Desde {fecha(u.created_at)}
                      </p>
                    </div>
                  </div>

                  <select
                    value={u.role}
                    disabled={soyYo || ocupado === u.id}
                    onChange={(e) => cambiarRol(u, e.target.value as Rol)}
                    title={soyYo ? "No puedes cambiar tu propio rol" : ""}
                    className="rounded-lg border border-white/20 bg-[#0a120a] px-3 py-2 text-sm text-white outline-none focus:border-[#6dff00] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="guest">{nombreRol.guest}</option>
                    <option value="uploader">{nombreRol.uploader}</option>
                    <option value="admin">{nombreRol.admin}</option>
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}