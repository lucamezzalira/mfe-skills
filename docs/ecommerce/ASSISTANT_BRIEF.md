# Code assistant brief: build ThreadTales ecommerce

Use this folder as the starting point for an assistant to scaffold the system.

## Target MFEs

- Home (/)
- Catalog (/catalog/* including item page)
- My Account (/account/*)
  - User Details (/account/details)
  - Payment Methods (/account/payment-methods)

## Governance constraints

- Shell loads first URL segment only. MFEs own deeper routes.
- Mount contract identifiers only. Prefer userId + platformBus.
- Shell handles platform events only (shell:alert, shell:modal:*).
- No cross-MFE imports.
- No shared global store.
- Runtime manifest for remote URLs.
- Shell wraps each remote mount with ErrorBoundary and fallback.

## Deliverables

- A runnable dev setup with one shell and the MFEs above
- Each MFE has its own README with run instructions
- Each MFE has an MFE canvas in docs/ecommerce/canvas
