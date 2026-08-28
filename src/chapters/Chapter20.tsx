import { useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { ModelWorkbenchControls } from '../components/ModelWorkbench'
import { realShots } from '../data/realShots'
import { modelLabel, predictConfigured, trainConfiguredModel, type ModelConfig } from '../ml/modelLab'
import type { Shot } from '../types'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type SortMode = 'over' | 'under' | 'disagree'
type RecordRow = { key: string; matchId: number; team: string; shots: number; goals: number; modelXg: number; statsbombXg: number; matchShots: Shot[]; probabilities: number[] }
type Run = { config: ModelConfig; rows: RecordRow[] }
const initialConfig: ModelConfig = { family: 'logistic', features: ['distance', 'angle', 'is_header', 'is_penalty'], k: 11, depth: 3 }
const matchIds = Array.from(new Set(realShots.map((shot) => shot.match_id).filter((id): id is number => typeof id === 'number')))

function buildRows(config: ModelConfig): RecordRow[] {
  return matchIds.flatMap((matchId) => {
    const train = realShots.filter((shot) => shot.match_id !== matchId)
    const matchShots = realShots.filter((shot) => shot.match_id === matchId)
    const model = trainConfiguredModel(train, config)
    const probabilities = predictConfigured(model, matchShots, config.features)
    const teams = Array.from(new Set(matchShots.map((shot) => shot.provenance?.team ?? 'Équipe inconnue')))
    return teams.map((team) => {
      const indexes = matchShots.map((shot, index) => ({ shot, index })).filter((item) => (item.shot.provenance?.team ?? 'Équipe inconnue') === team)
      const teamShots = indexes.map((item) => item.shot)
      const teamProbabilities = indexes.map((item) => probabilities[item.index])
      return {
        key: `${matchId}-${team}`,
        matchId,
        team,
        shots: indexes.length,
        goals: teamShots.filter((shot) => shot.goal).length,
        modelXg: teamProbabilities.reduce((sum, value) => sum + value, 0),
        statsbombXg: teamShots.reduce((sum, shot) => sum + (shot.statsbomb_xg_reference ?? 0), 0),
        matchShots: teamShots,
        probabilities: teamProbabilities,
      }
    })
  })
}

export function Chapter20({ step, setStep, onComplete }: Props) {
  const [config, setConfig] = useState<ModelConfig>(initialConfig)
  const [runs, setRuns] = useState<Run[]>([])
  const [sortMode, setSortMode] = useState<SortMode>('over')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [inspected, setInspected] = useState<string[]>([])
  const latest = runs.at(-1)

  const execute = () => {
    setRuns((current) => [...current.slice(-2), { config: { ...config, features: [...config.features] }, rows: buildRows(config) }])
    setSelectedKey(null)
    setInspected([])
  }

  const sorted = latest ? [...latest.rows].sort((a, b) => {
    if (sortMode === 'over') return (b.goals - b.modelXg) - (a.goals - a.modelXg)
    if (sortMode === 'under') return (a.goals - a.modelXg) - (b.goals - b.modelXg)
    return Math.abs(b.modelXg - b.statsbombXg) - Math.abs(a.modelXg - a.statsbombXg)
  }) : []
  const selected = latest?.rows.find((row) => row.key === selectedKey) ?? sorted[0]
  const inspect = (key: string) => { setSelectedKey(key); setInspected((current) => current.includes(key) ? current : [...current, key]) }

  if (step === 0) return (
    <LabShell visual={<div className="dashboard-intro"><span>10 matchs</span><strong>20 lignes équipe-match</strong><b>→</b><span>Questions</span><strong>où regarder&nbsp;?</strong></div>}>
      <Eyebrow>Chapitre 20 · Football Analyst Mode</Eyebrow>
      <h1>On utilise maintenant le modèle pour faire émerger des matchs intéressants.</h1>
      <p className="lead">Chaque match est prédit par un modèle entraîné sur les neuf autres. Ensuite on trie les équipes selon un angle : beaucoup plus de buts que de xG, beaucoup moins, ou fort désaccord avec StatsBomb.</p>
      <ContinueButton onClick={() => setStep(1)}>Construire le dashboard</ContinueButton>
    </LabShell>
  )

  if (step === 1) return (
    <LabShell visual={latest ? <DashboardHeadline row={sorted[0]} mode={sortMode} config={latest.config} /> : <div className="empty-lab-visual"><strong>Dashboard vide</strong><span>Le modèle par défaut suffit pour commencer.</span></div>}>
      <Eyebrow>Chapitre 20 · Tableau analyste</Eyebrow>
      <h1>Calcule, choisis un angle de tri, puis ouvre une ligne.</h1>
      <button className="primary-lab-button" onClick={execute}>▶ Calculer les 10 matchs</button>
      <details className="advanced-options">
        <summary>Changer le modèle — optionnel</summary>
        <ModelWorkbenchControls config={config} onChange={setConfig} />
      </details>
      {latest && <>
        <div className="segmented-control dashboard-sorts"><button className={sortMode === 'over' ? 'selected' : ''} onClick={() => setSortMode('over')}>Plus de buts que xG</button><button className={sortMode === 'under' ? 'selected' : ''} onClick={() => setSortMode('under')}>Moins de buts que xG</button><button className={sortMode === 'disagree' ? 'selected' : ''} onClick={() => setSortMode('disagree')}>Désaccord avec StatsBomb</button></div>
        <div className="plain-explanation"><strong>Ce que fait le tri</strong><span>Il ne prouve rien tout seul. Il sert juste à faire remonter les lignes qui méritent peut-être d’être inspectées.</span></div>
        <div className="analyst-dashboard">
          <div className="dashboard-table">{sorted.map((row) => <button key={row.key} className={selected?.key === row.key ? 'selected' : ''} onClick={() => inspect(row.key)}><span>{row.team}</span><small>match #{row.matchId} · {row.shots} tirs</small><b>{row.goals} buts</b><em>{row.modelXg.toFixed(2)} xG modèle</em><i>{row.statsbombXg.toFixed(2)} SB</i></button>)}</div>
          {selected && <div className="dashboard-detail"><span>{selected.team} · match #{selected.matchId}</span><div className="dashboard-detail-metrics"><p><b>{selected.goals}</b><small>buts</small></p><p><b>{selected.modelXg.toFixed(2)}</b><small>notre xG</small></p><p><b>{selected.statsbombXg.toFixed(2)}</b><small>StatsBomb</small></p></div><div className="dashboard-shot-mini">{selected.matchShots.map((shot, index) => <p key={shot.id}><span>{shot.provenance?.player ?? 'Joueur'}</span><b>{selected.probabilities[index].toFixed(2)}</b><small>{shot.goal ? '⚽' : ''} SB {(shot.statsbomb_xg_reference ?? 0).toFixed(2)}</small></p>)}</div></div>}
        </div>
        <div className="optional-challenge"><strong>Exploration optionnelle</strong><span>{inspected.length ? `Tu as ouvert ${inspected.length} ligne(s).` : 'Clique sur une équipe si tu veux revenir aux tirs qui expliquent son total.'} Tu peux aussi changer le tri ou recalculer avec un autre modèle.</span></div>
        <ContinueButton onClick={() => setStep(2)}>J’ai compris comment utiliser ce dashboard</ContinueButton>
      </>}
    </LabShell>
  )

  return (
    <LabShell visual={latest && sorted[0] ? <DashboardHeadline row={sorted[0]} mode={sortMode} config={latest.config} /> : undefined}>
      <Eyebrow>Cycle 4 terminé · Analyst Mode</Eyebrow>
      <h1>Le modèle devient un instrument pour chercher où regarder.</h1>
      <p className="lead">Tu peux produire des xG hors entraînement, agréger les tirs par équipe, trier les écarts puis revenir aux observations individuelles pour comprendre ce que le tableau résume.</p>
      <div className="reveal-card"><span>À partir d’ici</span><strong>Les prochaines étapes devraient partir d’une question football réelle, pas d’un nouveau chapitre obligatoire.</strong></div>
      <ContinueButton onClick={onComplete}>Terminer</ContinueButton>
    </LabShell>
  )
}

function DashboardHeadline({ row, mode, config }: { row: RecordRow; mode: SortMode; config: ModelConfig }) {
  const value = mode === 'disagree' ? Math.abs(row.modelXg - row.statsbombXg) : row.goals - row.modelXg
  return <div className="dashboard-headline"><span>{modelLabel(config)} · {mode === 'over' ? 'plus de buts que xG' : mode === 'under' ? 'moins de buts que xG' : 'désaccord xG'}</span><strong>{row.team}</strong><small>match #{row.matchId}</small><div><b>{row.goals} buts</b><b>{row.modelXg.toFixed(2)} xG</b><b>{value >= 0 ? '+' : ''}{value.toFixed(2)} écart</b></div></div>
}
