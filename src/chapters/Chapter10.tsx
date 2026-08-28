import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { realShots } from '../data/realShots'
import { confusionMatrix, stratifiedSplit } from '../ml/evaluation'
import { accuracy, predictProbability, shotLabels, trainLogistic } from '../ml/logistic'
import { realFeatureLabels, realShotRows, type RealFeatureKey } from '../ml/realFeatures'

type Props = {
  step: number
  setStep: (step: number) => void
  onComplete: () => void
}

type Candidate = Exclude<RealFeatureKey, 'distance' | 'angle'>
type ExperimentResult = {
  accuracy: number
  detectedGoals: number
  missedGoals: number
  falseAlerts: number
}

const candidates: Candidate[] = ['is_header', 'first_time', 'under_pressure', 'is_penalty']
const decisionThreshold = 0.25

export function Chapter10({ step, setStep, onComplete }: Props) {
  const [hypothesis, setHypothesis] = useState<Candidate | null>(null)
  const [results, setResults] = useState<Partial<Record<Candidate, ExperimentResult>>>({})
  const [keep, setKeep] = useState<Candidate | null>(null)

  const split = useMemo(() => stratifiedSplit(realShots, 41, 0.3), [])
  const labels = useMemo(() => shotLabels(split.test), [split.test])

  const runExperiment = (extra?: Candidate): ExperimentResult => {
    const features: RealFeatureKey[] = extra ? ['distance', 'angle', extra] : ['distance', 'angle']
    const trainRows = realShotRows(split.train, features)
    const testRows = realShotRows(split.test, features)
    const model = trainLogistic(trainRows, shotLabels(split.train), 2800)
    const probabilities = testRows.map((row) => predictProbability(model, row))
    const matrix = confusionMatrix(probabilities, labels, decisionThreshold)
    return {
      accuracy: accuracy(probabilities, labels, decisionThreshold),
      detectedGoals: matrix.truePositive,
      missedGoals: matrix.falseNegative,
      falseAlerts: matrix.falsePositive,
    }
  }

  const baseline = useMemo(() => runExperiment(), [split, labels])
  const allTested = candidates.every((candidate) => results[candidate])

  const execute = (candidate: Candidate) => {
    const result = runExperiment(candidate)
    setResults((current) => ({ ...current, [candidate]: result }))
  }

  if (step === 0) {
    return (
      <LabShell
        visual={
          <div className="feature-hypothesis-board">
            <div><span>Déjà utilisé</span><strong>Distance + angle</strong></div>
            <b>+</b>
            <div><span>Quelle info ensuite&nbsp;?</span><strong>?</strong></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 10 · Une feature qui « semble logique » suffit-elle&nbsp;?</Eyebrow>
        <h1>Laquelle ajouterais-tu en premier&nbsp;?</h1>
        <p className="lead">On dispose maintenant de vraies informations présentes avant ou au moment du tir. Choisis celle qui, intuitivement, devrait le plus aider à estimer la chance de but.</p>
        <div className="choice-grid">
          {candidates.map((candidate) => (
            <button key={candidate} className={`choice-button ${hypothesis === candidate ? 'selected' : ''}`} onClick={() => setHypothesis(candidate)}>{realFeatureLabels[candidate]}</button>
          ))}
        </div>
        {hypothesis && (
          <>
            <div className="feedback neutral"><strong>Hypothèse enregistrée.</strong><span>On ne va pas encore décider si elle est bonne. On va la tester sur exactement les mêmes données que les autres.</span></div>
            <ContinueButton onClick={() => setStep(1)}>Lancer les expériences</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 1) {
    return (
      <LabShell
        visual={
          <div className="feature-results-board">
            <div className="feature-result baseline-result"><span>Distance + angle</span><strong>{Math.round(baseline.accuracy * 100)}%</strong><small>{baseline.detectedGoals} buts repérés · {baseline.falseAlerts} fausses alertes</small></div>
            {candidates.map((candidate) => {
              const result = results[candidate]
              return (
                <div key={candidate} className="feature-result">
                  <span>+ {realFeatureLabels[candidate]}</span>
                  {result ? <><strong>{Math.round(result.accuracy * 100)}%</strong><small>{result.detectedGoals} buts repérés · {result.falseAlerts} fausses alertes</small></> : <strong>—</strong>}
                </div>
              )
            })}
          </div>
        }
      >
        <Eyebrow>Chapitre 10 · Une variable à la fois</Eyebrow>
        <h1>Teste chacune des quatre hypothèses.</h1>
        <p className="lead">On garde exactement le même train, le même test, le même modèle et le même seuil. On change une seule information à la fois.</p>
        <div className="intent-card"><strong>Ce que tu dois observer</strong><span>Une feature est utile si elle modifie favorablement le comportement sur des tirs que le modèle n’a pas utilisés pour apprendre. Regarde le score, mais aussi les buts repérés et les fausses alertes.</span></div>
        <div className="experiment-buttons">
          {candidates.map((candidate) => <button key={candidate} className={results[candidate] ? 'done' : ''} onClick={() => execute(candidate)}>{results[candidate] ? '↻ ' : '▶ '}Tester {realFeatureLabels[candidate]}</button>)}
        </div>
        <p className="microcopy">Seuil fixé à {Math.round(decisionThreshold * 100)}% pour toutes les expériences afin de comparer la même chose.</p>
        {allTested && <ContinueButton onClick={() => setStep(2)}>Décider ce que tu garderais</ContinueButton>}
      </LabShell>
    )
  }

  if (step === 2) {
    const selected = keep ? results[keep] : null
    return (
      <LabShell
        visual={
          <div className="ablation-board">
            <span>Configuration de référence</span>
            <strong>distance + angle</strong>
            <b>+</b>
            <strong>{keep ? realFeatureLabels[keep] : '?'}</strong>
            {selected && <small>{Math.round(selected.accuracy * 100)}% · {selected.detectedGoals} buts repérés · {selected.missedGoals} buts ratés</small>}
          </div>
        }
      >
        <Eyebrow>Chapitre 10 · À toi de trancher</Eyebrow>
        <h1>Laquelle garderais-tu pour la prochaine version&nbsp;?</h1>
        <p className="lead">Il n’y a pas de réponse à apprendre par cœur ici. Relis tes résultats et choisis la feature dont le compromis te paraît le plus intéressant.</p>
        <div className="choice-grid">
          {candidates.map((candidate) => <button key={candidate} className={`choice-button ${keep === candidate ? 'selected' : ''}`} onClick={() => setKeep(candidate)}>{realFeatureLabels[candidate]}</button>)}
        </div>
        {keep && selected && (
          <>
            <div className="feedback neutral"><strong>Ta décision est défendable si tu peux expliquer le compromis.</strong><span>Sur ce split, « {realFeatureLabels[keep]} » donne {Math.round(selected.accuracy * 100)}% d’accuracy, repère {selected.detectedGoals} buts et produit {selected.falseAlerts} fausses alertes. Sur un autre échantillon, la conclusion pourrait changer.</span></div>
            <ContinueButton onClick={() => setStep(3)}>Voir ce qu’on vient vraiment de faire</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={
        <div className="encoding-board">
          <span>Donnée source</span><strong>body_part = "Head"</strong><b>→</b><span>Colonne numérique</span><strong>is_header = 1</strong>
        </div>
      }
    >
      <Eyebrow>Chapitre 10 · Feature engineering</Eyebrow>
      <h1>Une feature est une hypothèse mesurable.</h1>
      <p className="lead">Tu as choisi une information football, trouvé une façon de la représenter numériquement, entraîné le même modèle avec et sans elle, puis comparé le résultat sur des données inconnues.</p>
      <div className="reveal-card"><span>Concept débloqué</span><strong>Feature engineering : construire des variables exploitables à partir des données disponibles. Ablation : retirer ou ajouter une feature pour mesurer ce qu’elle apporte réellement.</strong></div>
      <UnderTheHood>
        <p>Notre régression logistique attend des nombres. Des catégories comme « Head » ou « Right Foot » doivent donc être encodées. Ici on a volontairement utilisé des indicateurs simples 0/1 pour rendre l’effet lisible.</p>
      </UnderTheHood>
      <div className="checkpoint"><span>Nouveau réflexe</span><strong>« Cette information semble logique » est le début d’une hypothèse, pas la preuve qu’elle améliore le modèle.</strong></div>
      <ContinueButton onClick={onComplete}>Atteindre le checkpoint Cycle 2</ContinueButton>
    </LabShell>
  )
}
