import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { challengeShots, learningShots } from '../data/shots'
import { evaluateLogistic, stratifiedSplit } from '../ml/evaluation'

const allShots = [...learningShots, ...challengeShots]

type Props = {
  step: number
  setStep: (step: number) => void
  onComplete: () => void
}

type ExperimentRun = {
  seed: number
  testRatio: number
  trainScore: number
  testScore: number
  trainCount: number
  testCount: number
}

export function Chapter4({ step, setStep, onComplete }: Props) {
  const [trustAnswer, setTrustAnswer] = useState<'yes' | 'doubt' | null>(null)
  const [testRatio, setTestRatio] = useState(0.3)
  const [seed, setSeed] = useState(3)
  const [runs, setRuns] = useState<ExperimentRun[]>([])
  const fixedEvaluation = useMemo(() => evaluateLogistic(learningShots, challengeShots), [])
  const previewSplit = useMemo(() => stratifiedSplit(allShots, seed, testRatio), [seed, testRatio])

  const runExperiment = () => {
    const split = stratifiedSplit(allShots, seed, testRatio)
    const evaluation = evaluateLogistic(split.train, split.test)
    setRuns((current) => [
      ...current,
      {
        seed,
        testRatio,
        trainScore: evaluation.trainAccuracy,
        testScore: evaluation.testAccuracy,
        trainCount: split.train.length,
        testCount: split.test.length,
      },
    ])
    setSeed((current) => current + 1)
  }

  if (step === 0) {
    return (
      <LabShell
        visual={
          <div className="score-stage">
            <span>Score sur les exemples appris</span>
            <strong>{Math.round(fixedEvaluation.trainAccuracy * 100)}%</strong>
            <small>{learningShots.length} tirs déjà vus</small>
          </div>
        }
      >
        <Eyebrow>Chapitre 04 · Peut-on croire le score&nbsp;?</Eyebrow>
        <h1>{Math.round(fixedEvaluation.trainAccuracy * 100)}%. Notre modèle est donc bon&nbsp;?</h1>
        <p className="lead">Il vient d’obtenir un très joli score sur les tirs qui ont servi à l’entraîner.</p>
        <div className="choice-row">
          <button className={`choice-button ${trustAnswer === 'yes' ? 'selected' : ''}`} onClick={() => setTrustAnswer('yes')}>Oui, ça semble solide</button>
          <button className={`choice-button ${trustAnswer === 'doubt' ? 'selected' : ''}`} onClick={() => setTrustAnswer('doubt')}>J’ai un doute</button>
        </div>
        {trustAnswer && (
          <>
            <div className="feedback neutral">
              <strong>Le piège est dans la question.</strong>
              <span>On est en train de noter le modèle sur des exemples qu’il connaît déjà. C’est comme réviser avec le corrigé puis repasser exactement la même feuille.</span>
            </div>
            <ContinueButton onClick={() => setStep(1)}>Construire un vrai contrôle</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 1) {
    return (
      <LabShell
        visual={
          <div className="split-stage">
            <div className="split-card train"><span>APPRENTISSAGE</span><strong>{previewSplit.train.length} tirs</strong><small>le modèle peut les utiliser</small></div>
            <div className="split-arrow">→</div>
            <div className="split-card test"><span>TEST</span><strong>{previewSplit.test.length} tirs</strong><small>jamais montrés au modèle</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 04 · À toi de découper</Eyebrow>
        <h1>Quelle part des données veux-tu garder pour le contrôle&nbsp;?</h1>
        <p className="lead">Plus tu gardes de tirs pour le test, plus le contrôle est fourni. Mais il reste moins d’exemples au modèle pour apprendre.</p>
        <div className="ratio-picker" role="group" aria-label="Part réservée au test">
          {[0.1, 0.3, 0.5].map((ratio) => (
            <button key={ratio} className={testRatio === ratio ? 'selected' : ''} onClick={() => { setTestRatio(ratio); setRuns([]) }}>
              <strong>{Math.round(ratio * 100)}%</strong>
              <span>pour le test</span>
            </button>
          ))}
        </div>
        <div className="thought-prompt"><strong>Pas de valeur magique</strong><span>Le choix dépend de la quantité de données disponible et de ce qu’on veut mesurer. Pour l’instant, observe surtout le compromis.</span></div>
        <ContinueButton onClick={() => setStep(2)}>Lancer plusieurs expériences</ContinueButton>
      </LabShell>
    )
  }

  if (step === 2) {
    const latest = runs.at(-1)
    const testScores = runs.map((run) => run.testScore)
    const minScore = testScores.length ? Math.min(...testScores) : 0
    const maxScore = testScores.length ? Math.max(...testScores) : 0

    return (
      <LabShell
        visual={
          <div className="experiment-lab">
            <div className="experiment-headline">
              <span>Test réservé</span>
              <strong>{Math.round(testRatio * 100)}%</strong>
              <small>{runs.length} expérience{runs.length > 1 ? 's' : ''} lancée{runs.length > 1 ? 's' : ''}</small>
            </div>
            {runs.length === 0 ? (
              <div className="empty-experiment">Lance une expérience pour entraîner puis tester un modèle.</div>
            ) : (
              <div className="run-history">
                {runs.map((run, index) => (
                  <div key={`${run.seed}-${index}`}>
                    <span>#{index + 1}</span>
                    <i style={{ width: `${run.testScore * 100}%` }} />
                    <strong>{Math.round(run.testScore * 100)}%</strong>
                  </div>
                ))}
              </div>
            )}
            <button className="secondary-button inline-button" onClick={runExperiment}>▶ Entraîner + tester</button>
          </div>
        }
      >
        <Eyebrow>Chapitre 04 · Expérimente</Eyebrow>
        <h1>Un score unique peut être trompeur. Fais-le bouger toi-même.</h1>
        <p className="lead">À chaque clic, un autre groupe de tirs est caché, un nouveau modèle est entraîné sur le reste, puis évalué sur ces tirs inconnus.</p>
        {latest && (
          <div className="metric-grid">
            <div className="metric"><strong>{Math.round(latest.trainScore * 100)}%</strong><span>train · {latest.trainCount} tirs</span></div>
            <div className="metric"><strong>{Math.round(latest.testScore * 100)}%</strong><span>test · {latest.testCount} tirs</span></div>
          </div>
        )}
        {runs.length >= 3 && (
          <div className="feedback good">
            <strong>Tu as maintenant plusieurs mesures.</strong>
            <span>Sur tes essais, le test varie de {Math.round(minScore * 100)}% à {Math.round(maxScore * 100)}%. Avec aussi peu de tirs, le groupe caché change beaucoup le résultat.</span>
          </div>
        )}
        <UnderTheHood>
          <p>Le navigateur sépare les buts et les tirs ratés, mélange chaque groupe, réserve la proportion que tu as choisie pour le test, puis réentraîne la régression logistique uniquement sur le reste.</p>
        </UnderTheHood>
        {runs.length >= 3 ? <ContinueButton onClick={() => setStep(3)}>Mettre un nom sur ce qu’on cherche</ContinueButton> : <p className="practice-gate">Lance au moins 3 expériences avant de continuer.</p>}
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={
        <div className="definition-visual stacked-definition">
          <span>apprendre sur</span><strong>TRAIN</strong><span className="flow-arrow">↓</span><span>réussir aussi sur</span><strong>INCONNU</strong>
        </div>
      }
    >
      <Eyebrow>Chapitre 04 · Généraliser</Eyebrow>
      <h1>Le but n’est pas de mémoriser. C’est de généraliser.</h1>
      <p className="lead">Tu viens de le mesurer toi-même : la vraie question n’est pas « quel score sur les exemples appris ? », mais « est-ce que ce que le modèle a appris tient sur des exemples qu’il n’a jamais vus ? »</p>
      <div className="reveal-card"><span>Concept débloqué</span><strong>Généralisation : capacité du modèle à rester utile sur des données qu’il n’a pas utilisées pour apprendre.</strong></div>
      <p>Et tu as déjà rencontré un deuxième problème : <strong>une évaluation dépend elle-même des données choisies pour le test.</strong> On reviendra dessus plus tard.</p>
      <ContinueButton onClick={onComplete}>Passer au chapitre 05</ContinueButton>
    </LabShell>
  )
}
