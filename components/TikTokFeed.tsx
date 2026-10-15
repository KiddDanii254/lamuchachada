"use client";

import { useEffect, useRef, useState } from "react";
import { FaTiktok, FaRotateRight } from "react-icons/fa6";
import { TIKTOK_USUARIO } from "@/lib/config";

const SCRIPT_URL = "https://www.tiktok.com/embed.js";

export default function TikTokFeed() {
  // Solo letras, números, punto y guion bajo: así el usuario es seguro de insertar
  const usuario = TIKTOK_USUARIO.replace(/[^a-zA-Z0-9._]/g, "");

  const seccion = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [intento, setIntento] = useState(0);
  const [enEspera, setEnEspera] = useState(false);

  // 1) No pedir nada a TikTok hasta que la sección se acerque a la pantalla
  useEffect(() => {
    const el = seccion.current;
    if (!el || !usuario) return;
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
  }, [usuario]);

  // 2) Cargar el script de TikTok con una pequeña espera (evita peticiones dobles)
  useEffect(() => {
    if (!visible || !usuario) return;
    const temporizador = setTimeout(() => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      document.body.appendChild(script);
    }, 400);
    return () => clearTimeout(temporizador);
  }, [visible, usuario, intento]);

  function reintentar() {
    setIntento((n) => n + 1);
    setEnEspera(true);
    setTimeout(() => setEnEspera(false), 15000);
  }

  if (!usuario) return null;

  const html = `
    <blockquote class="tiktok-embed" cite="https://www.tiktok.com/@${usuario}"
      data-unique-id="${usuario}" data-embed-type="creator"
      style="max-width: 780px; min-width: 288px;">
      <section>
        <a target="_blank" rel="noopener noreferrer"
          href="https://www.tiktok.com/@${usuario}?refer=creator_embed">@${usuario}</a>
      </section>
    </blockquote>`;

  return (
    <section ref={seccion} className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-4xl">
          <span className="texto-degradado">TIKTOK</span>
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {visible && (
            <button
              onClick={reintentar}
              disabled={enEspera}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaRotateRight />
              {enEspera ? "Espera un momento..." : "Reintentar"}
            </button>
          )}
          <a
            href={`https://www.tiktok.com/@${usuario}`}
            target="_blank"
            rel="noopener noreferrer"
            className="boton-marca inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
          >
            <FaTiktok /> Ver en TikTok
          </a>
        </div>
      </div>

      <div className="tarjeta flex min-h-[200px] justify-center rounded-2xl p-4">
        {visible ? (
          <div
            key={intento}
            className="flex w-full justify-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="self-center text-sm text-gray-500">
            El TikTok se carga al llegar aquí...
          </p>
        )}
      </div>
    </section>
  );
}