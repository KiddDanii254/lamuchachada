"use client";

import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { supabase } from "@/lib/supabase";
import { LIMITE_ALMACENAMIENTO_MB } from "@/lib/config";

type Uso = { bytes: number; archivos: number };
type Aviso = { tipo: "ok" | "error"; texto: string };

function formatear(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export default function SistemaAdmin() {
  const [uso, setUso] = useState<Uso | null>(null);
  const [errorUso, setErrorUso] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  useEffect(() => {
    supabase.rpc("get_storage_usage").then(({ data, error }) => {
      if (error) {
        setErrorUso(error.message);
        return;
      }
      const fila = Array.isArray(data) ? data[0] : data;
      setUso({
        bytes: Number(fila?.total_bytes ?? 0),
        archivos: Number(fila?.total_archivos ?? 0),
      });
    });
  }, []);

  async function exportar() {
    setExportando(true);
    setAviso(null);

    const [clips, perfiles, ajustes] = await Promise.all([
      supabase.from("clips").select("*").order("created_at"),
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("site_settings").select("*"),
    ]);

    const fallo = clips.error ?? perfiles.error ?? ajustes.error;
    if (fallo) {
      setAviso({ tipo: "error", texto: fallo.message });
      setExportando(false);
      return;
    }

    const copia = {
      exportado_el: new Date().toISOString(),
      clips: clips.data ?? [],
      usuarios: perfiles.data ?? [],
      ajustes: ajustes.data ?? [],
    };

    const blob = new Blob([JSON.stringify(copia, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `lamuchachada-copia-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    enlace.click();
    URL.revokeObjectURL(url);

    setAviso({
      tipo: "ok",
      texto: "Copia descargada. Guárdala en un lugar privado.",
    });
    setExportando(false);
  }

  const limiteBytes = LIMITE_ALMACENAMIENTO_MB * 1024 * 1024;
  const porcentaje = uso
    ? Math.min(100, (uso.bytes / limiteBytes) * 100)
    : 0;
  const color =
    porcentaje >= 90 ? "#ef4444" : porcentaje >= 70 ? "#fbbf24" : "#6dff00";

  // Cuántos clips más caben, según el tamaño promedio actual
  let restantes: number | null = null;
  if (uso && uso.archivos > 0) {
    const promedio = uso.bytes / uso.archivos;
    restantes = Math.max(0, Math.floor((limiteBytes - uso.bytes) / promedio));
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {/* Espacio de los videos */}
      <div className="tarjeta rounded-xl p-5">
        <h2 className="text-lg font-semibold">Espacio de los videos</h2>

        {errorUso ? (
          <p className="mt-3 text-sm text-red-300">
            No se pudo medir el espacio: {errorUso}
          </p>
        ) : !uso ? (
          <div className="cargador mt-4" />
        ) : (
          <>
            <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${porcentaje}%`, background: color }}
              />
            </div>
            <p className="mt-3 text-sm">
              <span className="font-semibold">{formatear(uso.bytes)}</span> de{" "}
              {formatear(limiteBytes)} usados ({porcentaje.toFixed(1)}%) ·{" "}
              {uso.archivos} {uso.archivos === 1 ? "video" : "videos"}
            </p>
            {restantes !== null && (
              <p className="mt-1 text-sm text-gray-400">
                Con el tamaño promedio actual caben unos {restantes} clips más.
              </p>
            )}
            {porcentaje >= 90 && (
              <p className="mt-3 text-sm text-red-300">
                Casi lleno. Borra clips que ya no necesites o cambia de plan
                antes de que las subidas empiecen a fallar.
              </p>
            )}
            {porcentaje >= 70 && porcentaje < 90 && (
              <p className="mt-3 text-sm text-yellow-300">
                Ya pasaste el 70% del espacio. Conviene ir pensando qué hacer.
              </p>
            )}
          </>
        )}
      </div>

      {/* Copia de seguridad */}
      <div className="tarjeta rounded-xl p-5">
        <h2 className="text-lg font-semibold">Copia de seguridad</h2>
        <p className="mt-1 text-sm text-gray-400">
          Descarga un archivo con la lista de clips, usuarios (con sus correos)
          y ajustes. <strong>No incluye los videos</strong>: esos conserva los
          originales en tu PC o en tu nube. Se recomienda hacerla una vez al
          mes.
        </p>

        <button
          onClick={exportar}
          disabled={exportando}
          className="boton-marca mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaDownload />
          {exportando ? "Preparando..." : "Descargar copia (.json)"}
        </button>

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
    </div>
  );
}