export default function Fondo() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="rejilla absolute inset-0" />
      <div className="animate-blob absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#6dff00]/20 blur-3xl" />
      <div className="animate-blob-lento absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[#1fa300]/25 blur-3xl" />
      <div className="animate-blob absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#b8ff6b]/10 blur-3xl" />
    </div>
  );
}