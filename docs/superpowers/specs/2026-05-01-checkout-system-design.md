# Checkout System Design

**Date:** 2026-05-01  
**Status:** Approved  
**Scope:** Complete purchase flow — cart review, shipping details, mocked payment, order confirmation

---

## Overview

A multi-step checkout flow built on top of the existing cart and currency contexts. Users progress through four dedicated routes. State is held in a new `CheckoutContext`; route gating enforces step order so users cannot skip ahead.

No real payment processing — the payment step accepts any valid-format card input and always succeeds.

---

## Routes

| Route | Page Component | Description |
|---|---|---|
| `/checkout/cart` | `CartReviewStep` | Read-only cart summary, entry point to checkout |
| `/checkout/shipping` | `ShippingStep` | Full shipping + optional billing form |
| `/checkout/payment` | `PaymentStep` | Fake card form |
| `/checkout/confirmation` | `ConfirmationStep` | Order summary, order number, continue shopping |

All routes are wrapped in `CheckoutLayout` which renders the shared progress indicator. The existing `/cart` page gains a "Proceed to Checkout" button navigating to `/checkout/cart`.

---

## State Management — CheckoutContext

A new context at `src/context/CheckoutContext.tsx` holds all cross-step state.

### Shape

```ts
interface ShippingData {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  sameAsBilling: boolean;
  billingStreet: string;
  billingCity: string;
  billingZip: string;
  billingCountry: string;
  deliveryNotes: string;
}

interface CheckoutState {
  shippingData: ShippingData | null;
  paymentSubmitted: boolean;
  orderNumber: string | null;
}
```

### Actions

- `setShipping(data: ShippingData)` — saves shipping form, called on ShippingStep submit
- `submitPayment()` — sets `paymentSubmitted: true`, generates `orderNumber`
- `resetCheckout()` — clears all state back to initial (called after confirmation renders)

**Card details are never stored in context.** They live only in local component state during PaymentStep and are discarded on submit.

### Order Number Generation

Generated in `submitPayment()` as a short random hex string prefixed with `ORD-`, e.g. `ORD-4F2A9C`. Uses `Math.random()` — no persistence, purely for display.

---

## Route Gating — CheckoutGuard

A `<CheckoutGuard>` wrapper component enforces step prerequisites via React Router redirects:

| Route | Condition to access | Redirect if not met |
|---|---|---|
| `/checkout/cart` | Cart is non-empty | `/` |
| `/checkout/shipping` | Cart is non-empty | `/` |
| `/checkout/payment` | `shippingData !== null` | `/checkout/shipping` |
| `/checkout/confirmation` | `paymentSubmitted === true` | `/checkout/payment` |

Both `resetCheckout()` and `CartContext.clearCart()` are called when the user clicks "Continue Shopping" — not on mount. This keeps the confirmation page stable while the user is viewing it. After clicking "Continue Shopping", cart is empty and checkout state is reset, so any attempt to re-enter `/checkout/cart` redirects to `/`.

---

## Components

### Pages (`src/pages/checkout/`)

- **`CartReviewStep`** — read-only cart items (name, quantity, price in active currency), subtotal, total, "Proceed to Shipping" CTA
- **`ShippingStep`** — controlled form, validates on submit, calls `setShipping()`, navigates to `/checkout/payment`
- **`PaymentStep`** — controlled card form, validates on submit, calls `submitPayment()`, navigates to `/checkout/confirmation`
- **`ConfirmationStep`** — displays `orderNumber` (with copy-to-clipboard), item list, total, shipping address summary, "Continue Shopping" button → `/`

### Shared Checkout Components (`src/components/checkout/`)

- **`CheckoutLayout`** — wraps all checkout pages, renders `CheckoutProgress`
- **`CheckoutProgress`** — 4-step progress bar; derives current step from current route; completed steps show a checkmark; no backwards navigation after payment submitted
- **`CheckoutGuard`** — redirect logic, wraps protected routes in the router config
- **`FormField`** — reusable labeled input with inline error message display, used in both Shipping and Payment forms

---

## Form Fields & Validation

Validation runs **on submit only**. Errors render inline below each field. No external form library.

### Shipping Form

| Field | Type | Required | Validation |
|---|---|---|---|
| Full name | text | Yes | Non-empty |
| Email | email | Yes | Valid email format |
| Phone | tel | Yes | Non-empty |
| Street | text | Yes | Non-empty |
| City | text | Yes | Non-empty |
| ZIP / Postal code | text | Yes | Non-empty |
| Country | select | Yes | Non-empty |
| Delivery notes | textarea | No | — |
| "Different billing address" | checkbox | — | Toggles billing block |
| Billing street | text | If toggled | Non-empty |
| Billing city | text | If toggled | Non-empty |
| Billing ZIP | text | If toggled | Non-empty |
| Billing country | select | If toggled | Non-empty |

When "Different billing address" is unchecked, billing fields are hidden and billing = shipping.

### Payment Form

| Field | Type | Required | Validation |
|---|---|---|---|
| Cardholder name | text | Yes | Non-empty |
| Card number | text | Yes | 16 digits (spaces stripped before validate) |
| Expiry | text | Yes | MM/YY format |
| CVV | text | Yes | 3–4 digits |

---

## Data Flow Summary

1. User adds items via existing cart flow
2. From `/cart`, user clicks "Proceed to Checkout" → `/checkout/cart`
3. `CartReviewStep` shows items; user proceeds → `/checkout/shipping`
4. `ShippingStep` form filled and submitted → `setShipping()` called → `/checkout/payment`
5. `PaymentStep` card form filled and submitted → `submitPayment()` called → `/checkout/confirmation`
6. `ConfirmationStep` renders: `orderNumber` displayed, item list, shipping summary
7. User clicks "Continue Shopping" → `clearCart()` + `resetCheckout()` called → `/`

---

## File Structure

```
src/
  context/
    CheckoutContext.tsx          ← new
  pages/
    checkout/
      CartReviewStep.tsx         ← new
      ShippingStep.tsx           ← new
      PaymentStep.tsx            ← new
      ConfirmationStep.tsx       ← new
  components/
    checkout/
      CheckoutLayout.tsx         ← new
      CheckoutProgress.tsx       ← new
      CheckoutGuard.tsx          ← new
      FormField.tsx              ← new
  app/
    router.tsx                   ← modified: add checkout routes + CheckoutProvider
  pages/
    Cart.tsx                     ← modified: add "Proceed to Checkout" button
```

---

## Out of Scope

- Real payment processing
- Order persistence (localStorage or backend)
- Order history page
- Email confirmation
- Stock/inventory checks
- Address autocomplete
