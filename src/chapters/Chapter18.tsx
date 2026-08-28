import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { realShots } from '../data/realShots'
import { predictConfigured, trainConfiguredModel, type ModelConfig } from '../ml/modelLab'
import type { Shot } from '../types'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }

const features: ModelConfig['features'] = ['distance', 'angle', 'is_header', 'first_time', 'under_pressure', 'is_penalty']
const configs: ModelConfig[] = [
  { family: 'logistic', features },
  { family: 'knn', features, k: 11 },
  { family: 'tree', features, depth: 3, minSamples: 8 },
]
const sampleShots = realShots.filter((shot, index) => index % 23 === 0).slice(0, 8)

export function Chapter18({ step, setStep, onComplete }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [distance, setDistance] = useState(sampleShots[0].distance)
  const [angle, setAngle] = useState(sampleShots[0].angle)
  const [header, setHeader] = useState(sampleShots[0].body_part === 'Head')
  const [penalty, setPenalty] = useState(sampleShots[0].shot_type === 'Penalty')
  const [pressure, setPressure] = useState(Boolean(sampleShots[0].under_pressure))
  const [firstTime, setFirstTime] = useState(Boolean(sampleShots[0].first_time))
  const [changes, setChanges] = useState(0)
  const [visited, setVisited] = useState<number[]>([0])

  const trained = useMemo(() => configs.map((config) => trainConfiguredModel(realShots, config)), [])
  const base = sampleShots[selectedIndex]
  const synthetic: Shot = { ...base, distance, angle, body_part: header ? 'Head' : 'Right Foot', shot_type: penalty ? 'Penalty' : 'Open Play', under_pressure: pressure, first_time: firstTime }
  const probabilities = trained.map((model, index) => predictConfigured(model, [synthetic], configs[index].features)[0])

  const touch = () => setChanges((value) => value + 1)
  const chooseShot = (index: number) => {
    const shot = sampleShots[index]
    setSelectedIndex(index)
    setDistance(shot.distance)
    setAngle(shot.angle)
    setHeader(shot.body_part === 'Head')
    setPenalty(shot.shot_type === 'Penalty')
    setPressure(Boolean(shot.under_pressure))
    setFirstTime(Boolean(shot.first_time))
    setVisited((current) => current.includes(index) ? current : [...current, index])
  }

  if (step === 0) return (
    <LabShell visual={<div className="whatif-intro"><span>Tir réel</span><strong>14m · 28°</strong><b>→ change une chose →</b><span>Nouveau scénario</span><strong>9m · 28°</strong></div>}>
      <Eyebrow>Chapitre 18 · What-if Lab</Eyebrow>
      <h1>Tu peux maintenant interroger le modèle.</h1>
      <p className="lead">Au lieu d’attendre des erreurs, prends un tir et pose des questions : « même tir mais 5 mètres plus près ? », « même position mais de la tête ? », « et si c’était un penalty ? ».</p>
      <div className="intent-card"><strong>Attention</strong><span>Tu observes la réaction du modèle, pas une vérité causale sur le football. Le modèle répond selon les relations qu’il a apprises dans ces données.</span></div>
      <ContinueButton onClick={() => setStep(1)}>Ouvrir le simulateur</ContinueButton>
    </LabShell>
  )

  if (step === 1) return (
    <LabShell visual={<WhatIfScoreboard probabilities={probabilities} />}>
      <Eyebrow>Chapitre 18 · Sensitivity analysis</Eyebrow>
      <h1>Change le scénario et regarde les trois modèles réagir.</h1>
      <div className="shot-tabs">{sampleShots.map((shot, index) => <button key={shot.id} className={selectedIndex === index ? 'selected' : ''} onClick={() => chooseShot(index)}>Tir {index + 1}<small>{shot.provenance?.player ?? 'joueur'} · {shot.goal ? 'but' : 'raté'}</small></button>)}</div>
      <div className="whatif-controls">
        <label><span>Distance · {distance.toFixed(1)} m</span><input type="range" min="3" max="35" step="0.5" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); touch() }} /></label>
        <label><span>Angle · {angle.toFixed(0)}°</span><input type="range" min="3" max="80" step="1" value={angle} onChange={(event) => { setAngle(Number(event.target.value)); touch() }} /></label>
        <button className={header ? 'selected' : ''} onClick={() => { setHeader((value) => !value); touch() }}>Tir de la tête {header ? '✓' : ''}</button>
        <button className={penalty ? 'selected' : ''} onClick={() => { setPenalty((value) => !value); touch() }}>Penalty {penalty ? '✓' : ''}</button>
        <button className={pressure ? 'selected' : ''} onClick={() => { setPressure((value) => !value); touch() }}>Sous pression {pressure ? '✓' : ''}</button>
        <button className={firstTime ? 'selected' : ''} onClick={() => { setFirstTime((value) => !value); touch() }}>Première intention {firstTime ? '✓' : ''}</button>
      </div>
      <div className="intent-card"><strong>Expériences utiles</strong><span>Garde tout fixe et ne change que la distance. Puis remets le tir réel et change seulement la partie du corps. Compare ensuite avec un autre tir de base.</span></div>
      <p className="practice-gate">{changes < 6 ? `Fais encore ${6 - changes} modification(s).` : visited.length < 2 ? 'Essaie maintenant un deuxième tir réel.' : 'Tu as suffisamment interrogé les modèles.'}</p>
      {changes >= 6 && visited.length >= 2 && <ContinueButton onClick={() => setStep(2)}>Comprendre ce type d’analyse</ContinueButton>}
    </LabShell>
  )

  return (
    <LabShell visual={<WhatIfScoreboard probabilities={probabilities} />}>
      <Eyebrow>Chapitre 18 · Interpréter par perturbation</Eyebrow>
      <h1>Tu viens de faire une analyse de sensibilité.</h1>
      <p className="lead">En modifiant une entrée tout en gardant les autres constantes, tu observes comment la prédiction répond. Les différentes familles peuvent réagir très différemment au même changement.</p>
      <div className="reveal-card"><span>Pratique débloquée</span><strong>What-if / sensitivity analysis : perturber les features pour comprendre le comportement d’un modèle. Ce n’est pas automatiquement une preuve de causalité.</strong></div>
      <div className="checkpoint"><span>Prochaine étape</span><strong>Utiliser ton modèle non plus tir par tir, mais sur un match complet.</strong></div>
      <ContinueButton onClick={onComplete}>Construire un xG de match</ContinueButton>
    </LabShell>
  )
}

function WhatIfScoreboard({ probabilities }: { probabilities: number[] }) {
  return <div className="whatif-scoreboard">{['Logistique','k-NN','Arbre'].map((label, index) => <div key={label}><span>{label}</span><strong>{Math.round(probabilities[index] * 100)}%</strong><i style={{ width: `${probabilities[index] * 100}%` }} /></div>)}</div>
}
