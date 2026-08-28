import type { Shot } from '../types'

type Props = {
  shots: Shot[]
  hiddenResults?: boolean
  selectedId?: string
  onSelect?: (shot: Shot) => void
  showLabels?: boolean
  highlightIds?: string[]
}

export function FootballPitch({ shots, hiddenResults = false, selectedId, onSelect, showLabels = false, highlightIds = [] }: Props) {
  const mapX = (x: number) => 6 + ((x - 88) / 32) * 88
  const mapY = (y: number) => 7 + (y / 80) * 86

  return (
    <svg className="pitch" viewBox="0 0 100 100" role="img" aria-label="Demi-terrain avec positions de tirs">
      <rect x="2" y="2" width="96" height="96" rx="2" className="pitch-grass" />
      <line x1="6" y1="5" x2="6" y2="95" className="pitch-line" />
      <line x1="94" y1="5" x2="94" y2="95" className="pitch-line" />
      <line x1="6" y1="5" x2="94" y2="5" className="pitch-line" />
      <line x1="6" y1="95" x2="94" y2="95" className="pitch-line" />
      <rect x="77" y="22" width="17" height="56" className="pitch-line no-fill" />
      <rect x="87" y="37" width="7" height="26" className="pitch-line no-fill" />
      <line x1="94" y1="45" x2="98" y2="45" className="goal-line" />
      <line x1="94" y1="55" x2="98" y2="55" className="goal-line" />
      <line x1="98" y1="45" x2="98" y2="55" className="goal-line" />
      <circle cx="82" cy="50" r="1.1" className="pitch-mark" />
      <path d="M 77 38 A 14 14 0 0 0 77 62" className="pitch-line no-fill" />

      {shots.map((shot) => {
        const x = mapX(shot.x)
        const y = mapY(shot.y)
        const highlighted = highlightIds.includes(shot.id)
        const selected = selectedId === shot.id
        const className = hiddenResults ? 'shot unknown' : shot.goal ? 'shot goal' : 'shot miss'
        return (
          <g
            key={shot.id}
            className={`shot-group ${onSelect ? 'clickable' : ''}`}
            onClick={() => onSelect?.(shot)}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onKeyDown={(event: { key: string }) => {
              if (onSelect && (event.key === 'Enter' || event.key === ' ')) onSelect(shot)
            }}
          >
            {(selected || highlighted) && <circle cx={x} cy={y} r="4.2" className="shot-halo" />}
            <circle cx={x} cy={y} r="2.35" className={className} />
            {showLabels && <text x={x + 2.8} y={y - 2.5} className="shot-label">{shot.id}</text>}
          </g>
        )
      })}
    </svg>
  )
}
