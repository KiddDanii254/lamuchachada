import Link from "next/link";
import { FaGamepad } from "react-icons/fa6";

export default function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <span className="fondo-degradado flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-[0_0_20px_#ff2e9366] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
        <FaGamepad size={22} />
      </span>
      <span className="font-display text-2xl leading-none">
        <span className="text-white">LA</span>{" "}
        <span className="texto-degradado">MUCHACHADA</span>
      </span>
    </Link>
  );
}