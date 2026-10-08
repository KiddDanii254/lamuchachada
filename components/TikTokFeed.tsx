"use client";

import { useEffect } from "react";
import { FaTiktok } from "react-icons/fa6";
import { TIKTOK_USUARIO } from "@/lib/config";

export default function TikTokFeed() {
  // Solo letras, números, punto y guion bajo: así el usuario es seguro de insertar
  const usuario = TIKTOK_USUARIO.replace(/[^a-zA-Z0-9._]/g, "");

  useEffect(() => {
    if (!usuario) return;
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [usuario]);

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
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-4xl">
          <span className="texto-degradado">TIKTOK</span>
        </h2>
        <a
          href={`https://www.tiktok.com/@${usuario}`}
          target="_blank"
          rel="noopener noreferrer"
          className="boton-marca inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
        >
          <FaTiktok /> Ver en TikTok
        </a>
      </div>

      <div
        className="tarjeta flex justify-center rounded-2xl p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}