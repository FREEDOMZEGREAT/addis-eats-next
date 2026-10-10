import CartList from "./CartList";

export const metadata = {
  title: "Cart",
  description: "What you have picked so far.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="eyebrow">Basket</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Your cart
        </h1>
      </header>

      <CartList />
    </div>
  );
}
