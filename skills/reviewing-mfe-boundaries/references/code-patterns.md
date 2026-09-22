# Code generation patterns by rule

Toolchain-specific examples for applying the boundary rules when generating MFE code. Organised by concern so you can load only what you need. React, Angular / Native Federation, Vue, and Single SPA are covered where they differ.

## Contents

- URL routing — shell first segment only; MFE owns depth below (Rule 7)
- Shell platform events — allowed; domain events in shell — not (Rules 4, 7)
- Shell mounting — always include a fallback in the shell, not inside the micro-frontend (Rule 6)
- Props — pass identifiers, not domain objects (Rule 2)
- Same-page communication (horizontal split) — event emitter between peers, never shared state (Rule 4)
- Shell platform bus — chrome only (Rules 4, 7)
- Cross-area navigation and data — first segment switches MFE; depth stays in MFE (Rules 4, 7)

## URL routing — shell first segment only; MFE owns depth below (Rule 7)

- **Shell**: load **only** first-level paths from a runtime manifest (`routes.json` + `remotes.json`) so adding/removing an MFE does not require shell code changes or redeploy for MFE-internal pages
- **MFE**: hardcoded internal routes are expected (`/product/:id` under `/catalog`); new sub-pages are MFE-only deploys
- **Navigation implementation**: flexible (`<a>`, `<Link>`, `navigate()`, etc.) — enforce URL depth ownership, not a specific router API
- **Cross-area navigation**: change the first URL segment; deeper segments stay inside the owning MFE

```tsx
// ✓ Shell — manifest-driven first segment (wildcard → remote)
// routes.json: { "path": "/catalog/*", "scope": "catalog_mfe", "module": "./CatalogApp" }
routes.map((r) => <Route key={r.scope} path={r.path} element={<RemoteMount ... />} />)

// ✓ Catalog MFE — hardcoded routes under basename (no shell change when adding pages)
<BrowserRouter basename="/catalog">
  <Routes>
    <Route path="/product/:productId" element={<ProductDetail />} />
  </Routes>
</BrowserRouter>

// ✗ Shell — domain sub-route
<Route path="/catalog/product/:productId" element={...} />
```

## Shell platform events — allowed; domain events in shell — not (Rules 4, 7)

- Shell **may** handle platform/chrome events: alerts, toasts, modals, global loading chrome
- Shell **must not** subscribe to domain namespaces (`catalog:*`, `checkout:*`, `cart:*`)
- MFEs emit `shell:alert`, `shell:modal:open`, etc.; horizontal peers may use domain events MFE-to-MFE, not via shell handlers

```javascript
// ✓ MFE → shell chrome
platformBus.emit('shell:alert', { message: 'Saved', variant: 'success' })

// ✗ Shell listens to business events
platformBus.on('catalog:productSelected', handler)
```

Load `references/routing-ownership.md` for full patterns.

## Shell mounting — always include a fallback in the shell, not inside the micro-frontend (Rule 6)

```jsx
{/* React / Module Federation */}
<ErrorBoundary fallback={<CheckoutFallback />}>
  <CheckoutMicrofrontend userId={userId} cartId={cartId} />
</ErrorBoundary>
```

```typescript
// Angular / Native Federation — shell route with fallback on load failure
{
  path: 'checkout',
  loadComponent: () =>
    loadRemoteModule('checkout', './CheckoutComponent')
      .then(m => m.CheckoutComponent)
      .catch(() => CheckoutFallbackComponent)  // fallback defined in shell
}
```

```javascript
// Single SPA — catch mount errors at the shell level
const parcel = mountRootParcel(checkoutConfig, { domElement })
parcel.mountPromise.catch(() => renderCheckoutFallback())
```

## Props — pass identifiers, not domain objects (Rule 2)

```jsx
{/* React — identifiers only */}
<CheckoutMicrofrontend userId={userId} cartId={cartId} />
{/* ✗ Never: user={fullUserObject} cart={fullCartObject} */}
```

```typescript
// Angular — route param carries the identifier; remote reads ActivatedRoute itself
// ✓ { path: 'checkout/:cartId', loadComponent: () => loadRemoteModule(...) }
// ✗ resolve: { cart: CartResolver, user: UserResolver } — container owns context
```

```javascript
// Single SPA — customProps with identifiers only
registerApplication({
  name: 'checkout',
  app: () => import('checkout/main'),
  activeWhen: '/checkout',
  customProps: { userId, cartId }  // ✓ identifiers only
})
```

## Same-page communication (horizontal split) — event emitter between peers, never shared state (Rule 4)

```javascript
// MFE-to-MFE on the same page — domain events OK between peers, not in shell
eventBus.emit('catalog:filterChanged', { category: 'audio' })

// ✗ Never: import { checkoutStore } from '@org/checkout-mfe/store'
```

## Shell platform bus — chrome only (Rules 4, 7)

```javascript
// ✓ MFE requests shell-owned UI
platformBus.emit('shell:modal:open', { id: 'confirm', title: 'Continue?' })

// ✗ Shell must not own domain reactions
platformBus.on('checkout:completed', ({ orderId }) => { ... })
```

## Cross-area navigation and data — first segment switches MFE; depth stays in MFE (Rules 4, 7)

```javascript
// ✓ Any style that changes the first segment — implementation is flexible
navigate('/catalog')
// <Link to="/catalog"> or <a href="/catalog">

// ✓ Deeper path owned by catalog MFE — no shell redeploy when this route is added
navigate(`/catalog/product/${productId}`)

// ✓ Store a token; receiving MFE retrieves it independently
sessionStorage.setItem('auth_token', token)

// ✗ window.history.pushState({ user: fullUserObject }, '', '/catalog')
```

---
