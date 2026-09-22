import React, { Suspense, lazy } from 'react'

const Checkout = lazy(() => import('checkout/App'))

export function App() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <Checkout userId="u1" cartId="c1" />
    </Suspense>
  )
}
