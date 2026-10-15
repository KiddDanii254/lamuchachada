"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  ruta: string;
  puedeDescargar: boolean;
};

export default function ClipVideo({ ruta, puedeDescargar }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  // 1) Detectar cuándo la tarjeta se acerca a la pantalla
  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  // 2) Solo entonces pedir el enlace temporal del video (dura 1 hora)
  useEffect(() => {
    if (!visible) return;
    let activo = true;
    supabase.storage
      .from("clips")
      .createSignedUrl(ruta, 3600)
      .then(({ data, error }) => {
        if (!activo) return;
        if (error || !data) setFallo(true);
        else setUrl(data.signedUrl);
      });
    return () => {
      activo = false;
    };
  }, [visible, ruta]);

  return (
    <div ref={contenedor} className="aspect-video w-full bg-black">
      {url ? (
        <video
          src={`${url}#t=0.1`}
          controls
          preload="metadata"
          playsInline
          controlsList={puedeDescargar ? undefined : "nodownload noremoteplayback"}
          disablePictureInPicture={!puedeDescargar}
          onContextMenu={
            puedeDescargar ? undefined : (e) => e.preventDefault()
          }
          className="h-full w-full"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          {fallo ? "Video no disponible" : "Cargando..."}
        </div>
      )}
    </div>
  );
}