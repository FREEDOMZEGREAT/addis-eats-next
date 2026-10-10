export default function Loading() {
  return (
    <section
      aria-label="Loading admin dashboard"
      aria-busy="true"
      className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14"
    >
      <div className="mb-8">
        <div className="h-3 w-28 skeleton" />
        <div className="mt-3 h-9 w-64 skeleton" />
        <div className="mt-3 h-4 w-72 max-w-full skeleton" />
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="card h-28 p-5">
            <div className="h-3 w-24 skeleton" />
            <div className="mt-3 h-7 w-32 skeleton" />
            <div className="mt-2 h-3 w-36 skeleton" />
          </div>
        ))}
      </div>
      <div className="mb-10 grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="card h-80 p-5">
            <div className="h-5 w-48 skeleton" />
            <div className="mt-6 h-56 skeleton" />
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex h-14 items-center gap-4 border-b border-sand-200 px-4"
          >
            <div className="h-4 w-24 skeleton" />
            <div className="h-4 w-32 skeleton" />
            <div className="h-4 w-20 skeleton" />
          </div>
        ))}
      </div>
    </section>
  );
}
