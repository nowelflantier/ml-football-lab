import { useMemo, useState } from 'react'
import { FootballPitch } from '../components/FootballPitch'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { ProbabilityCurve } from '../components/ProbabilityCurve'
import { challengeShots, learningShots } from '../data/shots'
import { predictProbability, shotLabels, shotRows, trainLogistic } from '../ml/logistic'

type Props = {
  step: number
  setStep: (step: number) => void
  manualThreshold: number
  onComplete: () => void
}

export function Chapter2({ step, setStep, manualThreshold, onComplete }: Props) {
  const [trained, setTrained] = useState(false)
  const [selectedId, setSelectedId] = useState(challengeShots[0].id)
  const model = useMemo(() => trainLogistic(shotRows(learningShots, ['distance']), shotLabels(learningShots)), [])
  const probabilities = useMemo(() => challengeShots.map((shot) => predictProbability(model, [shot.distance])), [model])

  if (step === 0) {
    return (
      <LabShell
        visual={trained ? <ProbabilityCurve probabilityForDistance={(distance) => predictProbability(model, [distance])} /> : <div className="machine-idle"><div className="machine-core">?</div><span>Les exemples sont prêts.</span></div>}
      >
        <Eyebrow>Chapitre 02 · Apprendre</Eyebrow>
        <h1>Cette fois, ne choisis pas le seuil.</h1>
        <p className="lead">On donne à l’ordinateur la distance de chaque tir et son résultat. On lui demande de chercher lui-même une relation utile.</p>
        <div className="input-pills"><span>distance</span><span>résultat connu</span><span>18 exemples</span></div>
        {!trained ? (
          <button className="train-button" onClick={() => setTrained(true)}><span className="train-icon">▶</span> ENTRAÎNER</button>
        ) : (
          <>
            <div className="feedback good"><strong>Relation trouvée.</strong><span>Elle n’est plus une frontière brutale : le modèle associe à chaque distance une probabilité.</span></div>
            <p className="microcopy">La courbe à gauche est la relation apprise à partir de nos exemples.</p>
            <ContinueButton onClick={() => setStep(1)}>Comparer avec ma règle</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 1) {
    const selectedIndex = challengeShots.findIndex((shot) => shot.id === selectedId)
    const selected = challengeShots[selectedIndex]
    const probability = probabilities[selectedIndex]
    const humanCorrect = challengeShots.filter((shot) => (shot.distance < manualThreshold) === shot.goal).length
    const modelCorrect = challengeShots.filter((shot, index) => (probabilities[index] >= 0.5) === shot.goal).length
    return (
      <LabShell
        visual={
          <div className="visual-stack">
            <FootballPitch shots={challengeShots} selectedId={selectedId} onSelect={(shot) => setSelectedId(shot.id)} />
            <div className="comparison-strip"><span>Ta règle <b>{humanCorrect}/{challengeShots.length}</b></span><span>Modèle <b>{modelCorrect}/{challengeShots.length}</b></span></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 02 · Comparer</Eyebrow>
        <h1>La machine ne répond pas seulement oui ou non.</h1>
        <p className="lead">Clique sur les tirs. Le modèle exprime à quel point le but lui paraît plausible à partir de la distance.</p>
        <div className="shot-inspector">
          <div><span>Tir</span><strong>{selected.id}</strong></div>
          <div><span>Distance</span><strong>{selected.distance.toFixed(1)} m</strong></div>
          <div><span>Modèle</span><strong>{Math.round(probability * 100)}%</strong></div>
          <div><span>Réalité</span><strong>{selected.goal ? 'BUT' : 'PAS BUT'}</strong></div>
        </div>
        <div className="thought-prompt"><strong>Un point important</strong><span>À 37%, un but peut parfaitement arriver. Une probabilité n’est pas une promesse.</span></div>
        <ContinueButton onClick={() => setStep(2)}>Mettre un nom dessus</ContinueButton>
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={<div className="definition-visual"><span>exemples</span><span className="flow-arrow">→</span><strong>MODÈLE</strong><span className="flow-arrow">→</span><span>prédiction</span></div>}
    >
      <Eyebrow>Chapitre 02 · Le premier modèle</Eyebrow>
      <h1>Ce que l’ordinateur vient d’apprendre s’appelle un modèle.</h1>
      <p className="lead">Au chapitre 1, <strong>tu écrivais la règle</strong>. Ici, tu as fourni des exemples et l’ordinateur a <strong>ajusté une relation à partir d’eux</strong>.</p>
      <div className="versus-card"><div><span>Avant</span><strong>Humain → règle → prédiction</strong></div><div><span>Maintenant</span><strong>Exemples → apprentissage → modèle → prédiction</strong></div></div>
      <div className="reveal-card"><span>Machine learning, version minimale</span><strong>Faire apprendre une relation à partir d’exemples plutôt que programmer chaque règle à la main.</strong></div>
      <ContinueButton onClick={onComplete}>Passer au chapitre 03</ContinueButton>
    </LabShell>
  )
}
