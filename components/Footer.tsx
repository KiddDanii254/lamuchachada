import Logo from "@/components/Logo";
import Redes from "@/components/Redes";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo />
        <Redes />
      </div>
      <p className="mt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} La Muchachada ·{" "}
        <a href="/privacidad" className="underline">
          Política de privacidad
        </a>
      </p>
    </footer>
  );
}