import {
  FaTiktok,
  FaInstagram,
  FaDiscord,
  FaYoutube,
  FaTwitch,
  FaXTwitter,
} from "react-icons/fa6";
import { REDES } from "@/lib/config";

const LISTA = [
  { clave: "tiktok", nombre: "TikTok", Icono: FaTiktok },
  { clave: "instagram", nombre: "Instagram", Icono: FaInstagram },
  { clave: "discord", nombre: "Discord", Icono: FaDiscord },
  { clave: "youtube", nombre: "YouTube", Icono: FaYoutube },
  { clave: "twitch", nombre: "Twitch", Icono: FaTwitch },
  { clave: "x", nombre: "X", Icono: FaXTwitter },
] as const;

export default function Redes() {
  const activas = LISTA.filter((r) => REDES[r.clave]);
  if (activas.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center justify-center gap-3">
      {activas.map(({ clave, nombre, Icono }) => (
        <li key={clave}>
          <a
            href={REDES[clave]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={nombre}
            title={nombre}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg text-white transition hover:-translate-y-1 hover:border-transparent hover:bg-[#ff2e93] hover:shadow-[0_8px_24px_-6px_#ff2e93]"
          >
            <Icono />
          </a>
        </li>
      ))}
    </ul>
  );
}