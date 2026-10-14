import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="La Muchachada DX"
        width={48}
        height={48}
        className="h-12 w-12 object-contain transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
        style={{ filter: "drop-shadow(0 0 8px rgba(109,255,0,0.6))" }}
      />
      <span className="font-display hidden text-2xl leading-none sm:block">
        <span className="text-white">LA MUCHACHADA</span>{" "}
        <span className="texto-degradado">DX</span>
      </span>
    </Link>
  );
}