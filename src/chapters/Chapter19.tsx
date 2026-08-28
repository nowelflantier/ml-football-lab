import { useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { ModelWorkbenchControls } from '../components/ModelWorkbench'
import { realShots } from '../data/realShots'
import { modelLabel, predictConfigured, trainConfiguredModel, type ModelConfig } from '../ml/modelLab'
import type { Shot } from '../types'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type TeamSummary = { team: string; shots: number; goals: number; modelXg: number; statsbombXg: number }
type Run = { matchId: number; config: ModelConfig; predictions: number[]; matchShots: Shot[]; teams: TeamSummary[] }
const initialConfig: ModelConfig = { family: 'logistic', features: ['distance', 'angle', 'is_header', 'is_penalty'], k: 9, depth: 3 }

const matchOptions = Array.from(new Set(realShots.map((shot) => shot.match_id).filter((id): id is number => typeof id === 'number'))).map((matchId) => {
  const shots = realShots.filter((shot) => shot.match_id === matchId)
  const teams = Array.from(new Set(shots.map((shot) => shot.provenance?.team).filter((team): team is string => Boolean(team))))
  return { matchId, label: teams.join(' vs ') || `Match ${matchId}`, shotCount: shots.length }
})

export function Chapter19({ step, setStep, onComplete }: Props) {
  const [matchId, setMatchId] = useState(matchOptions[0].matchId)
  const [config, setConfig] = useState<ModelConfig>(initialConfig)
  const [runs, setRuns] = useState<Run[]>([])
  const [selectedShot, setSelectedShot] = useState<string | null>(null)
  const latest = runs.at(-1)

  const execute = () => {
    const train = realShots.filter((shot) => shot.match_id !== matchId)
    const matchShots = realShots.filter((shot) => shot.match_id === matchId)
    const model = trainConfiguredModel(train, config)
    const predictions = predictConfigured(model, matchShots, config.features)
    const teamNames = Array.from(new Set(matchShots.map((shot) => shot.provenance?.team ?? 'Équipe inconnue')))
    const teams = teamNames.map((team) => {
      const indexes = matchShots.map((shot, index) => ({ shot, index })).filter((item) => (item.shot.provenance?.team ?? 'Équipe inconnue') === team)
      return {
        team,
        shots: indexes.length,
        goals: indexes.filter((item) => item.shot.goal).length,
        modelXg: indexes.reduce((sum, item) => sum + predictions[item.index], 0),
        statsbombXg: indexes.reduce((sum, item) => sum + (item.shot.statsbomb_xg_reference ?? 0), 0),
      }
    })
    setRuns((current) => [...current.slice(-5), { matchId, config: { ...config, features: [...config.features] }, predictions, matchShots, teams }])
  }

  const selected = latest ? latest.matchShots.find((shot) => shot.id === selectedShot) ?? latest.matchShots[0] : null
  const selectedIndex = latest && selected ? latest.matchShots.findIndex((shot) => shot.id === selected.id) : -1

  if (step === 0) return (
    <LabShell visual={<div className="match-xg-intro"><span>tirs individuels</span><strong>0.08 + 0.21 + 0.04 + …</strong><b>→</b><span>xG du match</span><strong>?</strong></div>}>
      <Eyebrow>Chapitre 19 · Build a Match xG</Eyebrow>
      <h1>Ton modèle peut maintenant produire une analyse de match.</h1>
      <p className="lead">Choisis un vrai match. L’app retirera complètement ce match de l’entraînement, apprendra sur les neuf autres, puis produira une probabilité pour chacun de ses tirs.</p>
      <ContinueButton onClick={() => setStep(1)}>Ouvrir le Match Lab</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    const distinctMatches = new Set(runs.map((run) => run.matchId)).size
    return (
      <LabShell visual={latest ? <MatchScoreboard run={latest} /> : <div className="empty-lab-visual"><strong>Aucun match calculé</strong><span>Choisis un match et lance ton modèle.</span></div>}>
        <Eyebrow>Chapitre 19 · Match Lab</Eyebrow>
        <h1>Choisis le match, choisis ton modèle, calcule le xG.</h1>
        <div className="match-picker">{matchOptions.map((match) => <button key={match.matchId} className={matchId === match.matchId ? 'selected' : ''} onClick={() => setMatchId(match.matchId)}><strong>{match.label}</strong><small>{match.shotCount} tirs · #{match.matchId}</small></button>)}</div>
        <ModelWorkbenchControls config={config} onChange={setConfig} />
        <button className="primary-lab-button" onClick={execute}>▶ Entraîner sur les 9 autres matchs + calculer celui-ci</button>
        {latest && <div className="match-analysis-grid">
          <div className="match-shot-list">{latest.matchShots.map((shot, index) => <button key={shot.id} className={selected?.id === shot.id ? 'selected' : ''} onClick={() => setSelectedShot(shot.id)}><span>{shot.provenance?.player ?? 'Joueur'}</span><strong>{Math.round(latest.predictions[index] * 100)}%</strong><small>{shot.goal ? '⚽ but' : shot.provenance?.outcome ?? 'raté'} · SB {Math.round((shot.statsbomb_xg_reference ?? 0) * 100)}%</small></button>)}</div>
          {selected && selectedIndex >= 0 && <div className="match-shot-detail"><span>{selected.provenance?.team ?? 'Équipe'}</span><strong>{selected.provenance?.player ?? 'Joueur'}</strong><div><p><b>{latest.predictions[selectedIndex].toFixed(2)}</b><small>ton xG</small></p><p><b>{(selected.statsbomb_xg_reference ?? 0).toFixed(2)}</b><small>StatsBomb</small></p><p><b>{selected.goal ? '1' : '0'}</b><small>but réel</small></p></div><p>{selected.distance.toFixed(1)}m · {selected.angle.toFixed(0)}° · {selected.body_part ?? '?'} · {selected.shot_type ?? '?'}</p></div>}
        </div>}
        {runs.length > 0 && <div className="workbench-history compact">{runs.map((run, index) => <div key={index}><span>#{index + 1} · {matchOptions.find((item) => item.matchId === run.matchId)?.label}</span><strong>{modelLabel(run.config)}</strong><small>{run.teams.map((team) => `${team.team}: ${team.modelXg.toFixed(2)} xG`).join(' · ')}</small></div>)}</div>}
        <p className="practice-gate">{runs.length < 3 ? `Calcule encore ${3 - runs.length} version(s).` : distinctMatches < 2 ? 'Essaie au moins un deuxième match.' : 'Tu as comparé plusieurs modèles/matchs.'}</p>
        {runs.length >= 3 && distinctMatches >= 2 && <ContinueButton onClick={() => setStep(2)}>Passer de calcul à analyse</ContinueButton>}
      </LabShell>
    )
  }

  return (
    <LabShell visual={latest ? <MatchScoreboard run={latest} /> : undefined}>
      <Eyebrow>Chapitre 19 · Agrégation</Eyebrow>
      <h1>Un xG de match est la somme de décisions tir par tir.</h1>
      <p className="lead">Tu peux maintenant remonter de la probabilité individuelle vers une lecture football : volume de tirs, qualité estimée des occasions, score réel et comparaison avec une autre référence xG.</p>
      <div className="reveal-card"><span>Pratique débloquée</span><strong>Appliquer un modèle à un nouveau match complet, agréger ses prédictions et inspecter les désaccords tir par tir.</strong></div>
      <ContinueButton onClick={onComplete}>Ouvrir le tableau analyste</ContinueButton>
    </LabShell>
  )
}

function MatchScoreboard({ run }: { run: Run }) {
  return <div className="match-scoreboard"><span>{modelLabel(run.config)}</span><strong>Match #{run.matchId}</strong><div>{run.teams.map((team) => <p key={team.team}><small>{team.team}</small><b>{team.goals} buts</b><em>{team.modelXg.toFixed(2)} xG modèle</em><i>{team.statsbombXg.toFixed(2)} xG StatsBomb</i></p>)}</div></div>
}
