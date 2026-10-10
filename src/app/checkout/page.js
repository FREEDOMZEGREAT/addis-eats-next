import CheckoutForm from "./CheckoutForm";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
  description: "Where should we bring your food?",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="eyebrow">Almost there</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-sand-500">
          We cook to order, so most orders reach you within 30–45 minutes.
        </p>
      </header>

      <CheckoutForm />
    </div>
  );
}
