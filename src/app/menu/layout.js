export default function MenuLayout({ children }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:py-10">
      <section className="min-w-0">{children}</section>
    </div>
  );
}
