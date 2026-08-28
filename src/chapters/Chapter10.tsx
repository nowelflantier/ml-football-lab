import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { realShots } from '../data/realShots'
import { confusionMatrix, stratifiedSplit } from '../ml/evaluation'
import { accuracy, predictProbability, shotLabels, trainLogistic } from '../ml/logistic'
import { realFeatureLabels, realShotRows, type RealFeatureKey } from '../ml/realFeatures'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type Candidate = Exclude<RealFeatureKey, 'distance' | 'angle'>
type ExperimentResult = {
  correct: number
  total: number
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
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [leakTested, setLeakTested] = useState(false)

  const split = useMemo(() => stratifiedSplit(realShots, 41, 0.3), [])
  const trainLabels = useMemo(() => shotLabels(split.train), [split.train])
  const testLabels = useMemo(() => shotLabels(split.test), [split.test])

  const runExperiment = (extra?: Candidate): ExperimentResult => {
    const features: RealFeatureKey[] = extra ? ['distance', 'angle', extra] : ['distance', 'angle']
    const model = trainLogistic(realShotRows(split.train, features), trainLabels, 2800)
    const probabilities = realShotRows(split.test, features).map((row) => predictProbability(model, row))
    const score = accuracy(probabilities, testLabels, decisionThreshold)
    const matrix = confusionMatrix(probabilities, testLabels, decisionThreshold)
    return {
      correct: Math.round(score * testLabels.length),
      total: testLabels.length,
      accuracy: score,
      detectedGoals: matrix.truePositive,
      missedGoals: matrix.falseNegative,
      falseAlerts: matrix.falsePositive,
    }
  }

  const baseline = useMemo(() => runExperiment(), [split, testLabels, trainLabels])
  const allTested = candidates.every((candidate) => results[candidate])
  const selectedResult = selected ? results[selected] : undefined

  const leakageScore = useMemo(() => {
    const trainRows = split.train.map((shot, index) => [shot.distance, shot.angle, trainLabels[index]])
    const testRows = split.test.map((shot, index) => [shot.distance, shot.angle, testLabels[index]])
    const model = trainLogistic(trainRows, trainLabels, 2800)
    const probabilities = testRows.map((row) => predictProbability(model, row))
    const score = accuracy(probabilities, testLabels, decisionThreshold)
    return { correct: Math.round(score * testLabels.length), total: testLabels.length, accuracy: score }
  }, [split, testLabels, trainLabels])

  if (step === 0) return (
    <LabShell visual={<FeatureQuestionVisual />}>
      <Eyebrow>Chapitre 10 · Une nouvelle information aide-t-elle vraiment&nbsp;?</Eyebrow>
      <h1>« Ça semble utile » est une hypothèse, pas encore un résultat.</h1>
      <p className="lead">Notre modèle connaît déjà la distance et l’angle. Quelle information ajouterais-tu en premier pour décrire le tir&nbsp;?</p>
      <div className="choice-grid">{candidates.map((candidate) => <button key={candidate} className={`choice-button ${hypothesis === candidate ? 'selected' : ''}`} onClick={() => setHypothesis(candidate)}>{realFeatureLabels[candidate]}</button>)}</div>
      {hypothesis && <><div className="feedback neutral"><strong>Hypothèse enregistrée.</strong><span>Maintenant on va changer <b>une seule colonne</b> et garder le même train, le même test, le même modèle et le même seuil.</span></div><ContinueButton onClick={() => setStep(1)}>Tester les informations une par une</ContinueButton></>}
    </LabShell>
  )

  if (step === 1) return (
    <LabShell visual={<FeatureExperimentBoard baseline={baseline} results={results} />}>
      <Eyebrow>10.1 · Même expérience, une colonne différente</Eyebrow>
      <h1>Teste les quatre informations.</h1>
      <p className="lead">Le résultat principal est volontairement écrit comme un <b>compte de tirs de test</b>, pas comme un pourcentage mystérieux.</p>
      <div className="score-meaning-card"><strong>Exemple de lecture</strong><span>« {baseline.correct}/{baseline.total} tirs correctement classés » signifie que le <b>modèle entier</b> a pris la bonne décision sur {baseline.correct} tirs du jeu de test. Cela ne mesure ni la valeur, ni l’importance d’une feature.</span></div>
      <div className="experiment-buttons">{candidates.map((candidate) => <button key={candidate} className={results[candidate] ? 'done' : ''} onClick={() => setResults((current) => ({ ...current, [candidate]: runExperiment(candidate) }))}>{results[candidate] ? '↻ ' : '▶ '}Tester + {realFeatureLabels[candidate]}</button>)}</div>
      <p className="microcopy">Seuil de décision fixe à {Math.round(decisionThreshold * 100)}%. Tous les essais utilisent exactement les mêmes tirs de test.</p>
      {allTested && <ContinueButton onClick={() => setStep(2)}>Interpréter les résultats</ContinueButton>}
    </LabShell>
  )

  if (step === 2) return (
    <LabShell visual={<FeatureDecisionBoard baseline={baseline} results={results} selected={selected} />}>
      <Eyebrow>10.2 · Qu’est-ce qu’une feature a vraiment changé&nbsp;?</Eyebrow>
      <h1>Choisis un essai et lis-le comme une comparaison.</h1>
      <p className="lead">On ne cherche pas « quelle feature vaut le plus ». On demande simplement&nbsp;: <b>sur ce test précis, le modèle avec cette information s’est-il comporté différemment du modèle sans elle&nbsp;?</b></p>
      <div className="choice-grid">{candidates.map((candidate) => <button key={candidate} className={`choice-button ${selected === candidate ? 'selected' : ''}`} onClick={() => setSelected(candidate)}>{realFeatureLabels[candidate]}</button>)}</div>
      {selected && selectedResult && (
        <div className="feature-interpretation-card">
          <span>Distance + angle</span><strong>{baseline.correct}/{baseline.total} décisions justes</strong><small>{baseline.detectedGoals} buts repérés · {baseline.falseAlerts} fausses alertes</small>
          <b>→ ajouter « {realFeatureLabels[selected]} » →</b>
          <span>Distance + angle + {realFeatureLabels[selected]}</span><strong>{selectedResult.correct}/{selectedResult.total} décisions justes</strong><small>{selectedResult.detectedGoals} buts repérés · {selectedResult.falseAlerts} fausses alertes</small>
          <p>Le pourcentage secondaire serait {Math.round(selectedResult.accuracy * 100)}%. Il décrit <b>la proportion totale de décisions correctes</b>, pas « {realFeatureLabels[selected]} = {Math.round(selectedResult.accuracy * 100)}% ».</p>
        </div>
      )}
      {selectedResult && <ContinueButton onClick={() => setStep(3)}>Tester une feature beaucoup trop efficace</ContinueButton>}
    </LabShell>
  )

  if (step === 3) return (
    <LabShell visual={<LeakVisual baseline={baseline} leak={leakageScore} revealed={leakTested} />}>
      <Eyebrow>10.3 · Toutes les colonnes mesurables sont-elles légitimes&nbsp;?</Eyebrow>
      <h1>Ajoutons une information : « le score a changé juste après le tir ».</h1>
      <p className="lead">Cette colonne existe bien dans les données finales d’un match. Mais pose-toi une question avant de regarder le score&nbsp;: <b>est-elle déjà connue au moment où l’on veut prédire le tir&nbsp;?</b></p>
      <div className="concrete-story-card"><span>Nouvelle colonne</span><strong>Le score a changé juste après le tir&nbsp;: oui / non</strong><small>C’est presque une autre façon d’écrire le résultat que l’on cherche à prédire.</small></div>
      {!leakTested ? <button className="primary-lab-button" onClick={() => setLeakTested(true)}>Entraîner + tester avec cette colonne</button> : (
        <>
          <div className="feedback neutral"><strong>{leakageScore.correct}/{leakageScore.total} décisions justes.</strong><span>Le bond spectaculaire n’est pas une découverte géniale. Le modèle a reçu une information provenant du <b>futur par rapport au moment de la prédiction</b>.</span></div>
          <ContinueButton onClick={() => setStep(4)}>Nommer cette triche</ContinueButton>
        </>
      )}
    </LabShell>
  )

  return (
    <LabShell visual={<FeatureGuardrails />}>
      <Eyebrow>Chapitre 10 · Feature engineering & leakage</Eyebrow>
      <h1>Une feature est une hypothèse mesurable — et elle doit être disponible à temps.</h1>
      <p className="lead">Tu as ajouté des informations football légitimes une par une, comparé leur effet sur les mêmes tirs inconnus, puis vu qu’une information « parfaite » peut en réalité rendre l’expérience invalide.</p>
      <div className="reveal-card"><span>Deux concepts</span><strong>Feature engineering&nbsp;: construire des variables exploitables. Data leakage&nbsp;: laisser entrer dans les features une information qui ne devrait pas être disponible au moment réel de la prédiction.</strong></div>
      <UnderTheHood><p>Les informations binaires comme « sous pression » sont représentées par 0/1. Le modèle peut alors leur attribuer un poids avec les autres features. Mais un poids appris n’est pas une preuve de causalité.</p></UnderTheHood>
      <div className="checkpoint"><span>Réflexe</span><strong>Avant d’ajouter une colonne&nbsp;: que signifie-t-elle, quand existe-t-elle, et améliore-t-elle réellement le comportement sur de l’inconnu&nbsp;?</strong></div>
      <ContinueButton onClick={onComplete}>Passer à la qualité des probabilités</ContinueButton>
    </LabShell>
  )
}

