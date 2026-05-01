# Checkout System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a four-step checkout flow (cart review → shipping → payment → confirmation) with route gating so users cannot skip steps.

**Architecture:** A new `CheckoutContext` holds cross-step state (shipping form data, payment submitted flag, order number). `CheckoutGuard` wraps each route and redirects users who try to jump ahead. Four page components render each step inside a shared `CheckoutLayout` with a 4-step progress indicator.

**Tech Stack:** React 19, React Router 7, react-i18next, plain CSS with design tokens (`var(--accent)`, `var(--line)`, etc.), Jest + React Testing Library (CRA default setup).

---

## File Map

**New files:**
- `src/context/checkoutContext.jsx`
- `src/context/checkoutContext.test.jsx`
- `src/components/checkout/checkoutGuard.jsx`
- `src/components/checkout/formField.jsx`
- `src/components/checkout/formField.css`
- `src/components/checkout/checkoutProgress.jsx`
- `src/components/checkout/checkoutLayout.jsx`
- `src/components/checkout/checkoutLayout.css`
- `src/pages/checkout/cartReview.jsx`
- `src/pages/checkout/cartReview.css`
- `src/pages/checkout/shipping.jsx`
- `src/pages/checkout/shipping.css`
- `src/pages/checkout/shipping.test.js`
- `src/pages/checkout/payment.jsx`
- `src/pages/checkout/payment.css`
- `src/pages/checkout/payment.test.js`
- `src/pages/checkout/confirmation.jsx`
- `src/pages/checkout/confirmation.css`
- `src/locales/en/checkout.json`
- `src/locales/fr/checkout.json`
- `src/locales/pt-BR/checkout.json`

**Modified files:**
- `src/app/rootLayout.jsx` — add `<CheckoutProvider>`
- `src/app/appRouter.jsx` — add checkout routes inside `<CheckoutLayout>`
- `src/i18n/config.js` — register `checkout` namespace for all 3 locales
- `src/pages/cart/cart.jsx` — add "Proceed to Checkout" button
- `src/pages/cart/cart.css` — add `.cartCheckoutBtn` style
- `src/locales/en/cart.json` — add `checkout` key, update `checkoutNote`
- `src/locales/fr/cart.json` — same
- `src/locales/pt-BR/cart.json` — same

---

### Task 1: CheckoutContext

**Files:**
- Create: `src/context/checkoutContext.jsx`
- Create: `src/context/checkoutContext.test.jsx`
- Modify: `src/app/rootLayout.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/context/checkoutContext.test.jsx`:

```jsx
import { renderHook, act } from "@testing-library/react";
import { CheckoutProvider, useCheckout } from "./checkoutContext";

const wrapper = ({ children }) => <CheckoutProvider>{children}</CheckoutProvider>;

test("initial state is empty", () => {
  const { result } = renderHook(() => useCheckout(), { wrapper });
  expect(result.current.shippingData).toBeNull();
  expect(result.current.paymentSubmitted).toBe(false);
  expect(result.current.orderNumber).toBeNull();
});

test("setShipping stores data", () => {
  const { result } = renderHook(() => useCheckout(), { wrapper });
  const data = { fullName: "Jane Doe", email: "jane@test.com" };
  act(() => result.current.setShipping(data));
  expect(result.current.shippingData).toEqual(data);
});

test("submitPayment sets flag and generates order number", () => {
  const { result } = renderHook(() => useCheckout(), { wrapper });
  act(() => result.current.submitPayment());
  expect(result.current.paymentSubmitted).toBe(true);
  expect(result.current.orderNumber).toMatch(/^ORD-[0-9A-F]+$/);
});

test("resetCheckout clears all state", () => {
  const { result } = renderHook(() => useCheckout(), { wrapper });
  act(() => result.current.setShipping({ fullName: "Test" }));
  act(() => result.current.submitPayment());
  act(() => result.current.resetCheckout());
  expect(result.current.shippingData).toBeNull();
  expect(result.current.paymentSubmitted).toBe(false);
  expect(result.current.orderNumber).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --watchAll=false --testPathPattern=checkoutContext`

Expected: FAIL — "Cannot find module './checkoutContext'"

- [ ] **Step 3: Create the context**

Create `src/context/checkoutContext.jsx`:

```jsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const CheckoutContext = createContext(null);

function generateOrderNumber() {
  return "ORD-" + Math.random().toString(16).slice(2, 8).toUpperCase();
}

export function CheckoutProvider({ children }) {
  const [shippingData, setShippingData] = useState(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  const setShipping = useCallback((data) => {
    setShippingData(data);
  }, []);

  const submitPayment = useCallback(() => {
    setOrderNumber(generateOrderNumber());
    setPaymentSubmitted(true);
  }, []);

  const resetCheckout = useCallback(() => {
    setShippingData(null);
    setPaymentSubmitted(false);
    setOrderNumber(null);
  }, []);

  const value = useMemo(
    () => ({
      shippingData,
      paymentSubmitted,
      orderNumber,
      setShipping,
      submitPayment,
      resetCheckout,
    }),
    [shippingData, paymentSubmitted, orderNumber, setShipping, submitPayment, resetCheckout]
  );

  return (
    <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --watchAll=false --testPathPattern=checkoutContext`

Expected: PASS — 4 tests pass

- [ ] **Step 5: Add CheckoutProvider to rootLayout**

Replace the full contents of `src/app/rootLayout.jsx` with:

```jsx
import { Outlet } from "react-router-dom";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import { CartProvider } from "../context/cartContext";
import { CurrencyProvider } from "../context/currencyContext";
import { NewArrivalsProvider } from "../context/newArrivalsContext";
import { CheckoutProvider } from "../context/checkoutContext";
import DocumentLang from "../i18n/DocumentLang";

export default function RootLayout() {
  return (
    <CurrencyProvider>
      <NewArrivalsProvider>
        <CartProvider>
          <CheckoutProvider>
            <DocumentLang />
            <div className="page">
              <Header />
              <main id="main">
                <Outlet />
              </main>
              <Footer />
            </div>
          </CheckoutProvider>
        </CartProvider>
      </NewArrivalsProvider>
    </CurrencyProvider>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/context/checkoutContext.jsx src/context/checkoutContext.test.jsx src/app/rootLayout.jsx
git commit -m "feat: add CheckoutContext with provider and useCheckout hook"
```

