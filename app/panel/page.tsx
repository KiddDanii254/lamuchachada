"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FaArrowLeft, FaUsers, FaTiktok, FaDatabase } from "react-icons/fa6";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import Avatar from "@/components/Avatar";
import TikTokAdmin from "@/components/TikTokAdmin";
import SistemaAdmin from "@/components/SistemaAdmin";

type Rol = "admin" | "uploader" | "guest";

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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pestana, setPestana] = useState<"usuarios" | "tiktok" | "sistema">(
    "usuarios"
  );
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

      // Solo el admin puede estar aquí
      const { data: perfil } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sesion.user.id)
        .single();
      if (perfil?.role !== "admin") {
        router.replace("/");
        return;
      }

      setMiId(sesion.user.id);

      const { data: u } = await supabase
        .from("profiles")
        .select("id, email, display_name, avatar_url, role, created_at")
        .order("created_at", { ascending: true });
      setUsuarios((u as Usuario[]) ?? []);

      setCargando(false);
    }
    iniciar();
  }, [router]);

  async function cambiarRol(usuario: Usuario, nuevo: Rol) {
    if (usuario.id === miId || usuario.role === nuevo) return;

    const nombre = usuario.display_name ?? usuario.email ?? "esta persona";
    if (
      nuevo === "admin" &&
      !confirm(
        `¿Dar permisos de ADMIN a ${nombre}? Podrá borrar todo y cambiar roles.`
      )
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
            <span className="texto-degradado">PANEL ADMIN</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Permisos de las personas, video de TikTok y estado del sistema. Los
            clips se borran desde la galería.
          </p>
        </motion.div>

        {/* Pestañas */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setPestana("usuarios")}
            className={`chip inline-flex items-center gap-2 ${
              pestana === "usuarios" ? "chip-activo" : ""
            }`}
          >
            <FaUsers />
            Usuarios ({usuarios.length})
          </button>
          <button
            onClick={() => setPestana("tiktok")}
            className={`chip inline-flex items-center gap-2 ${
              pestana === "tiktok" ? "chip-activo" : ""
            }`}
          >
            <FaTiktok />
            TikTok
          </button>
          <button
            onClick={() => setPestana("sistema")}
            className={`chip inline-flex items-center gap-2 ${
              pestana === "sistema" ? "chip-activo" : ""
            }`}
          >
            <FaDatabase />
            Sistema
          </button>
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

        {/* Lista de usuarios */}
        {pestana === "usuarios" && (
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

        {pestana === "tiktok" && <TikTokAdmin />}
        {pestana === "sistema" && <SistemaAdmin />}
      </section>
    </main>
  );
}