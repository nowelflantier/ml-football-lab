type Props = {
  probabilityForDistance: (distance: number) => number
}

export function ProbabilityCurve({ probabilityForDistance }: Props) {
  const points = Array.from({ length: 43 }, (_, index) => 5 + index * 0.5)
    .map((distance) => {
      const probability = probabilityForDistance(distance)
      const x = 8 + ((distance - 5) / 21) * 84
      const y = 88 - probability * 72
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg className="curve" viewBox="0 0 100 100" aria-label="Probabilité de but apprise selon la distance">
      <line x1="8" y1="88" x2="94" y2="88" className="curve-axis" />
      <line x1="8" y1="12" x2="8" y2="88" className="curve-axis" />
      <line x1="8" y1="52" x2="94" y2="52" className="curve-guide" />
      <polyline points={points} className="curve-line" />
      <text x="8" y="97" className="curve-label">5 m</text>
      <text x="84" y="97" className="curve-label">26 m</text>
      <text x="2" y="16" className="curve-label">100%</text>
      <text x="3" y="55" className="curve-label">50%</text>
      <text x="4" y="90" className="curve-label">0%</text>
    </svg>
  )
}