---

### Task 2: CheckoutGuard

**Files:**
- Create: `src/components/checkout/checkoutGuard.jsx`

- [ ] **Step 1: Create the guard**

Create `src/components/checkout/checkoutGuard.jsx`:

```jsx
import { Navigate } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { useCheckout } from "../../context/checkoutContext";

export default function CheckoutGuard({ step, children }) {
  const { items } = useCart();
  const { shippingData, paymentSubmitted } = useCheckout();

  if ((step === "cart" || step === "shipping") && items.length === 0) {
    return <Navigate to="/" replace />;
  }
  if (step === "payment" && !shippingData) {
    return <Navigate to="/checkout/shipping" replace />;
  }
  if (step === "confirmation" && !paymentSubmitted) {
    return <Navigate to="/checkout/payment" replace />;
  }
  return children;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/checkout/checkoutGuard.jsx
git commit -m "feat: add CheckoutGuard route gating component"
```

---

### Task 3: FormField component

**Files:**
- Create: `src/components/checkout/formField.jsx`
- Create: `src/components/checkout/formField.css`

- [ ] **Step 1: Create FormField**

Create `src/components/checkout/formField.jsx`:

```jsx
import "./formField.css";

export default function FormField({ id, label, error, className, children }) {
  const classes = ["formField", error ? "formFieldError" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes}>
      <label className="formFieldLabel" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <span className="formFieldErrorMsg" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create formField.css**

Create `src/components/checkout/formField.css`:

```css
.formField {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.formFieldLabel {
  font-size: 0.875rem;
  color: var(--muted);
  font-weight: 500;
}

.formField input,
.formField select,
.formField textarea {
  padding: 10px 14px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-pure);
  font: inherit;
  font-size: 0.9375rem;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.formField input:focus,
.formField select:focus,
.formField textarea:focus {
  border-color: var(--accent);
}

.formFieldError input,
.formFieldError select,
.formFieldError textarea {
  border-color: #c0392b;
}

.formFieldErrorMsg {
  font-size: 0.8125rem;
  color: #c0392b;
}

.formField textarea {
  resize: vertical;
  min-height: 80px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/checkout/formField.jsx src/components/checkout/formField.css
git commit -m "feat: add reusable FormField component"
```

---

### Task 4: i18n checkout translations

**Files:**
- Create: `src/locales/en/checkout.json`
- Create: `src/locales/fr/checkout.json`
- Create: `src/locales/pt-BR/checkout.json`
- Modify: `src/i18n/config.js`

- [ ] **Step 1: Create English translations**

Create `src/locales/en/checkout.json`:

```json
{
  "progress": {
    "cart": "Cart",
    "shipping": "Shipping",
    "payment": "Payment",
    "confirmation": "Confirmation"
  },
  "cartReview": {
    "title": "Review your cart",
    "listAria": "Cart items",
    "subtotal": "Subtotal",
    "proceed": "Proceed to Shipping"
  },
  "shipping": {
    "title": "Shipping Details",
    "fullName": "Full name",
    "email": "Email address",
    "phone": "Phone",
    "street": "Street address",
    "city": "City",
    "zip": "ZIP / Postal code",
    "country": "Country",
    "deliveryNotes": "Delivery notes (optional)",
    "differentBilling": "Ship to a different billing address",
    "billingTitle": "Billing Address",
    "proceed": "Continue to Payment",
    "errors": {
      "required": "This field is required",
      "invalidEmail": "Enter a valid email address"
    }
  },
  "payment": {
    "title": "Payment",
    "cardholderName": "Cardholder name",
    "cardNumber": "Card number",
    "expiry": "Expiry (MM/YY)",
    "cvv": "CVV",
    "proceed": "Pay Now",
    "mockNote": "This is a demo — no real charges will be made.",
    "errors": {
      "required": "This field is required",
      "cardNumber": "Must be 16 digits",
      "expiry": "Use MM/YY format",
      "cvv": "Must be 3–4 digits"
    }
  },
  "confirmation": {
    "title": "Order Confirmed!",
    "orderNumber": "Order number",
    "copy": "Copy",
    "copied": "Copied!",
    "items": "Items",
    "total": "Total",
    "shippingTo": "Shipping to",
    "continueShopping": "Continue Shopping"
  }
}
```

- [ ] **Step 2: Create French translations**

Create `src/locales/fr/checkout.json`:

```json
{
  "progress": {
    "cart": "Panier",
    "shipping": "Livraison",
    "payment": "Paiement",
    "confirmation": "Confirmation"
  },
  "cartReview": {
    "title": "Votre panier",
    "listAria": "Articles du panier",
    "subtotal": "Sous-total",
    "proceed": "Passer à la livraison"
  },
  "shipping": {
    "title": "Informations de livraison",
    "fullName": "Nom complet",
    "email": "Adresse e-mail",
    "phone": "Téléphone",
    "street": "Adresse",
    "city": "Ville",
    "zip": "Code postal",
    "country": "Pays",
    "deliveryNotes": "Notes de livraison (facultatif)",
    "differentBilling": "Adresse de facturation différente",
    "billingTitle": "Adresse de facturation",
    "proceed": "Continuer vers le paiement",
    "errors": {
      "required": "Ce champ est obligatoire",
      "invalidEmail": "Entrez une adresse e-mail valide"
    }
  },
  "payment": {
    "title": "Paiement",
    "cardholderName": "Nom du titulaire",
    "cardNumber": "Numéro de carte",
    "expiry": "Expiration (MM/AA)",
    "cvv": "CVV",
    "proceed": "Payer maintenant",
    "mockNote": "Ceci est une démo — aucun prélèvement ne sera effectué.",
    "errors": {
      "required": "Ce champ est obligatoire",
      "cardNumber": "Doit comporter 16 chiffres",
      "expiry": "Utilisez le format MM/AA",
      "cvv": "Doit comporter 3 ou 4 chiffres"
    }
  },
  "confirmation": {
    "title": "Commande confirmée !",
    "orderNumber": "Numéro de commande",
    "copy": "Copier",
    "copied": "Copié !",
    "items": "Articles",
    "total": "Total",
    "shippingTo": "Livraison à",
    "continueShopping": "Continuer les achats"
  }
}
```

- [ ] **Step 3: Create Portuguese (Brazil) translations**

Create `src/locales/pt-BR/checkout.json`:

```json
{
  "progress": {
    "cart": "Sacola",
    "shipping": "Entrega",
    "payment": "Pagamento",
    "confirmation": "Confirmação"
  },
  "cartReview": {
    "title": "Revisar sacola",
    "listAria": "Itens da sacola",
    "subtotal": "Subtotal",
    "proceed": "Ir para entrega"
  },
  "shipping": {
    "title": "Dados de entrega",
    "fullName": "Nome completo",
    "email": "E-mail",
    "phone": "Telefone",
    "street": "Endereço",
    "city": "Cidade",
    "zip": "CEP",
    "country": "País",
    "deliveryNotes": "Observações de entrega (opcional)",
    "differentBilling": "Endereço de cobrança diferente",
    "billingTitle": "Endereço de cobrança",
    "proceed": "Ir para pagamento",
    "errors": {
      "required": "Este campo é obrigatório",
      "invalidEmail": "Insira um e-mail válido"
    }
  },
  "payment": {
    "title": "Pagamento",
    "cardholderName": "Nome no cartão",
    "cardNumber": "Número do cartão",
    "expiry": "Validade (MM/AA)",
    "cvv": "CVV",
    "proceed": "Pagar agora",
    "mockNote": "Esta é uma demonstração — nenhuma cobrança real será feita.",
    "errors": {
      "required": "Este campo é obrigatório",
      "cardNumber": "Deve ter 16 dígitos",
      "expiry": "Use o formato MM/AA",
      "cvv": "Deve ter 3 ou 4 dígitos"
    }
  },
  "confirmation": {
    "title": "Pedido confirmado!",
    "orderNumber": "Número do pedido",
    "copy": "Copiar",
    "copied": "Copiado!",
    "items": "Itens",
    "total": "Total",
    "shippingTo": "Entrega para",
    "continueShopping": "Continuar comprando"
  }
}
```

- [ ] **Step 4: Register checkout namespace in config.js**

Replace the full contents of `src/i18n/config.js` with:

```js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../locales/en/common.json";
import enNav from "../locales/en/nav.json";
import enCategory from "../locales/en/category.json";
import enProduct from "../locales/en/product.json";
import enHome from "../locales/en/home.json";
import enPages from "../locales/en/pages.json";
import enCart from "../locales/en/cart.json";
import enCheckout from "../locales/en/checkout.json";

import frCommon from "../locales/fr/common.json";
import frNav from "../locales/fr/nav.json";
import frCategory from "../locales/fr/category.json";
import frProduct from "../locales/fr/product.json";
import frHome from "../locales/fr/home.json";
import frPages from "../locales/fr/pages.json";
import frCart from "../locales/fr/cart.json";
import frCheckout from "../locales/fr/checkout.json";

import ptBRCommon from "../locales/pt-BR/common.json";
import ptBRNav from "../locales/pt-BR/nav.json";
import ptBRCategory from "../locales/pt-BR/category.json";
import ptBRProduct from "../locales/pt-BR/product.json";
import ptBRHome from "../locales/pt-BR/home.json";
import ptBRPages from "../locales/pt-BR/pages.json";
import ptBRCart from "../locales/pt-BR/cart.json";
import ptBRCheckout from "../locales/pt-BR/checkout.json";

/** Idiomas expostos na UI (select). */
export const SUPPORTED_LANGUAGES = ["en", "fr", "pt-BR"];

/**
 * Inclui `pt` porque, com `nonExplicitSupportedLngs: true`, o i18next valida só a
 * parte de língua (`pt` para `pt-BR`). Sem `pt` na lista, PT-BR era rejeitado.
 * O bundle é o mesmo que `pt-BR`.
 */
export const I18N_SUPPORTED_LANGUAGES = [...SUPPORTED_LANGUAGES, "pt"];

export const LANGUAGE_STORAGE_KEY = "e-project.language";

const ptBrBundle = {
  common: ptBRCommon,
  nav: ptBRNav,
  category: ptBRCategory,
  product: ptBRProduct,
  home: ptBRHome,
  pages: ptBRPages,
  cart: ptBRCart,
  checkout: ptBRCheckout,
};

const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    category: enCategory,
    product: enProduct,
    home: enHome,
    pages: enPages,
    cart: enCart,
    checkout: enCheckout,
  },
  fr: {
    common: frCommon,
    nav: frNav,
    category: frCategory,
    product: frProduct,
    home: frHome,
    pages: frPages,
    cart: frCart,
    checkout: frCheckout,
  },
  "pt-BR": ptBrBundle,
  pt: ptBrBundle,
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: I18N_SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    ns: ["common", "nav", "category", "product", "home", "pages", "cart", "checkout"],
    defaultNS: "common",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
```

- [ ] **Step 5: Commit**

```bash
git add src/locales/en/checkout.json src/locales/fr/checkout.json src/locales/pt-BR/checkout.json src/i18n/config.js
git commit -m "feat: add checkout i18n namespace (en/fr/pt-BR)"
```

---

### Task 5: CheckoutLayout and CheckoutProgress

**Files:**
- Create: `src/components/checkout/checkoutProgress.jsx`
- Create: `src/components/checkout/checkoutLayout.jsx`
- Create: `src/components/checkout/checkoutLayout.css`

- [ ] **Step 1: Create CheckoutProgress**

Create `src/components/checkout/checkoutProgress.jsx`:

```jsx
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PATH_TO_INDEX = {
  "/checkout/cart": 0,
  "/checkout/shipping": 1,
  "/checkout/payment": 2,
  "/checkout/confirmation": 3,
};

export default function CheckoutProgress() {
  const { pathname } = useLocation();
  const { t } = useTranslation("checkout");
  const currentIndex = PATH_TO_INDEX[pathname] ?? 0;

  const steps = [
    t("progress.cart"),
    t("progress.shipping"),
    t("progress.payment"),
    t("progress.confirmation"),
  ];

  return (
    <nav className="checkoutProgress" aria-label="Checkout steps">
      <ol className="checkoutProgressList">
        {steps.map((label, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <li
              key={label}
              className={[
                "checkoutProgressStep",
                isDone ? "checkoutProgressStep--done" : "",
                isCurrent ? "checkoutProgressStep--current" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="checkoutProgressDot" aria-hidden="true">
                {isDone ? "✓" : i + 1}
              </span>
              <span className="checkoutProgressLabel">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Create CheckoutLayout**

Create `src/components/checkout/checkoutLayout.jsx`:

```jsx
import { Outlet } from "react-router-dom";
import CheckoutProgress from "./checkoutProgress";
import "./checkoutLayout.css";

export default function CheckoutLayout() {
  return (
    <div className="container checkoutLayoutWrap">
      <CheckoutProgress />
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 3: Create checkoutLayout.css**

Create `src/components/checkout/checkoutLayout.css`:

```css
/* ── Outer wrap ─────────────────────────────────────── */
.checkoutLayoutWrap {
  padding-block: 40px 80px;
}

/* ── Progress bar ───────────────────────────────────── */
.checkoutProgress {
  margin-bottom: 48px;
}

.checkoutProgressList {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.checkoutProgressStep {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 0.875rem;
  white-space: nowrap;
}

.checkoutProgressStep:not(:last-child) {
  flex: 1;
}

.checkoutProgressStep:not(:last-child)::after {
  content: "";
  display: block;
  flex: 1;
  height: 1px;
  background: var(--line);
  margin-inline: 12px;
  min-width: 20px;
}

.checkoutProgressStep--done {
  color: var(--text);
}

.checkoutProgressStep--current {
  color: var(--accent);
  font-weight: 600;
}

.checkoutProgressDot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.checkoutProgressStep--done .checkoutProgressDot {
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
}

.checkoutProgressStep--current .checkoutProgressDot {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

/* ── Shared step page styles ────────────────────────── */
.checkoutSection {
  max-width: 640px;
}

.checkoutSectionTitle {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  margin: 0 0 32px;
}

.checkoutSummary {
  border-top: 1px solid var(--line);
  padding-top: 24px;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checkoutSummaryRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

.checkoutSummaryAmount {
  font-weight: 600;
  font-size: 1.125rem;
  font-variant-numeric: tabular-nums;
}

.checkoutBtn {
  display: block;
  width: 100%;
  padding: 14px 24px;
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: var(--radius);
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: opacity 0.15s;
}

.checkoutBtn:hover {
  opacity: 0.85;
}

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 600px) {
  .checkoutProgressLabel {
    display: none;
  }

  .checkoutProgressStep:not(:last-child)::after {
    margin-inline: 6px;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/checkout/checkoutProgress.jsx src/components/checkout/checkoutLayout.jsx src/components/checkout/checkoutLayout.css
git commit -m "feat: add CheckoutLayout and CheckoutProgress"
```

---

### Task 6: CartReviewStep

**Files:**
- Create: `src/pages/checkout/cartReview.jsx`
- Create: `src/pages/checkout/cartReview.css`

- [ ] **Step 1: Create cartReview.jsx**

Create `src/pages/checkout/cartReview.jsx`:

```jsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { useCurrency } from "../../context/currencyContext";
import "./cartReview.css";

export default function CartReview() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { items, subtotalUsd } = useCart();
  const { formatPriceUsd } = useCurrency();

  return (
    <section className="checkoutSection">
      <h1 className="checkoutSectionTitle">{t("cartReview.title")}</h1>
      <ul className="cartReviewList" aria-label={t("cartReview.listAria")}>
        {items.map((line) => (
          <li key={line.productId} className="cartReviewLine">
            {line.imageUrl ? (
              <img className="cartReviewImg" src={line.imageUrl} alt="" />
            ) : (
              <div className="cartReviewImgPlaceholder" aria-hidden="true" />
            )}
            <div className="cartReviewBody">
              <span className="cartReviewLabel">{line.label}</span>
              <span className="cartReviewQty">× {line.quantity}</span>
            </div>
            <span className="cartReviewPrice">
              {formatPriceUsd(line.priceUsd * line.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <footer className="checkoutSummary">
        <div className="checkoutSummaryRow">
          <span>{t("cartReview.subtotal")}</span>
          <span className="checkoutSummaryAmount">{formatPriceUsd(subtotalUsd)}</span>
        </div>
        <button
          type="button"
          className="checkoutBtn"
          onClick={() => navigate("/checkout/shipping")}
        >
          {t("cartReview.proceed")}
        </button>
      </footer>
    </section>
  );
}
```

- [ ] **Step 2: Create cartReview.css**

Create `src/pages/checkout/cartReview.css`:

```css
.cartReviewList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.cartReviewLine {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  gap: 16px;
  padding-block: 16px;
  border-bottom: 1px solid var(--line);
}

.cartReviewImg {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--soft);
  display: block;
}

.cartReviewImgPlaceholder {
  width: 64px;
  height: 64px;
  border-radius: var(--radius);
  background: var(--soft);
}

.cartReviewBody {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cartReviewLabel {
  font-size: 0.9375rem;
  font-weight: 500;
}

.cartReviewQty {
  font-size: 0.875rem;
  color: var(--muted);
}

.cartReviewPrice {
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/checkout/cartReview.jsx src/pages/checkout/cartReview.css
git commit -m "feat: add CartReview checkout step"
```

---

### Task 7: ShippingStep

**Files:**
- Create: `src/pages/checkout/shipping.jsx`
- Create: `src/pages/checkout/shipping.css`
- Create: `src/pages/checkout/shipping.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/pages/checkout/shipping.test.js`:

```js
import { validate } from "./shipping";

const valid = {
  fullName: "Jane Doe",
  email: "jane@test.com",
  phone: "555-0100",
  street: "123 Main St",
  city: "Springfield",
  zip: "12345",
  country: "US",
  sameAsBilling: true,
  billingStreet: "",
  billingCity: "",
  billingZip: "",
  billingCountry: "",
  deliveryNotes: "",
};

test("returns no errors for valid data", () => {
  expect(validate(valid)).toEqual({});
});

test("requires fullName", () => {
  expect(validate({ ...valid, fullName: "" })).toHaveProperty("fullName");
});

test("requires email", () => {
  expect(validate({ ...valid, email: "" })).toHaveProperty("email");
});

test("rejects malformed email", () => {
  expect(validate({ ...valid, email: "notanemail" })).toHaveProperty("email");
});

test("requires all address fields", () => {
  expect(validate({ ...valid, street: "" })).toHaveProperty("street");
  expect(validate({ ...valid, city: "" })).toHaveProperty("city");
  expect(validate({ ...valid, zip: "" })).toHaveProperty("zip");
  expect(validate({ ...valid, country: "" })).toHaveProperty("country");
});

test("requires billing fields when sameAsBilling is false", () => {
  const errors = validate({
    ...valid,
    sameAsBilling: false,
    billingStreet: "",
    billingCity: "",
    billingZip: "",
    billingCountry: "",
  });
  expect(errors).toHaveProperty("billingStreet");
  expect(errors).toHaveProperty("billingCity");
  expect(errors).toHaveProperty("billingZip");
  expect(errors).toHaveProperty("billingCountry");
});

test("no billing errors when sameAsBilling is true", () => {
  const errors = validate({ ...valid, sameAsBilling: true });
  expect(errors).not.toHaveProperty("billingStreet");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --watchAll=false --testPathPattern=shipping.test`

Expected: FAIL — "Cannot find module './shipping'"

- [ ] **Step 3: Create shipping.jsx**

Create `src/pages/checkout/shipping.jsx`:

```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../../context/checkoutContext";
import FormField from "../../components/checkout/formField";
import "./shipping.css";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "BR", name: "Brazil" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
];

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  zip: "",
  country: "",
  sameAsBilling: true,
  billingStreet: "",
  billingCity: "",
  billingZip: "",
  billingCountry: "",
  deliveryNotes: "",
};

export function validate(values) {
  const errors = {};
  if (!values.fullName.trim()) errors.fullName = "required";
  if (!values.email.trim()) errors.email = "required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "invalidEmail";
  if (!values.phone.trim()) errors.phone = "required";
  if (!values.street.trim()) errors.street = "required";
  if (!values.city.trim()) errors.city = "required";
  if (!values.zip.trim()) errors.zip = "required";
  if (!values.country.trim()) errors.country = "required";
  if (!values.sameAsBilling) {
    if (!values.billingStreet.trim()) errors.billingStreet = "required";
    if (!values.billingCity.trim()) errors.billingCity = "required";
    if (!values.billingZip.trim()) errors.billingZip = "required";
    if (!values.billingCountry.trim()) errors.billingCountry = "required";
  }
  return errors;
}

export default function Shipping() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { shippingData, setShipping } = useCheckout();
  const [values, setValues] = useState(shippingData ?? EMPTY);
  const [errors, setErrors] = useState({});

  function set(field, val) {
    setValues((prev) => ({ ...prev, [field]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setShipping(values);
    navigate("/checkout/payment");
  }

  function errorMsg(key) {
    if (!errors[key]) return undefined;
    return t(`shipping.errors.${errors[key]}`);
  }

  return (
    <section className="checkoutSection">
      <h1 className="checkoutSectionTitle">{t("shipping.title")}</h1>
      <form className="shippingForm" onSubmit={handleSubmit} noValidate>
        <div className="shippingGrid">
          <FormField id="fullName" label={t("shipping.fullName")} error={errorMsg("fullName")} className="shippingFullRow">
            <input
              id="fullName"
              type="text"
              value={values.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              autoComplete="name"
            />
          </FormField>

          <FormField id="email" label={t("shipping.email")} error={errorMsg("email")}>
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
            />
          </FormField>

          <FormField id="phone" label={t("shipping.phone")} error={errorMsg("phone")}>
            <input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              autoComplete="tel"
            />
          </FormField>

          <FormField id="street" label={t("shipping.street")} error={errorMsg("street")} className="shippingFullRow">
            <input
              id="street"
              type="text"
              value={values.street}
              onChange={(e) => set("street", e.target.value)}
              autoComplete="street-address"
            />
          </FormField>

          <FormField id="city" label={t("shipping.city")} error={errorMsg("city")}>
            <input
              id="city"
              type="text"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              autoComplete="address-level2"
            />
          </FormField>

          <FormField id="zip" label={t("shipping.zip")} error={errorMsg("zip")}>
            <input
              id="zip"
              type="text"
              value={values.zip}
              onChange={(e) => set("zip", e.target.value)}
              autoComplete="postal-code"
            />
          </FormField>

          <FormField id="country" label={t("shipping.country")} error={errorMsg("country")}>
            <select
              id="country"
              value={values.country}
              onChange={(e) => set("country", e.target.value)}
              autoComplete="country"
            >
              <option value="" />
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="deliveryNotes" label={t("shipping.deliveryNotes")} className="shippingFullRow">
            <textarea
              id="deliveryNotes"
              value={values.deliveryNotes}
              onChange={(e) => set("deliveryNotes", e.target.value)}
            />
          </FormField>
        </div>

        <label className="shippingBillingToggle">
          <input
            type="checkbox"
            checked={!values.sameAsBilling}
            onChange={(e) => set("sameAsBilling", !e.target.checked)}
          />
          {t("shipping.differentBilling")}
        </label>

        {!values.sameAsBilling && (
          <div className="shippingBillingBlock">
            <h2 className="shippingBillingTitle">{t("shipping.billingTitle")}</h2>
            <div className="shippingGrid">
              <FormField id="billingStreet" label={t("shipping.street")} error={errorMsg("billingStreet")} className="shippingFullRow">
                <input
                  id="billingStreet"
                  type="text"
                  value={values.billingStreet}
                  onChange={(e) => set("billingStreet", e.target.value)}
                  autoComplete="billing street-address"
                />
              </FormField>

              <FormField id="billingCity" label={t("shipping.city")} error={errorMsg("billingCity")}>
                <input
                  id="billingCity"
                  type="text"
                  value={values.billingCity}
                  onChange={(e) => set("billingCity", e.target.value)}
                />
              </FormField>

              <FormField id="billingZip" label={t("shipping.zip")} error={errorMsg("billingZip")}>
                <input
                  id="billingZip"
                  type="text"
                  value={values.billingZip}
                  onChange={(e) => set("billingZip", e.target.value)}
                />
              </FormField>

              <FormField id="billingCountry" label={t("shipping.country")} error={errorMsg("billingCountry")}>
                <select
                  id="billingCountry"
                  value={values.billingCountry}
                  onChange={(e) => set("billingCountry", e.target.value)}
                >
                  <option value="" />
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>
        )}

        <footer className="checkoutSummary">
          <button type="submit" className="checkoutBtn">
            {t("shipping.proceed")}
          </button>
        </footer>
      </form>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --watchAll=false --testPathPattern=shipping.test`

Expected: PASS — 7 tests pass

- [ ] **Step 5: Create shipping.css**

Create `src/pages/checkout/shipping.css`:

```css
.shippingForm {
  display: flex;
  flex-direction: column;
}

.shippingGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.shippingFullRow {
  grid-column: 1 / -1;
}

.shippingBillingToggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  font-size: 0.9375rem;
  cursor: pointer;
  user-select: none;
}

.shippingBillingToggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  cursor: pointer;
  flex-shrink: 0;
}

.shippingBillingBlock {
  margin-top: 24px;
  padding: 24px;
  background: var(--soft);
  border-radius: var(--radius);
}

.shippingBillingTitle {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 20px;
}

@media (max-width: 600px) {
  .shippingGrid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/checkout/shipping.jsx src/pages/checkout/shipping.css src/pages/checkout/shipping.test.js
git commit -m "feat: add ShippingStep with form validation"
```

---

### Task 8: PaymentStep

**Files:**
- Create: `src/pages/checkout/payment.jsx`
- Create: `src/pages/checkout/payment.css`
- Create: `src/pages/checkout/payment.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/pages/checkout/payment.test.js`:

```js
import { validatePayment } from "./payment";

const valid = {
  cardholderName: "Jane Doe",
  cardNumber: "4111 1111 1111 1111",
  expiry: "12/27",
  cvv: "123",
};

test("returns no errors for valid data", () => {
  expect(validatePayment(valid)).toEqual({});
});

test("requires cardholderName", () => {
  expect(validatePayment({ ...valid, cardholderName: "" })).toHaveProperty("cardholderName");
});

test("rejects card number shorter than 16 digits", () => {
  expect(validatePayment({ ...valid, cardNumber: "1234 5678" })).toHaveProperty("cardNumber");
});

test("accepts 16-digit card number with spaces", () => {
  expect(validatePayment({ ...valid, cardNumber: "4111 1111 1111 1111" })).not.toHaveProperty("cardNumber");
});

test("rejects non-MM/YY expiry format", () => {
  expect(validatePayment({ ...valid, expiry: "1227" })).toHaveProperty("expiry");
  expect(validatePayment({ ...valid, expiry: "12/2027" })).toHaveProperty("expiry");
});

test("accepts valid MM/YY expiry", () => {
  expect(validatePayment({ ...valid, expiry: "01/29" })).not.toHaveProperty("expiry");
});

test("rejects CVV shorter than 3 digits", () => {
  expect(validatePayment({ ...valid, cvv: "12" })).toHaveProperty("cvv");
});

test("accepts 4-digit CVV", () => {
  expect(validatePayment({ ...valid, cvv: "1234" })).not.toHaveProperty("cvv");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --watchAll=false --testPathPattern=payment.test`

Expected: FAIL — "Cannot find module './payment'"

- [ ] **Step 3: Create payment.jsx**

Create `src/pages/checkout/payment.jsx`:

```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../../context/checkoutContext";
import FormField from "../../components/checkout/formField";
import "./payment.css";

export function validatePayment(values) {
  const errors = {};
  if (!values.cardholderName.trim()) errors.cardholderName = "required";
  const digits = values.cardNumber.replace(/\s/g, "");
  if (!digits) errors.cardNumber = "required";
  else if (!/^\d{16}$/.test(digits)) errors.cardNumber = "cardNumber";
  if (!values.expiry.trim()) errors.expiry = "required";
  else if (!/^\d{2}\/\d{2}$/.test(values.expiry)) errors.expiry = "expiry";
  if (!values.cvv.trim()) errors.cvv = "required";
  else if (!/^\d{3,4}$/.test(values.cvv)) errors.cvv = "cvv";
  return errors;
}

const EMPTY = { cardholderName: "", cardNumber: "", expiry: "", cvv: "" };

export default function Payment() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { submitPayment } = useCheckout();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  function set(field, val) {
    setValues((prev) => ({ ...prev, [field]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validatePayment(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    submitPayment();
    navigate("/checkout/confirmation");
  }

  function errorMsg(key) {
    if (!errors[key]) return undefined;
    return t(`payment.errors.${errors[key]}`);
  }

  return (
    <section className="checkoutSection">
      <h1 className="checkoutSectionTitle">{t("payment.title")}</h1>
      <p className="paymentMockNote">{t("payment.mockNote")}</p>
      <form className="paymentForm" onSubmit={handleSubmit} noValidate>
        <div className="paymentGrid">
          <FormField
            id="cardholderName"
            label={t("payment.cardholderName")}
            error={errorMsg("cardholderName")}
            className="paymentFullRow"
          >
            <input
              id="cardholderName"
              type="text"
              value={values.cardholderName}
              onChange={(e) => set("cardholderName", e.target.value)}
              autoComplete="cc-name"
            />
          </FormField>

          <FormField
            id="cardNumber"
            label={t("payment.cardNumber")}
            error={errorMsg("cardNumber")}
            className="paymentFullRow"
          >
            <input
              id="cardNumber"
              type="text"
              inputMode="numeric"
              value={values.cardNumber}
              onChange={(e) => set("cardNumber", e.target.value)}
              placeholder="0000 0000 0000 0000"
              autoComplete="cc-number"
              maxLength={19}
            />
          </FormField>

          <FormField id="expiry" label={t("payment.expiry")} error={errorMsg("expiry")}>
            <input
              id="expiry"
              type="text"
              inputMode="numeric"
              value={values.expiry}
              onChange={(e) => set("expiry", e.target.value)}
              placeholder="MM/YY"
              autoComplete="cc-exp"
              maxLength={5}
            />
          </FormField>

          <FormField id="cvv" label={t("payment.cvv")} error={errorMsg("cvv")}>
            <input
              id="cvv"
              type="text"
              inputMode="numeric"
              value={values.cvv}
              onChange={(e) => set("cvv", e.target.value)}
              placeholder="123"
              autoComplete="cc-csc"
              maxLength={4}
            />
          </FormField>
        </div>

        <footer className="checkoutSummary">
          <button type="submit" className="checkoutBtn">
            {t("payment.proceed")}
          </button>
        </footer>
      </form>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --watchAll=false --testPathPattern=payment.test`

Expected: PASS — 8 tests pass

- [ ] **Step 5: Create payment.css**

Create `src/pages/checkout/payment.css`:

```css
.paymentMockNote {
  font-size: 0.875rem;
  color: var(--muted);
  margin: 0 0 28px;
  padding: 12px 16px;
  background: var(--soft);
  border-radius: var(--radius);
}

.paymentForm {
  display: flex;
  flex-direction: column;
}

.paymentGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.paymentFullRow {
  grid-column: 1 / -1;
}

@media (max-width: 600px) {
  .paymentGrid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/checkout/payment.jsx src/pages/checkout/payment.css src/pages/checkout/payment.test.js
git commit -m "feat: add PaymentStep with card validation"
```

---

### Task 9: ConfirmationStep

**Files:**
- Create: `src/pages/checkout/confirmation.jsx`
- Create: `src/pages/checkout/confirmation.css`

- [ ] **Step 1: Create confirmation.jsx**

Create `src/pages/checkout/confirmation.jsx`:

```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { useCheckout } from "../../context/checkoutContext";
import { useCurrency } from "../../context/currencyContext";
import "./confirmation.css";

export default function Confirmation() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { items, subtotalUsd, clearCart } = useCart();
  const { orderNumber, shippingData, resetCheckout } = useCheckout();
  const { formatPriceUsd } = useCurrency();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleContinue() {
    clearCart();
    resetCheckout();
    navigate("/");
  }

  return (
    <section className="checkoutSection confirmationSection">
      <h1 className="confirmationTitle">{t("confirmation.title")}</h1>

      <div className="confirmationOrderBox">
        <span className="confirmationOrderLabel">{t("confirmation.orderNumber")}</span>
        <div className="confirmationOrderRow">
          <span className="confirmationOrderNumber">{orderNumber}</span>
          <button type="button" className="confirmationCopyBtn" onClick={handleCopy}>
            {copied ? t("confirmation.copied") : t("confirmation.copy")}
          </button>
        </div>
      </div>

      {shippingData && (
        <div className="confirmationBlock">
          <h2 className="confirmationBlockTitle">{t("confirmation.shippingTo")}</h2>
          <address className="confirmationAddress">
            <span>{shippingData.fullName}</span>
            <span>{shippingData.street}</span>
            <span>
              {shippingData.city}, {shippingData.zip}
            </span>
            <span>{shippingData.country}</span>
          </address>
        </div>
      )}

      <div className="confirmationBlock">
        <h2 className="confirmationBlockTitle">{t("confirmation.items")}</h2>
        <ul className="confirmationItemList" aria-label={t("confirmation.items")}>
          {items.map((line) => (
            <li key={line.productId} className="confirmationItem">
              <span className="confirmationItemLabel">
                {line.label} × {line.quantity}
              </span>
              <span className="confirmationItemPrice">
                {formatPriceUsd(line.priceUsd * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="confirmationTotal">
          <span>{t("confirmation.total")}</span>
          <span className="confirmationTotalAmount">{formatPriceUsd(subtotalUsd)}</span>
        </div>
      </div>

      <button type="button" className="checkoutBtn" onClick={handleContinue}>
        {t("confirmation.continueShopping")}
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Create confirmation.css**

Create `src/pages/checkout/confirmation.css`:

```css
.confirmationSection {
  max-width: 560px;
}

.confirmationTitle {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  margin: 0 0 36px;
}

.confirmationOrderBox {
  padding: 20px;
  background: var(--soft);
  border-radius: var(--radius);
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.confirmationOrderLabel {
  font-size: 0.8125rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.confirmationOrderRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.confirmationOrderNumber {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.confirmationCopyBtn {
  background: none;
  border: 1.5px solid var(--line);
  border-radius: 8px;
  padding: 6px 12px;
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
  color: var(--muted);
  transition: border-color 0.15s, color 0.15s;
  white-space: nowrap;
}

.confirmationCopyBtn:hover {
  border-color: var(--text);
  color: var(--text);
}

.confirmationBlock {
  margin-bottom: 32px;
}

.confirmationBlockTitle {
  font-size: 0.8125rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 12px;
  font-weight: 600;
}

.confirmationAddress {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-style: normal;
  font-size: 0.9375rem;
}

.confirmationItemList {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.confirmationItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: 10px;
  border-bottom: 1px solid var(--line);
  font-size: 0.9375rem;
}

.confirmationItemPrice {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.confirmationTotal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  font-weight: 600;
}

.confirmationTotalAmount {
  font-size: 1.125rem;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/checkout/confirmation.jsx src/pages/checkout/confirmation.css
git commit -m "feat: add ConfirmationStep with order summary and copy order number"
```

---

### Task 10: Wire checkout routes

**Files:**
- Modify: `src/app/appRouter.jsx`

- [ ] **Step 1: Replace appRouter.jsx**

Replace the full contents of `src/app/appRouter.jsx` with:

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./rootLayout";
import Home from "../pages/home/home";
import Category from "../pages/category/category";
import Product from "../pages/product/product";
import Cart from "../pages/cart/cart";
import Stories from "../pages/stories/stories";
import NotFound from "../pages/notFound";
import CheckoutLayout from "../components/checkout/checkoutLayout";
import CheckoutGuard from "../components/checkout/checkoutGuard";
import CartReview from "../pages/checkout/cartReview";
import Shipping from "../pages/checkout/shipping";
import Payment from "../pages/checkout/payment";
import Confirmation from "../pages/checkout/confirmation";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/category/exclusive"
          element={<Navigate to="/category/legacy" replace />}
        />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/stories" element={<Stories />} />
        <Route element={<CheckoutLayout />}>
          <Route
            path="/checkout/cart"
            element={
              <CheckoutGuard step="cart">
                <CartReview />
              </CheckoutGuard>
            }
          />
          <Route
            path="/checkout/shipping"
            element={
              <CheckoutGuard step="shipping">
                <Shipping />
              </CheckoutGuard>
            }
          />
          <Route
            path="/checkout/payment"
            element={
              <CheckoutGuard step="payment">
                <Payment />
              </CheckoutGuard>
            }
          />
          <Route
            path="/checkout/confirmation"
            element={
              <CheckoutGuard step="confirmation">
                <Confirmation />
              </CheckoutGuard>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
```

- [ ] **Step 2: Smoke test the full flow**

Run: `npm start`

Walk through this checklist in the browser:
1. Navigate to `/checkout/cart` with no items in cart → redirects to `/`
2. Add a product to cart, navigate to `/checkout/cart` → shows cart review, progress bar shows "Cart" active
3. Click "Proceed to Shipping" → `/checkout/shipping`, progress shows "Shipping" active with "Cart" checked
4. Navigate directly to `/checkout/payment` → redirects to `/checkout/shipping`
5. Fill all required shipping fields and submit → navigates to `/checkout/payment`, progress shows "Payment" active
6. Navigate directly to `/checkout/confirmation` → redirects to `/checkout/payment`
7. Fill card form (any 16-digit number, MM/YY, 3-digit CVV) and click "Pay Now" → navigates to `/checkout/confirmation`
8. Confirmation page shows order number, items, shipping address; progress bar shows "Confirmation" active
9. Click "Continue Shopping" → redirects to `/`, cart is now empty
10. Attempt to go back to `/checkout/confirmation` → redirects to `/checkout/payment`

Stop the dev server when done.

- [ ] **Step 3: Commit**

```bash
git add src/app/appRouter.jsx
git commit -m "feat: wire checkout routes with CheckoutLayout and CheckoutGuard"
```

---

### Task 11: Update Cart page

**Files:**
- Modify: `src/pages/cart/cart.jsx`
- Modify: `src/pages/cart/cart.css`
- Modify: `src/locales/en/cart.json`
- Modify: `src/locales/fr/cart.json`
- Modify: `src/locales/pt-BR/cart.json`

- [ ] **Step 1: Update cart translation files**

Replace `src/locales/en/cart.json`:

```json
{
  "title": "Cart",
  "lineCount_one": "{{count}} item",
  "lineCount_other": "{{count}} items",
  "empty": "Your bag is empty.",
  "continueShopping": "Continue shopping",
  "listAria": "Shopping items",
  "each": "each",
  "quantity": "Qty",
  "quantityFor": "Quantity for {{name}}",
  "remove": "Remove",
  "subtotal": "Subtotal",
  "checkoutNote": "Shipping and taxes calculated at checkout.",
  "checkout": "Proceed to Checkout"
}
```

Replace `src/locales/fr/cart.json`:

```json
{
  "title": "Panier",
  "lineCount_one": "{{count}} article",
  "lineCount_other": "{{count}} articles",
  "empty": "Votre panier est vide.",
  "continueShopping": "Continuer les achats",
  "listAria": "Articles du panier",
  "each": "l'unité",
  "quantity": "Qté",
  "quantityFor": "Quantité — {{name}}",
  "remove": "Retirer",
  "subtotal": "Sous-total",
  "checkoutNote": "Frais de livraison et taxes calculés à la commande.",
  "checkout": "Passer la commande"
}
```

Replace `src/locales/pt-BR/cart.json`:

```json
{
  "title": "Sacola",
  "lineCount_one": "{{count}} item",
  "lineCount_other": "{{count}} itens",
  "empty": "Sua sacola está vazia.",
  "continueShopping": "Continuar comprando",
  "listAria": "Itens da sacola",
  "each": "cada",
  "quantity": "Qtd",
  "quantityFor": "Quantidade — {{name}}",
  "remove": "Remover",
  "subtotal": "Subtotal",
  "checkoutNote": "Frete e impostos calculados no checkout.",
  "checkout": "Finalizar compra"
}
```

- [ ] **Step 2: Add checkout button to cart.jsx**

In `src/pages/cart/cart.jsx`, find and replace this exact block inside the non-empty cart branch:

Old:
```jsx
          <footer className="cartSummary">
            <div className="cartSummaryRow">
              <span>{t("subtotal")}</span>
              <span className="cartSummaryAmount">
                {formatPriceUsd(subtotalUsd)}
              </span>
            </div>
            <p className="cartSummaryNote">{t("checkoutNote")}</p>
            <Link className="cartContinueLink" to="/category/type-2">
              {t("continueShopping")}
            </Link>
          </footer>
```

New:
```jsx
          <footer className="cartSummary">
            <div className="cartSummaryRow">
              <span>{t("subtotal")}</span>
              <span className="cartSummaryAmount">
                {formatPriceUsd(subtotalUsd)}
              </span>
            </div>
            <p className="cartSummaryNote">{t("checkoutNote")}</p>
            <Link className="cartCheckoutBtn" to="/checkout/cart">
              {t("checkout")}
            </Link>
            <Link className="cartContinueLink" to="/category/type-2">
              {t("continueShopping")}
            </Link>
          </footer>
```

- [ ] **Step 3: Add cartCheckoutBtn to cart.css**

Append to the end of `src/pages/cart/cart.css`:

```css
.cartCheckoutBtn {
  display: block;
  padding: 14px 24px;
  background: var(--text);
  color: var(--bg);
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
  text-decoration: none;
  transition: opacity 0.15s;
}

.cartCheckoutBtn:hover {
  opacity: 0.85;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/cart/cart.jsx src/pages/cart/cart.css src/locales/en/cart.json src/locales/fr/cart.json src/locales/pt-BR/cart.json
git commit -m "feat: add Proceed to Checkout button to cart page"
```
