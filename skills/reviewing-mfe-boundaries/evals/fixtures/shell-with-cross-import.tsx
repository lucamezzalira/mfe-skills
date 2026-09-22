import React from 'react'
import { useAuthStore } from '@org/auth-mfe/store'

export function ShellCheckout({ userId }: { userId: string }) {
  const user = useAuthStore()
  return <CheckoutMfe user={user} cart={user.cart} theme="dark" locale="en" currency="GBP" onDone={() => {}} />
}
