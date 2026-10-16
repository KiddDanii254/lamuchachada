"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CLAVE = "tiktok_video_url";
const PATRON = /^https:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/;

type Aviso = { tipo: "ok" | "error"; texto: string };

export default function TikTokAdmin() {
  const [actual, setActual] = useState<string | null>(null);
  const [enlace, setEnlace] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", CLAVE)
      .maybeSingle()
      .then(({ data }) => {
        setActual(data?.value ?? null);
        setEnlace(data?.value ?? "");
        setCargando(false);
      });
  }, []);

  async function guardar() {
    const limpio = enlace.trim().split("?")[0];
    if (!PATRON.test(limpio)) {
      setAviso({
        tipo: "error",
        texto:
          "El enlace no sirve. Debe verse así: https://www.tiktok.com/@usuario/video/1234567890",
      });
      return;
    }
    setGuardando(true);
    setAviso(null);

    const { error } = await supabase.from("site_settings").upsert({
      key: CLAVE,
      value: limpio,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setAviso({ tipo: "error", texto: error.message });
    } else {
      setActual(limpio);
      setEnlace(limpio);
      setAviso({
        tipo: "ok",
        texto: "Listo. El video destacado ya cambió en la página principal.",
      });
    }
    setGuardando(false);
  }

  async function quitar() {
    if (!confirm("¿Quitar el video destacado de la página principal?")) return;
    setGuardando(true);
    setAviso(null);
    const { error } = await supabase.from("site_settings").delete().eq("key", CLAVE);
    if (error) {
      setAviso({ tipo: "error", texto: error.message });
    } else {
      setActual(null);
      setEnlace("");
      setAviso({ tipo: "ok", texto: "Video destacado quitado." });
    }
    setGuardando(false);
  }

  if (cargando) {
    return <div className="cargador mt-8" />;
  }

  return (
    <div className="tarjeta mt-6 rounded-xl p-5">
      <h2 className="text-lg font-semibold">Video destacado de TikTok</h2>
      <p className="mt-1 text-sm text-gray-400">
        Abre el video en tiktok.com desde el navegador, copia el enlace de la
        barra de direcciones (debe tener <code>/video/</code> y números) y
        pégalo aquí. Los enlaces cortos (vm.tiktok.com) no funcionan.
      </p>

      <input
        value={enlace}
        onChange={(e) => setEnlace(e.target.value)}
        placeholder="https://www.tiktok.com/@usuario/video/1234567890"
        className="mt-4 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#6dff00]"
      />

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={guardar}
          disabled={guardando || !enlace.trim()}
          className="boton-marca rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
        {actual && (
          <button
            onClick={quitar}
            disabled={guardando}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            Quitar video
          </button>
        )}
      </div>

      {aviso && (
        <p
          className={`mt-3 text-sm ${
            aviso.tipo === "ok" ? "text-[#b8ff6b]" : "text-red-300"
          }`}
        >
          {aviso.texto}
        </p>
      )}
    </div>
  );
}