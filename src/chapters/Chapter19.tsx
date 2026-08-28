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
      const indexes = matchShots
        .map((shot, index) => ({ shot, index }))
        .filter((item) => (item.shot.provenance?.team ?? 'Équipe inconnue') === team)
      return {
        team,
        shots: indexes.length,
        goals: indexes.filter((item) => item.shot.goal).length,
        modelXg: indexes.reduce((sum, item) => sum + predictions[item.index], 0),
        statsbombXg: indexes.reduce((sum, item) => sum + (item.shot.statsbomb_xg_reference ?? 0), 0),
      }
    })
    setSelectedShot(null)
    setRuns((current) => [...current.slice(-4), { matchId, config: { ...config, features: [...config.features] }, predictions, matchShots, teams }])
  }

  const selected = latest ? latest.matchShots.find((shot) => shot.id === selectedShot) ?? latest.matchShots[0] : null
  const selectedIndex = latest && selected ? latest.matchShots.findIndex((shot) => shot.id === selected.id) : -1

  if (step === 0) return (
    <LabShell visual={<div className="match-xg-intro"><span>tir 1</span><strong>0,08</strong><b>+</b><span>tir 2</span><strong>0,21</strong><b>+ … →</b><span>xG équipe</span></div>}>
      <Eyebrow>Chapitre 19 · Construire le xG d’un match</Eyebrow>
      <h1>On passe des probabilités tir par tir à une lecture du match.</h1>
      <p className="lead">Pour le match choisi, on entraîne le modèle sur les <strong>9 autres matchs</strong>. Il donne ensuite une probabilité à chaque tir du match laissé de côté. On additionne ces probabilités par équipe.</p>
      <div className="intent-card"><strong>Une seule idée à retenir</strong><span>Le xG d’une équipe sur un match est ici simplement la somme des probabilités données à ses tirs.</span></div>
      <ContinueButton onClick={() => setStep(1)}>Calculer un vrai match</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    return (
      <LabShell visual={latest ? <MatchScoreboard run={latest} /> : <div className="empty-lab-visual"><strong>Aucun match calculé</strong><span>Choisis un match puis lance le calcul.</span></div>}>
        <Eyebrow>Chapitre 19 · Match Lab</Eyebrow>
        <h1>Choisis un match et calcule ses xG.</h1>
        <p className="lead">Tu peux laisser le modèle par défaut tel quel. Le but de ce chapitre est d’appliquer un modèle à un match jamais utilisé pour l’entraîner, pas de trouver un nouveau réglage.</p>

        <div className="match-picker">
          {matchOptions.map((match) => (
            <button key={match.matchId} className={matchId === match.matchId ? 'selected' : ''} onClick={() => setMatchId(match.matchId)}>
              <strong>{match.label}</strong><small>{match.shotCount} tirs</small>
            </button>
          ))}
        </div>

        <button className="primary-lab-button" onClick={execute}>▶ Calculer ce match</button>

        <details className="advanced-options">
          <summary>Changer le modèle — optionnel</summary>
          <p className="microcopy">Le modèle par défaut suffit pour comprendre le chapitre. Ouvre ces réglages seulement si tu veux comparer une autre méthode.</p>
          <ModelWorkbenchControls config={config} onChange={setConfig} />
        </details>

        {latest && (
          <>
            <div className="plain-explanation"><strong>Ce que tu regardes</strong><span>Chaque équipe a un xG modèle = somme des probabilités de ses tirs. Les buts réels peuvent être très différents : xG décrit la qualité estimée des occasions, pas le score qui devait forcément arriver.</span></div>
            <div className="match-analysis-grid">
              <div className="match-shot-list">
                {latest.matchShots.map((shot, index) => (
                  <button key={shot.id} className={selected?.id === shot.id ? 'selected' : ''} onClick={() => setSelectedShot(shot.id)}>
                    <span>{shot.provenance?.player ?? 'Joueur'}</span>
                    <strong>{Math.round(latest.predictions[index] * 100)}%</strong>
                    <small>{shot.goal ? '⚽ but' : shot.provenance?.outcome ?? 'raté'} · référence SB {Math.round((shot.statsbomb_xg_reference ?? 0) * 100)}%</small>
                  </button>
                ))}
              </div>
              {selected && selectedIndex >= 0 && (
                <div className="match-shot-detail">
                  <span>{selected.provenance?.team ?? 'Équipe'}</span>
                  <strong>{selected.provenance?.player ?? 'Joueur'}</strong>
                  <div>
                    <p><b>{latest.predictions[selectedIndex].toFixed(2)}</b><small>xG de notre modèle</small></p>
                    <p><b>{(selected.statsbomb_xg_reference ?? 0).toFixed(2)}</b><small>xG StatsBomb</small></p>
                    <p><b>{selected.goal ? 'BUT' : 'RATÉ'}</b><small>résultat réel</small></p>
                  </div>
                  <p>{selected.distance.toFixed(1)} m · {selected.angle.toFixed(0)}° · {selected.body_part ?? '?'} · {selected.shot_type ?? '?'}</p>
                </div>
              )}
            </div>
            <div className="optional-challenge"><strong>Si tu veux aller plus loin</strong><span>Essaie un deuxième match ou change le modèle et regarde si les xG bougent. Ce n’est pas nécessaire pour continuer.</span></div>
            <ContinueButton onClick={() => setStep(2)}>J’ai compris comment le xG du match est construit</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  return (
    <LabShell visual={latest ? <MatchScoreboard run={latest} /> : undefined}>
      <Eyebrow>Chapitre 19 · Agrégation</Eyebrow>
      <h1>Le calcul est simple ; l’interprétation est la partie intéressante.</h1>
      <p className="lead">Le modèle produit une probabilité pour chaque tir. On les additionne pour obtenir le xG de l’équipe. Ensuite seulement on compare ce total au score réel, à l’adversaire ou à une autre référence.</p>
      <div className="reveal-card"><span>Pratique débloquée</span><strong>Appliquer un modèle à un match laissé hors entraînement, agréger ses prédictions et revenir aux tirs individuels pour comprendre le total.</strong></div>
      <ContinueButton onClick={onComplete}>Ouvrir le tableau analyste</ContinueButton>
    </LabShell>
  )
}

function MatchScoreboard({ run }: { run: Run }) {
  return (
    <div className="match-scoreboard">
      <span>{modelLabel(run.config)}</span>
      <strong>Match #{run.matchId}</strong>
      <div>
        {run.teams.map((team) => (
          <p key={team.team}>
            <small>{team.team}</small>
            <b>{team.goals} buts</b>
            <em>{team.modelXg.toFixed(2)} xG modèle</em>
            <i>{team.statsbombXg.toFixed(2)} xG StatsBomb</i>
          </p>
        ))}
      </div>
    </div>
  )
}
