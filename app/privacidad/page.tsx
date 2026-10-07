export const metadata = {
  title: "Política de privacidad - lamuchachada",
};

export default function Privacidad() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-black px-6 py-12 text-gray-200">
      <h1 className="mb-6 text-3xl font-bold text-white">
        Política de privacidad
      </h1>

      <p className="mb-4">
        lamuchachada es un sitio privado donde un grupo de amigos comparte
        clips de videojuegos y momentos juntos.
      </p>

      <h2 className="mb-2 mt-6 text-xl font-semibold text-white">
        Qué datos recopilamos
      </h2>
      <p className="mb-4">
        Cuando inicias sesión con Google o Discord, recibimos tu nombre, tu
        correo electrónico y tu foto de perfil. No recibimos ni vemos tu
        contraseña.
      </p>

      <h2 className="mb-2 mt-6 text-xl font-semibold text-white">
        Para qué los usamos
      </h2>
      <p className="mb-4">
        Solo los usamos para identificarte dentro del sitio y asignarte un
        permiso (ver clips o subir clips). No vendemos ni compartimos tus datos
        con terceros.
      </p>

      <h2 className="mb-2 mt-6 text-xl font-semibold text-white">
        Dónde se guardan
      </h2>
      <p className="mb-4">
        Los datos se almacenan en Supabase, un servicio de base de datos. Los
        videos se guardan en un servicio de almacenamiento en la nube.
      </p>

      <h2 className="mb-2 mt-6 text-xl font-semibold text-white">
        Cómo eliminar tus datos
      </h2>
      <p className="mb-4">
        Si quieres que borremos tu cuenta y tus datos, escríbenos a
        danii.shiet@gmail.com y los eliminaremos.
      </p>
    </main>
  );
}