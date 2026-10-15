"use client";

import { useState } from "react";

type Props = {
  url: string | null;
  nombre: string;
  tamano?: number;
};

export default function Avatar({ url, nombre, tamano = 36 }: Props) {
  const [fallo, setFallo] = useState(false);
  const inicial = (nombre.trim()[0] ?? "?").toUpperCase();

  if (!url || fallo) {
    return (
      <div
        className="anillo flex shrink-0 items-center justify-center rounded-full bg-[#0f1a0f] font-bold text-[#6dff00]"
        style={{ width: tamano, height: tamano, fontSize: tamano * 0.42 }}
      >
        {inicial}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={tamano}
      height={tamano}
      referrerPolicy="no-referrer"
      onError={() => setFallo(true)}
      className="anillo shrink-0 rounded-full object-cover"
      style={{ width: tamano, height: tamano }}
    />
  );
}