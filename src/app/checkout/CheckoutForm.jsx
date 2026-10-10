"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { placeOrder } from "@/app/actions";
import { useCart } from "@/app/providers";
import { DELIVERY_AREAS, AREA_FEE } from "@/lib/schema";

const initialState = {
  fieldErrors: {},
  formError: null,
  id: null,
};

export default function CheckoutForm() {
  const [state, formAction, pending] = useActionState(placeOrder, initialState);
  const { items, total, orderItems, clearCart } = useCart();
  const formRef = useRef(null);
  const hasClearedCartRef = useRef(false);

  useEffect(() => {
    if (state.id && !hasClearedCartRef.current) {
      hasClearedCartRef.current = true;
      clearCart();
    }
  }, [state.id, clearCart]);

  useEffect(() => {
    if (state.formError && formRef.current) {
      formRef.current.querySelector("[role=alert]")?.focus();
    }
  }, [state.formError]);

  const errors = state.fieldErrors ?? {};
  const fee = AREA_FEE.Bole;

  if (state.id) {
    return (
      <div className="card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-success-100 text-success-700">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m4.5 12.5 5 5 10-11" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-sand-900">
              Order placed
            </h2>
            <p className="mt-1 text-sm text-sand-500">
              Reference{" "}
              <span className="font-mono font-semibold text-sand-800">
                {state.id}
              </span>
              . We&rsquo;ve started cooking — expect it in 30–45 minutes.
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-2 rounded-xl bg-sand-50 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-sand-500">Subtotal</dt>
            <dd className="price text-sand-800">
              {state.subtotal} {state.currency}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sand-500">Delivery</dt>
            <dd className="price text-sand-800">
              {state.deliveryFee} {state.currency}
            </dd>
          </div>
          <div className="divider my-2" />
          <div className="flex justify-between text-base">
            <dt className="font-semibold text-sand-900">Total</dt>
            <dd className="price text-brand-700">
              {state.total} {state.currency}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/orders" className="btn btn-primary">
            View my orders
          </Link>
          <Link href="/menu" className="btn btn-outline">
            Order more
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-8">
      <input type="hidden" name="items" value={JSON.stringify(orderItems)} />

      {state.formError && (
        <div
          role="alert"
          tabIndex={-1}
          className="flex items-start gap-3 rounded-xl border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="mt-0.5 h-4 w-4 shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5v.5" />
          </svg>
          <div>
            <p className="font-semibold">We couldn&rsquo;t place that</p>
            <p className="mt-0.5 text-danger-600">{state.formError}</p>
          </div>
        </div>
      )}

      <section className="card p-5 sm:p-6">
        <fieldset className="space-y-5" disabled={pending}>
          <legend className="font-display text-lg font-semibold tracking-tight">
            Delivery details
          </legend>
          <p className="-mt-3 text-sm text-sand-500">We are here for you.</p>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="name" label="Full name" error={errors.name?.[0]}>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Netsanet Degu"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy("name", errors.name, "name-hint")}
                className="field"
              />
            </Field>

            <Field id="phone" label="Phone number" error={errors.phone?.[0]}>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0918072093"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy(
                  "phone",
                  errors.phone,
                  "phone-hint",
                )}
                className="field"
              />
            </Field>

            <Field id="area" label="Delivery area" error={errors.area?.[0]}>
              <select
                id="area"
                name="area"
                defaultValue="Bole"
                aria-invalid={Boolean(errors.area)}
                aria-describedby={errors.area ? "area-error" : "area-hint"}
                className="field"
              >
                {DELIVERY_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area} — {AREA_FEE[area]} ETB delivery
                  </option>
                ))}
              </select>
              <p id="area-hint" className="field-hint"></p>
            </Field>
          </div>

          <div>
            <label htmlFor="note" className="field-label">
              Specific Message
              <span className="ml-1.5 font-normal text-sand-400">optional</span>
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="Extra berbere on the side, no jalapeño…"
              className="field resize-y"
            />
          </div>
        </fieldset>
      </section>

      <OrderSummary items={items} subtotal={total} fee={fee} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending || items.length === 0}
          className="btn btn-primary px-6 py-3 text-base"
        >
          {pending ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Placing order…
            </>
          ) : (
            "Place order"
          )}
        </button>

        <Link href="/menu" className="btn btn-outline">
          Keep browsing
        </Link>
      </div>
    </form>
  );
}

/* ---------- pieces ---------- */

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className="field-error">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        className="mt-px h-3.5 w-3.5 shrink-0"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.5" />
      </svg>
      {children}
    </p>
  );
}

function describedBy(id, error, hintId) {
  if (error) return `${id}-error`;
  return hintId;
}

function OrderSummary({ items, subtotal, fee }) {
  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sand-100 text-sand-400">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M2.5 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5l1.4-7.3H6" />
            <circle cx="9.5" cy="20" r="1.25" />
            <circle cx="17.5" cy="20" r="1.25" />
          </svg>
        </span>
        <div>
          <p className="font-display text-lg font-semibold">
            Your cart is empty
          </p>
          <p className="mt-1 text-sm text-sand-500">
            Add a dish or two before checking out.
          </p>
        </div>
        <Link href="/menu" className="btn btn-primary">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <section className="card overflow-hidden">
      <h2 className="border-b border-sand-200 px-5 py-4 font-display text-lg font-semibold tracking-tight sm:px-6">
        Order summary
      </h2>

      <ul className="divide-y divide-sand-100 px-5 sm:px-6">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-3.5">
            {item.image && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="3rem"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sand-800">
                {item.name}
              </p>
              <p className="text-xs text-sand-500">
                {item.price} ETB × {item.qty}
              </p>
            </div>
            <p className="price shrink-0 text-sm text-sand-800">
              {item.price * item.qty} ETB
            </p>
          </li>
        ))}
      </ul>

      <dl className="space-y-2 border-t border-sand-200 bg-sand-50 px-5 py-4 text-sm sm:px-6">
        <div className="flex justify-between">
          <dt className="text-sand-500">Subtotal</dt>
          <dd className="price text-sand-800">{subtotal} ETB</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sand-500">Delivery (from Bole)</dt>
          <dd className="price text-sand-800">{fee} ETB</dd>
        </div>
        <div className="divider my-2" />
        <div className="flex justify-between text-base">
          <dt className="font-semibold text-sand-900">Total</dt>
          <dd className="price text-brand-700">{subtotal + fee} ETB</dd>
        </div>
      </dl>
    </section>
  );
}
