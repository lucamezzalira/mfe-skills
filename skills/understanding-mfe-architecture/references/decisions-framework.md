# Micro-frontends decisions framework

**Version**: 1.2 | **Skill**: understanding-mfe-architecture | **Source**: *Building Micro-Frontends* (O'Reilly)

The decisions framework is composed of four areas that must be resolved upfront because each one constrains the next:

1. **Define** — horizontal or vertical split?
2. **Compose** — client-side or server-side?
3. **Route** — client-side or server-side?
4. **Communicate** — event emitter, custom events, web storage, query strings?

These decisions are not independent — composition constrains routing, and split strategy constrains communication. The table at the end of this file shows the valid combinations.

---

## Decision 1 — Define: horizontal or vertical split?

**Vertical split**: one micro-frontend per view or group of views. Each team owns a complete business domain end-to-end — authentication, catalog, checkout. The micro-frontend owns all the routes under its domain.

- Closer to a traditional SPA or server-side rendering approach
- Each team has full autonomy — fewer cross-team coordination points
- Better fit for teams new to micro-frontends
- Recommended as the starting point for most organisations

**Horizontal split**: multiple micro-frontends composing the same view. Multiple teams share responsibility for parts of the same page.

- Requires more discipline and governance — without it, proliferation of micro-frontends creates a distributed monolith
- Higher granularity → higher coupling → context leakage risk
- Requires upfront investment in a solid development experience (local composition, testing across teams)
- Better fit for teams experienced with micro-frontends and with strong automation

**Both are valid and not mutually exclusive**. Some parts of an application may suit a vertical split, others a horizontal split. Start with vertical where possible and introduce horizontal where domain ownership genuinely requires it.

**The granularity warning**: resist the instinct to split finely. A large number of micro-frontends composing a single view is a warning sign — each additional micro-frontend increases the coordination surface in the container and risks pushing domain logic into the shell.

---

## Decision 2 — Compose: how does the shell assemble micro-frontends?

### Client-side composition

The application shell loads micro-frontends directly from a CDN at runtime, using a JavaScript or HTML entry point. The shell dynamically appends DOM nodes or initialises the JavaScript application.

**Works for**: both vertical and horizontal splits.

**Best fit**: highly interactive platforms where teams need maximum deployment independence and runtime flexibility — enterprise apps, desktop-like web platforms, video-on-demand. Teams should have strong frontend skills and be comfortable with distributed system complexity.

**Tools**: Module Federation, Single SPA, Native Federation, iframes.

**Trade-offs**:
- (+) Full team independence — remotes ship and the shell picks them up at next load
- (+) Lazy loading — micro-frontends only load when the user navigates to them
- (-) Runtime composition errors are possible (network failures, version mismatches)
- (-) More complex local development setup

### Server-side composition

The origin server assembles the page by retrieving micro-frontend fragments and stitching them together before sending HTML to the client.

**Works for**: primarily horizontal split.

**Best fit**: content-heavy, SEO-critical sites where first-paint performance and search indexability matter most — e-commerce, publishing, news. Requires careful scalability planning for burst traffic; personalised pages cannot rely heavily on CDN caching.

**Trade-offs**:
- (+) Full server-side rendering — content visible before JavaScript loads
- (+) Better SEO and performance for content pages
- (-) Scalability must be planned carefully — runtime server-side composition under burst traffic is non-trivial
- (-) Personalised pages cannot rely heavily on CDN caching

---

## Decision 3 — Route: how does the application direct users between views?

Routing is directly constrained by the composition choice.

**Client-side routing**: the application shell owns global routing logic — it retrieves the routing configuration and decides which micro-frontend to load. Each micro-frontend may have its own internal routing for sub-pages within its domain.

- Used with client-side composition (vertical split)
- Supports complex routing logic: authentication state, geo-localisation, feature flags
- The shell loads one micro-frontend at a time for vertical split; a container page manages multiple micro-frontends for horizontal split

### URL depth ownership (vertical split)

When using client-side composition with a vertical split, split routing by URL depth:

| Depth | Owner | Examples |
|-------|--------|----------|
| First path segment | Shell | `/`, `/catalog`, `/checkout` |
| Second segment onward | Micro-frontend | `/catalog/product/sku-1`, `/checkout/shipping` |

The shell answers: *which MFE is active for this top-level area?*  
The MFE answers: *what screen inside that area?*

**Implications:**

- Shell loads **first-level** paths from a **dynamic manifest** (`routes.json`) so adding/removing an MFE does not require shell application code changes
- MFE teams **hardcode** internal routes in their own app; new pages under `/catalog/...` deploy with the MFE only — the shell does not redeploy
- Domain sub-routes (`/catalog/product/:id`) live in the catalog MFE's router (`basename`, child routes, etc.)
- Navigating between areas changes the first URL segment; how you navigate (`Link`, `href`, `Router`) is a team choice
- Shell may expose a **platform** event bus (modals, alerts); shell must not subscribe to **domain** events (`catalog:*`, `checkout:*`)

For code-level patterns and violation signals, load the **reviewing-mfe-boundaries** skill (routing-ownership reference).

**Server-side routing**: the web server returns different static assets based on the requested path. Query strings can pass minimal data between views.

- Used with server-side composition
- Standard approach; straightforward to implement
- Works with both vertical and horizontal splits

### SSR ownership model

For SSR-first architectures, boundary ownership is still domain and URL based:

- Entry routing is usually handled by CDN + API gateway / reverse proxy layers
- Each team owns one or more route slices and the runtime for those slices
- Team ownership includes compute and, when needed, in-memory cache strategy

The infrastructure can be shared at the platform level, but route/domain ownership remains with the team that owns the micro-frontend capability.

### Browser composition inside SSR (RSC / Islands)

SSR does not remove browser-side composition concerns. Frameworks like React Server Components or Astro Islands may append fragments in the browser after initial render, but boundary quality still depends on granularity:

- Keep coarse-grained domain boundaries
- Split by domain, route, or user journey step
- Avoid fine-grained fragmentation that recreates container coordination complexity

---

## Decision 4 — Communicate: how do micro-frontends exchange data?

Communication strategy depends on the split approach.

### Same-page communication (horizontal split)

Micro-frontends on the same page must communicate without knowing about each other. Options in order of preference:

**Event emitter** (recommended first choice): the shell or container instantiates an event bus and injects it into each micro-frontend. A micro-frontend emits events; other micro-frontends subscribed to that event type react. Neither knows the other exists. Works reliably with iframes because it avoids the ambiguity of which window object to use.

**Custom events**: dispatched via the `window` object. Simpler to set up but less reliable than an event emitter — a custom event can be accidentally stopped mid-DOM-tree by any element in the propagation path, which is difficult to debug.

**Never use**: a global state manager (Redux, Zustand, MobX) shared across micro-frontend boundaries. This is an anti-pattern in distributed systems — it recreates the coupling of a monolith at the state layer.

### Cross-view communication (vertical split)

When the user navigates from one micro-frontend's domain to another, data must cross the boundary:

**Web storage** (session storage, local storage, cookies): for persistent data such as authentication tokens. The authentication micro-frontend stores the token; the catalog micro-frontend retrieves it independently. Both micro-frontends must share the same subdomain.

**Query strings / URL parameters**: for ephemeral data such as a selected product ID. The receiving micro-frontend reads the ID from the URL and fetches full details from its own API. Do not use query strings for sensitive data (passwords, user IDs).

**The principle**: pass the minimum reference needed (an ID, a token), not the full domain object. The receiving micro-frontend is responsible for fetching its own data.

---

## Operational guardrails (cross-cutting)

These are design governance constraints that apply across the four decisions:

- **Feature flags**: keep behavioural flags inside the owning MFE. Do not use shell/runtime flag orchestration to swap MFEs at fine granularity unless it is an explicit platform rollout mechanism.
- **Edge compute**: use when it adds measurable value (traffic steering, canary, strangler routing). Edge rendering alone is not automatically beneficial if data/API latency remains in-region.
- **Fitness functions**: in monorepos, encode boundary checks as architecture tests (for example `ts-arch` + `jest`) to prevent cross-MFE imports and enforce explicit shared allowlists.

---

## Decisions framework summary

| Split | Composition | Routing | Communication |
|---|---|---|---|
| Horizontal | Client-side | Client-side, Server-side | Event emitter, Custom events |
| Horizontal | Server-side | Server-side | Event emitter, Custom events |
| Vertical | Client-side | Client-side | Web storage, Query strings, Cookies |
| Vertical | Server-side | Server-side | Web storage, Query strings, Cookies |
