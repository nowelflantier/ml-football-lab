import type { ReactNode } from 'react'

export function LabShell({ visual, children }: { visual: ReactNode; children: ReactNode }) {
  return (
    <div className="lab-shell">
      <section className="visual-panel">{visual}</section>
      <section className="lesson-panel">{children}</section>
    </div>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>
}

export function ContinueButton({ onClick, children = 'Continuer', disabled = false }: { onClick: () => void; children?: ReactNode; disabled?: boolean }) {
  return <button className="primary-button" onClick={onClick} disabled={disabled}>{children}</button>
}
