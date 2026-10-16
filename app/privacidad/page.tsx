import Link from "next/link";
import { CONTACTO_EMAIL } from "@/lib/config";

export const metadata = {
  title: "Política de privacidad - La Muchachada",
};

export default function Privacidad() {
  const titulo = "mb-2 mt-8 text-xl font-semibold text-white";
  const parrafo = "mb-4 leading-relaxed";

  const contacto = CONTACTO_EMAIL ? (
    <a href={`mailto:${CONTACTO_EMAIL}`} className="underline">
      {CONTACTO_EMAIL}
    </a>
  ) : (
    "el administrador del sitio"
  );

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12 text-gray-200">
      <Link href="/" className="text-sm text-gray-400 underline">
        ← Volver al inicio
      </Link>

      <h1 className="mb-2 mt-4 text-3xl font-bold text-white">
        Política de privacidad
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Última actualización: octubre de 2026
      </p>

      <p className={parrafo}>
        La Muchachada es un sitio privado donde un grupo de amigos comparte
        clips de videojuegos y buenos momentos. Solo pueden entrar personas con
        una cuenta.
      </p>

      <h2 className={titulo}>Qué datos guardamos</h2>
      <p className={parrafo}>
        Cuando inicias sesión con Google o Discord, recibimos tu nombre, tu
        correo electrónico y tu foto de perfil. No recibimos ni vemos tu
        contraseña. También guardamos el permiso que se te asignó en el sitio
        (invitado, uploader o admin) y, si subes clips, el video, su título, el
        juego, la descripción y quién lo subió.
      </p>

      <h2 className={titulo}>Para qué los usamos</h2>
      <p className={parrafo}>
        Solo para identificarte, darte los permisos que corresponden y mostrar
        quién subió cada clip. No vendemos tus datos ni los usamos para
        publicidad.
      </p>

      <h2 className={titulo}>Quién puede ver los clips y tus datos</h2>
      <p className={parrafo}>
        Los clips solo se pueden ver con una sesión iniciada. Quienes tienen
        rol de uploader o admin pueden además descargarlos. El administrador
        puede ver la lista de personas registradas, con su nombre y correo.
      </p>

      <h2 className={titulo}>Servicios que usamos</h2>
      <p className={parrafo}>
        Supabase guarda la base de datos y los archivos de video. Vercel aloja
        el sitio. Google y Discord se usan para iniciar sesión. En la página
        principal puede mostrarse un video incrustado de TikTok: al cargarlo,
        TikTok puede recibir datos técnicos, como tu dirección IP, según su
        propia política de privacidad. Usamos el almacenamiento de tu
        navegador solo para mantener tu sesión iniciada.
      </p>

      <h2 className={titulo}>Si apareces en un clip</h2>
      <p className={parrafo}>
        Quien sube un clip es responsable de que las personas que aparecen en
        él estén de acuerdo. Si apareces en uno y quieres que lo quitemos,
        escríbenos.
      </p>

      <h2 className={titulo}>Cómo borrar tus datos o un clip</h2>
      <p className={parrafo}>
        Si quieres que borremos tu cuenta, tus datos o un clip, escribe a{" "}
        {contacto} y lo eliminaremos. Quienes suben clips también pueden
        borrar los suyos.
      </p>

      <h2 className={titulo}>Cambios en esta política</h2>
      <p className={parrafo}>
        Si cambiamos algo importante, actualizaremos esta página y la fecha de
        arriba.
      </p>
    </main>
  );
}