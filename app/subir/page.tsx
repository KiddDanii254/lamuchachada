"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const MAX_MB = 50;

const EXTENSIONES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export default function Subir() {
  const router = useRouter();
  const [listo, setListo] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [juego, setJuego] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Solo admin y uploader pueden estar aquí
  useEffect(() => {
    async function comprobar() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const { data: perfil } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .single();
      if (perfil?.role !== "admin" && perfil?.role !== "uploader") {
        router.replace("/");
        return;
      }
      setListo(true);
    }
    comprobar();
  }, [router]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!archivo) return;

    const extension = EXTENSIONES[archivo.type];
    if (!extension) {
      setMensaje("Formato no permitido. Usa MP4, WebM o MOV.");
      return;
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
      const pesa = (archivo.size / 1024 / 1024).toFixed(1);
      setMensaje(`El video pesa ${pesa} MB y el límite es ${MAX_MB} MB.`);
      return;
    }

    setSubiendo(true);
    setMensaje("");

    try {
      const { data: sesion } = await supabase.auth.getSession();
      const userId = sesion.session?.user.id;
      if (!userId) throw new Error("Tu sesión expiró, entra de nuevo");

      // 1) Subir el video a Supabase Storage (carpeta con tu id de usuario)
      const ruta = `${userId}/${crypto.randomUUID()}.${extension}`;
      const { error: errorSubida } = await supabase.storage
        .from("clips")
        .upload(ruta, archivo, { contentType: archivo.type });
      if (errorSubida) throw new Error(errorSubida.message);

      // 2) Guardar el registro del clip en la base de datos
      const { error: errorRegistro } = await supabase.from("clips").insert({
        title: titulo,
        game: juego || null,
        description: descripcion || null,
        video_url: ruta,
        uploaded_by: userId,
      });
      if (errorRegistro) {
        // Si falla el registro, borramos el video para no dejarlo huérfano
        await supabase.storage.from("clips").remove([ruta]);
        throw new Error(errorRegistro.message);
      }

      router.replace("/");
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : "Error desconocido");
      setSubiendo(false);
    }
  }

  if (!listo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-gray-400">Cargando...</p>
      </main>
    );
  }

  const campo =
    "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/50";

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm text-gray-400 underline">
          ← Volver a la galería
        </Link>
        <h1 className="mb-6 mt-4 text-3xl font-bold">Subir clip</h1>

        <form onSubmit={enviar} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-gray-300">Título *</label>
            <input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={campo}
              placeholder="Ej: Clutch 1v4"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Juego</label>
            <input
              value={juego}
              onChange={(e) => setJuego(e.target.value)}
              className={campo}
              placeholder="Ej: Valorant"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={campo}
              rows={3}
            />
          </div>

                    <div>
            <p className="mb-1 text-sm text-gray-300">
              Video * (MP4, WebM o MOV, máximo {MAX_MB} MB)
            </p>
            <label
              htmlFor="video"
              className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-white/30 bg-white/5 px-4 py-8 text-center transition hover:bg-white/10"
            >
              {archivo ? (
                <span className="text-green-400">
                  ✅ {archivo.name} ({(archivo.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              ) : (
                <span className="text-gray-300">
                  📁 Haz clic aquí para elegir tu video
                </span>
              )}
            </label>
            <input
              id="video"
              required
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </div>

          {subiendo && (
            <div>
              <div className="h-3 w-full animate-pulse rounded-full bg-green-500" />
              <p className="mt-1 text-sm text-gray-400">
                Subiendo... no cierres esta pestaña.
              </p>
            </div>
          )}

          {mensaje && <p className="text-sm text-red-400">{mensaje}</p>}

          <button
            type="submit"
            disabled={subiendo || !archivo}
            className="rounded-lg bg-green-600 px-4 py-3 font-semibold transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {subiendo ? "Subiendo..." : "Subir clip"}
          </button>
        </form>
      </div>
    </main>
  );
}