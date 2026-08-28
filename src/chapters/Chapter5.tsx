import { useMemo, useState } from 'react'
import { FootballPitch } from '../components/FootballPitch'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { challengeShots, learningShots } from '../data/shots'
import { predictProbability, shotLabels, shotRows, trainLogistic } from '../ml/logistic'

const scenarioIds = ['N02', 'N03', 'N05', 'N06']

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }

export function Chapter5({ step, setStep, onComplete }: Props) {
  const [answer, setAnswer] = useState<'wrong' | 'possible' | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [touchedIds, setTouchedIds] = useState<string[]>([])
  const [sumAnswer, setSumAnswer] = useState<number | null>(null)
  const model = useMemo(() => trainLogistic(shotRows(learningShots, ['distance', 'angle']), shotLabels(learningShots)), [])
  const probabilities = useMemo(() => new Map(challengeShots.map((shot) => [shot.id, predictProbability(model, [shot.distance, shot.angle])])), [model])
  const scenarioShots = useMemo(() => challengeShots.filter((shot) => scenarioIds.includes(shot.id)), [])
  const [estimates, setEstimates] = useState<Record<string, number>>(() => Object.fromEntries(scenarioShots.map((shot) => [shot.id, 0.25])))
  const surprisingShot = challengeShots.find((shot) => shot.id === 'N06') ?? challengeShots[0]
  const surprisingProbability = probabilities.get(surprisingShot.id) ?? 0
  const totalXg = scenarioShots.reduce((sum, shot) => sum + (probabilities.get(shot.id) ?? 0), 0)
  const humanTotal = scenarioShots.reduce((sum, shot) => sum + (estimates[shot.id] ?? 0), 0)
  const averageGap = scenarioShots.reduce((sum, shot) => sum + Math.abs((estimates[shot.id] ?? 0) - (probabilities.get(shot.id) ?? 0)), 0) / scenarioShots.length
  const choices = [Math.max(0.2, Number((totalXg - 0.7).toFixed(1))), Number(totalXg.toFixed(1)), Number((totalXg + 0.9).toFixed(1))]

  const updateEstimate = (id: string, value: number) => {
    setEstimates((current) => ({ ...current, [id]: value }))
    setTouchedIds((current) => current.includes(id) ? current : [...current, id])
    setRevealed(false)
  }

  if (step === 0) return (
    <LabShell visual={<div className="visual-stack"><FootballPitch shots={[surprisingShot]} showLabels /><div className="probability-badge"><span>estimation du modèle</span><strong>{Math.round(surprisingProbability * 100)}%</strong><small>de chance de but</small></div></div>}>
      <Eyebrow>Chapitre 05 · Probabilité</Eyebrow>
      <h1>Le modèle disait {Math.round(surprisingProbability * 100)}%. Pourtant, il y a eu but.</h1>
      <p className="lead">Est-ce que cette estimation était forcément mauvaise&nbsp;?</p>
      <div className="choice-row"><button className={`choice-button ${answer === 'wrong' ? 'selected' : ''}`} onClick={() => setAnswer('wrong')}>Oui, il s’est trompé</button><button className={`choice-button ${answer === 'possible' ? 'selected' : ''}`} onClick={() => setAnswer('possible')}>Non, c’était possible</button></div>
      {answer && <><div className={`feedback ${answer === 'possible' ? 'good' : 'neutral'}`}><strong>{answer === 'possible' ? 'Exact.' : 'Pas forcément.'}</strong><span>Une probabilité faible ne signifie pas impossible. Si des situations comparables se produisaient souvent, certaines finiraient quand même en but.</span></div><ContinueButton onClick={() => setStep(1)}>À toi d’estimer des tirs</ContinueButton></>}
    </LabShell>
  )

  if (step === 1) return (
    <LabShell visual={<div className="visual-stack"><FootballPitch shots={scenarioShots} showLabels /><div className="human-xg-total"><span>Ton total actuel</span><strong>{humanTotal.toFixed(2)} xG</strong></div></div>}>
      <Eyebrow>Chapitre 05 · Fais le modèle à la main</Eyebrow>
      <h1>Avant de voir la machine, attribue toi-même une probabilité à chaque tir.</h1>
      <p className="lead">Tu connais uniquement la position, la distance et l’angle. Il n’y a pas de « bonne intuition » attendue : l’objectif est de ressentir ce que signifie produire une probabilité.</p>
      <div className="xg-estimator-list">{scenarioShots.map((shot) => <div key={shot.id} className={touchedIds.includes(shot.id) ? 'touched' : ''}><div className="xg-estimator-meta"><strong>{shot.id}</strong><span>{shot.distance.toFixed(1)} m · {shot.angle.toFixed(0)}°</span></div><input aria-label={`Estimation xG du tir ${shot.id}`} type="range" min="0.05" max="0.95" step="0.05" value={estimates[shot.id]} onChange={(event) => updateEstimate(shot.id, Number(event.target.value))} /><strong className="xg-estimate-value">{Math.round(estimates[shot.id] * 100)}%</strong></div>)}</div>
      {touchedIds.length < scenarioShots.length ? <p className="practice-gate">Ajuste les {scenarioShots.length} tirs avant de voir le modèle.</p> : <button className="primary-lab-button" onClick={() => setRevealed(true)}>Comparer avec le modèle</button>}
      {revealed && <><div className="xg-comparison-grid">{scenarioShots.map((shot) => { const modelProbability = probabilities.get(shot.id) ?? 0; return <div key={shot.id}><span>{shot.id}</span><small>toi</small><strong>{Math.round(estimates[shot.id] * 100)}%</strong><small>modèle</small><strong>{Math.round(modelProbability * 100)}%</strong></div> })}</div><div className="feedback neutral"><strong>Écart moyen : {Math.round(averageGap * 100)} points de probabilité.</strong><span>Ce n’est pas une note sur ton intuition. Le modèle produit une estimation différente parce qu’il a appris à partir de beaucoup d’exemples passés.</span></div><ContinueButton onClick={() => setStep(2)}>Additionner les occasions</ContinueButton></>}
    </LabShell>
  )

  if (step === 2) return (
    <LabShell visual={<div className="xg-shot-list">{scenarioShots.map((shot) => <div key={shot.id}><span>{shot.id}</span><strong>{Math.round((probabilities.get(shot.id) ?? 0) * 100)}%</strong><small>{shot.goal ? 'but réel' : 'tir raté'}</small></div>)}</div>}>
      <Eyebrow>Chapitre 05 · Additionne toi-même</Eyebrow>
      <h1>Quel total représentent les quatre probabilités du modèle&nbsp;?</h1>
      <p className="lead">Additionne les quatre valeurs. Ne compte pas les buts réellement marqués : on additionne les estimations.</p>
      <div className="choice-row three-choices">{choices.map((choice) => <button key={choice} className={`choice-button ${sumAnswer === choice ? 'selected' : ''}`} onClick={() => setSumAnswer(choice)}>{choice.toFixed(1)} xG</button>)}</div>
      {sumAnswer !== null && <><div className={`feedback ${Math.abs(sumAnswer - Number(totalXg.toFixed(1))) < 0.01 ? 'good' : 'neutral'}`}><strong>Total : {totalXg.toFixed(2)} xG.</strong><span>Ton propre total était {humanTotal.toFixed(2)} xG. Les deux représentent la même opération : additionner des estimations de probabilité tir par tir.</span></div><UnderTheHood><p>À ce stade, retiens seulement ceci&nbsp;: le modèle transforme les informations du tir en une estimation entre 0 et 1. <strong>Le chapitre suivant montrera concrètement plusieurs façons différentes de fabriquer cette estimation.</strong></p></UnderTheHood><ContinueButton onClick={() => setStep(3)}>Mettre un nom dessus</ContinueButton></>}
    </LabShell>
  )

  return (
    <LabShell visual={<div className="formula-board"><span>tir 1</span><strong>p₁</strong><b>+</b><span>tir 2</span><strong>p₂</strong><b>+ … =</b><strong>{totalXg.toFixed(2)} xG</strong></div>}>
      <Eyebrow>Chapitre 05 · Expected Goals</Eyebrow>
      <h1>Tu viens de fabriquer puis d’additionner des xG.</h1>
      <p className="lead">Pour chaque tir, un modèle estime la probabilité qu’il devienne un but à partir des informations disponibles. Cette estimation est son <strong>xG</strong>.</p>
      <p>Les vrais modèles de xG utilisent généralement davantage de données que notre duo distance + angle. Mais la mécanique fondamentale que tu viens de pratiquer est la même.</p>
      <div className="reveal-card"><span>Idée à garder</span><strong>Un xG de 0,20 ne prédit pas le résultat d’un tir. Il estime une fréquence de réussite pour des situations comparables — selon ce modèle et les données qu’il a appris.</strong></div>
      <ContinueButton onClick={onComplete}>Découvrir trois façons de produire cette estimation</ContinueButton>
    </LabShell>
  )
}
