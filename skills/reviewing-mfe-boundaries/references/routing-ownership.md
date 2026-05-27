# URL routing ownership — shell vs micro-frontend

**Version**: 1.1 | **Skill**: reviewing-mfe-boundaries | **Source**: *Building Micro-Frontends* (O'Reilly)

## Principle

Split routing responsibility by **URL depth**, not by who implements the router API:

| URL depth | Owner | Example |
|-----------|--------|---------|
| **First segment** (top-level path) | **Shell** | `/`, `/catalog`, `/checkout` |
| **Second segment onward** | **Micro-frontend** | `/catalog/product/sku-123`, `/checkout/shipping` |

The shell answers only: *which MFE loads for this top-level area?*  
The MFE answers: *what happens inside that area?*

**Navigation style is flexible.** Use `<a href>`, React Router `<Link>`, `navigate()`, Angular `Router`, or full page loads — as long as changing the **first segment** loads the correct remote and deeper segments stay inside the owning MFE.

---

## Shell: dynamic first-level routes (main goal)

The shell should load **only** first-level URLs from a **runtime manifest** (`routes.json` or equivalent) plus remote URLs (`remotes.json`). That way:

- **Adding or removing an MFE** updates configuration — not shell application code
- **No shell redeploy** is required when an existing MFE adds internal pages (`/catalog/product/:id`, `/catalog/sale`) — those routes are owned and deployed by the MFE team

```json
[
  { "path": "/", "scope": "home_mfe", "module": "./HomeApp", "navLabel": "Home" },
  { "path": "/catalog/*", "scope": "catalog_mfe", "module": "./CatalogApp", "navLabel": "Catalog" }
]
```

The shell maps each entry to one remote mount (wildcard `/*` hands all deeper paths to that MFE). Nav labels can also come from the manifest.

**Do not** in the shell:

- Register domain sub-routes (`/catalog/product/:id`, `/checkout/shipping`)
- Hard-code per-MFE routes in `App.tsx` when a manifest could list them instead

---

## Micro-frontend: hardcoded internal routes (expected)

Inside an MFE, routes are usually **hardcoded in code** — that is normal and preferred. The catalog team ships new pages without touching the shell because the shell only mounts `/catalog/*`.

```tsx
// Catalog MFE — routes defined in code; shell never sees these paths
<BrowserRouter basename="/catalog">
  <Routes>
    <Route path="/" element={<ProductList />} />
    <Route path="/product/:productId" element={<ProductDetail />} />
  </Routes>
</BrowserRouter>
```

Use `basename`, `activeWhen` prefix, or Angular child routes so internal paths align with the shell's first segment.

---

## Shell platform events vs domain events

The shell **may** expose an event bus (or similar) for **platform / chrome** concerns shared across MFEs:

| Allowed in shell (platform) | Not allowed in shell (domain) |
|-----------------------------|-------------------------------|
| `shell:alert`, `shell:toast` | `catalog:productSelected` |
| `shell:modal:open`, `shell:modal:close` | `checkout:paymentFailed` |
| `shell:loading`, `shell:analytics` (if generic) | `cart:itemAdded` |
| Focus trap, global error banner, consent banner | Any handler that applies business rules |

MFEs emit platform events when they need shell-owned UI. The shell subscribes only to **platform-scoped** event names (e.g. `shell:*` or `ui:*`).

```javascript
// ✓ Catalog MFE — ask shell to show chrome
platformBus.emit('shell:alert', { message: 'Item saved', variant: 'success' })
platformBus.emit('shell:modal:open', { id: 'confirm-delete', title: 'Remove item?' })

// ✗ Shell — domain listener
platformBus.on('catalog:productSelected', (payload) => { ... })

// ✗ Shell — domain logic triggered from MFE event
platformBus.on('checkout:completed', ({ orderId }) => redirectToThankYou(orderId))
```

**Cross-MFE navigation** between top-level areas: prefer **URL** (change first segment). Do not require a dedicated `navigation:go` platform event unless the product already standardises on it — URL depth ownership is the rule that matters.

**Horizontal split (same page):** MFEs may use an event bus for **peer** domain coordination; the shell still must not grow domain handlers. Prefer platform events to shell and domain events MFE-to-MFE only.

---

## Vertical vs horizontal split

| Split | Routing | Events |
|-------|---------|--------|
| **Vertical** | Shell first segment; MFE sub-routes | URL + storage for cross-area; platform events to shell |
| **Horizontal** | Shell may own page URL; siblings don't own each other's sub-routes | Platform events to shell; domain events between peers, not shell |

---

## Violation signals

- Shell route table or `App.tsx` includes paths below the first segment
- Shell subscribes to `catalog:*`, `checkout:*`, `order:*`, or other business namespaces
- New MFE requires shell code changes instead of manifest + `remotes.json` only
- MFE adds `/catalog/new-page` but team believes shell must redeploy (misunderstanding — only manifest matters at shell level)
- Shell passes route-derived domain state as props (`productId`, `cart`) instead of MFE reading its own URL

---

## Adding or removing a micro-frontend

1. Deploy (or undeploy) the remote; update `remotes.json`
2. Add or remove one **first-level** entry in `routes.json`
3. Optionally add nav metadata in the same manifest
4. Do **not** add shell domain routes, domain event listeners, or per-MFE logic in shell source

Internal MFE route changes are **MFE-only** deploys.
