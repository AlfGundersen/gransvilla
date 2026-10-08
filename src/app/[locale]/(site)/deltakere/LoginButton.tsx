'use client'

import { useFormStatus } from 'react-dom'

export function LoginButton({ className }: { className?: string }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? 'Logger inn …' : 'Logg inn'}
    </button>
  )
}
