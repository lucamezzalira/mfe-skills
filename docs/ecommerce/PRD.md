# PRD: ThreadTales ecommerce (reference)

## Goal

Create a reference ecommerce frontend that demonstrates micro-frontend boundaries and governance.

## Personas

- Guest shopper
- Signed-in shopper

## Key journeys

- Browse home and jump into catalogue
- Search and filter catalogue
- View item detail
- View my account
- Update user details
- Manage payment methods

## Functional requirements

- Home shows featured items and navigation into catalogue
- Catalogue supports list, filters, and item page
- My Account acts as the entry point for account area
- User Details allows view and edit of profile details
- Payment Methods allows view/add/remove saved methods
- Shell provides platform chrome (alerts, modals) and failure isolation

## Non-functional requirements

- Each MFE can deploy independently
- Shell owns first path segment only
- No cross-MFE imports
- No shared global stores across boundaries
- Runtime remote discovery
- Error boundary and fallback per remote mount

## Out of scope

- Real payments processing
- Full auth implementation
- Production infra
