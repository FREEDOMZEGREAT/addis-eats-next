"use client";

export default function AdminError({ reset }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-16 text-center sm:px-6">
      <p className="eyebrow">Dashboard unavailable</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
        We couldn&rsquo;t load the order data.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-sand-500">
        Your session is still active. Try loading the dashboard again.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">
        Retry
      </button>
    </section>
  );
}
