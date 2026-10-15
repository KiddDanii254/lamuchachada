export default function Fondo() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="rejilla absolute inset-0" />
      <div
        className="animate-blob absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(109,255,0,0.22), transparent 65%)",
        }}
      />
      <div
        className="animate-blob-lento absolute -right-40 top-1/3 h-[36rem] w-[36rem] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(31,163,0,0.28), transparent 65%)",
        }}
      />
    </div>
  );
}