function FeatureQuestionVisual() {
  return <div className="feature-hypothesis-board"><div><span>Déjà utilisé</span><strong>Distance + angle</strong></div><b>+</b><div><span>Une nouvelle info</span><strong>?</strong></div></div>
}

function FeatureExperimentBoard({ baseline, results }: { baseline: ExperimentResult; results: Partial<Record<Candidate, ExperimentResult>> }) {
  return <div className="feature-results-board"><ResultCard label="Distance + angle" result={baseline} baseline />{candidates.map((candidate) => <ResultCard key={candidate} label={`+ ${realFeatureLabels[candidate]}`} result={results[candidate]} />)}</div>
}

function ResultCard({ label, result, baseline = false }: { label: string; result?: ExperimentResult; baseline?: boolean }) {
  return <div className={`feature-result ${baseline ? 'baseline-result' : ''}`}><span>{label}</span>{result ? <><strong>{result.correct}/{result.total}</strong><small>décisions justes · {Math.round(result.accuracy * 100)}%</small></> : <strong>—</strong>}</div>
}

function FeatureDecisionBoard({ baseline, results, selected }: { baseline: ExperimentResult; results: Partial<Record<Candidate, ExperimentResult>>; selected: Candidate | null }) {
  const result = selected ? results[selected] : undefined
  return <div className="ablation-board"><span>Référence</span><strong>{baseline.correct}/{baseline.total}</strong><b>VS</b><span>{selected ? `+ ${realFeatureLabels[selected]}` : 'choisis une feature'}</span><strong>{result ? `${result.correct}/${result.total}` : '—'}</strong></div>
}

function LeakVisual({ baseline, leak, revealed }: { baseline: ExperimentResult; leak: { correct: number; total: number; accuracy: number }; revealed: boolean }) {
  return <div className="leak-compare-board"><div><span>Features disponibles avant le tir</span><strong>{baseline.correct}/{baseline.total}</strong></div><b>→ + info après le tir →</b><div><span>Avec fuite</span><strong>{revealed ? `${leak.correct}/${leak.total}` : '?'}</strong></div></div>
}

function FeatureGuardrails() {
  return <div className="guardrail-board"><div><span>1</span><strong>Signification</strong><small>que représente réellement cette colonne&nbsp;?</small></div><div><span>2</span><strong>Disponibilité</strong><small>existe-t-elle au moment de la prédiction&nbsp;?</small></div><div><span>3</span><strong>Test inconnu</strong><small>apporte-t-elle quelque chose hors du train&nbsp;?</small></div></div>
}
