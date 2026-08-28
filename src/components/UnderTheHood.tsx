import type { ReactNode } from 'react'

export function UnderTheHood({ children }: { children: ReactNode }) {
  return (
    <details className="under-hood">
      <summary>Sous le capot</summary>
      <div>{children}</div>
    </details>
  )
}
