"use client";

import { useEffect, useRef, useState } from "react";
import { FaTiktok } from "react-icons/fa6";
import { supabase } from "@/lib/supabase";
import { TIKTOK_USUARIO } from "@/lib/config";

// Saca el número del video desde el enlace completo de TikTok
function extraerId(url: string | null) {
  const m = url?.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
  return m ? m[1] : null;
}

export default function TikTokFeed() {
  // Solo letras, números, punto y guion bajo
  const usuario = TIKTOK_USUARIO.replace(/[^a-zA-Z0-9._]/g, "");

  const seccion = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  // 1) Leer el enlace que dejó guardado el admin
  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "tiktok_video_url")
      .maybeSingle()
      .then(({ data }) => setVideoId(extraerId(data?.value ?? null)));
  }, []);

  // 2) No cargar el video hasta que la sección se acerque a la pantalla
  useEffect(() => {
    const el = seccion.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  if (!usuario && !videoId) return null;

  return (
    <section ref={seccion} className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-4xl">
          <span className="texto-degradado">TIKTOK</span>
        </h2>

        {usuario && (
          <a
            href={`https://www.tiktok.com/@${usuario}`}
            target="_blank"
            rel="noopener noreferrer"
            className="boton-marca inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
          >
            <FaTiktok /> Ver en TikTok
          </a>
        )}
      </div>

      <div className="tarjeta flex min-h-[200px] justify-center rounded-2xl p-4">
        {videoId && visible ? (
          <iframe
            src={`https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=1&music_info=1&description=1`}
            title="Video de TikTok"
            allow="fullscreen; autoplay; encrypted-media"
            loading="lazy"
            className="h-[640px] w-full max-w-[360px] rounded-xl border-0"
          />
        ) : (
          <p className="self-center text-center text-sm text-gray-500">
            {videoId
              ? "El video se carga al llegar aquí..."
              : "Pronto habrá un clip destacado de TikTok aquí."}
          </p>
        )}
      </div>
    </section>
  );
}