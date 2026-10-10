export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <div className="h-3 w-20 skeleton" />
        <div className="mt-3 h-9 w-56 skeleton" />
        <div className="mt-3 h-3 w-72 skeleton" />
      </div>

      <div className="mb-8 space-y-4">
        <div className="h-11 w-full max-w-sm skeleton" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9.5 w-24 rounded-full skeleton" />
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="card overflow-hidden">
            <div className="aspect-4/3 skeleton rounded-none!" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="h-5 w-28 skeleton" />
                <div className="h-5 w-16 skeleton" />
              </div>
              <div className="mt-3 h-3 w-full skeleton" />
              <div className="mt-2 h-3 w-2/3 skeleton" />
              <div className="mt-5 h-9 w-full skeleton" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
