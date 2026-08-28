import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { challengeShots, learningShots } from '../data/shots'
import { accuracy, predictProbability, shotLabels, shotRows, trainLogistic } from '../ml/logistic'
import { predictKnnProbability, trainKnn } from '../ml/knn'
import type { Shot } from '../types'

type Props = {
  step: number
  setStep: (step: number) => void
  onComplete: () => void
}

type LeakFeature = 'distance' | 'angle' | 'x' | 'scoreChanged'

const kOptions = [1, 3, 5, 7]
const leakFeatureLabels: Record<LeakFeature, { label: string; hint: string }> = {
  distance: { label: 'Distance', hint: 'connue au moment du tir' },
  angle: { label: 'Angle', hint: 'connu au moment du tir' },
  x: { label: 'Coordonnée X', hint: 'position connue au moment du tir' },
  scoreChanged: { label: 'Le score a changé juste après', hint: 'information observée après le tir' },
}

function rowsForFeatures(shots: Shot[], labels: number[], features: LeakFeature[]) {
  return shots.map((shot, index) => features.map((feature) => {
    if (feature === 'distance') return shot.distance
    if (feature === 'angle') return shot.angle
    if (feature === 'x') return shot.x
    return labels[index]
  }))
}

export function Chapter6({ step, setStep, onComplete }: Props) {
  const [triedKs, setTriedKs] = useState<number[]>([])
  const [selectedK, setSelectedK] = useState(3)
  const [overfitConclusion, setOverfitConclusion] = useState<'train' | 'test' | null>(null)
  const [selectedLeakFeatures, setSelectedLeakFeatures] = useState<LeakFeature[]>(['distance', 'angle'])
  const [leakRuns, setLeakRuns] = useState<Array<{ features: LeakFeature[]; score: number }>>([])
  const [leakChoice, setLeakChoice] = useState<'valid' | 'leak' | null>(null)

  const trainRows = useMemo(() => shotRows(learningShots, ['distance', 'angle']), [])
  const testRows = useMemo(() => shotRows(challengeShots, ['distance', 'angle']), [])
  const trainLabels = useMemo(() => shotLabels(learningShots), [])
  const testLabels = useMemo(() => shotLabels(challengeShots), [])
  const logistic = useMemo(() => trainLogistic(trainRows, trainLabels), [trainLabels, trainRows])
  const knn = useMemo(() => trainKnn(trainRows, trainLabels), [trainLabels, trainRows])
  const logisticTrain = accuracy(trainRows.map((row) => predictProbability(logistic, row)), trainLabels)
  const logisticTest = accuracy(testRows.map((row) => predictProbability(logistic, row)), testLabels)

  const knnResults = useMemo(() => Object.fromEntries(kOptions.map((k) => {
    const trainScore = accuracy(trainRows.map((row) => predictKnnProbability(knn, row, k)), trainLabels)
    const testScore = accuracy(testRows.map((row) => predictKnnProbability(knn, row, k)), testLabels)
    return [k, { trainScore, testScore }]
  })) as Record<number, { trainScore: number; testScore: number }>, [knn, testLabels, testRows, trainLabels, trainRows])

  const tryK = (k: number) => {
    setSelectedK(k)
    setTriedKs((current) => current.includes(k) ? current : [...current, k])
  }

  const toggleLeakFeature = (feature: LeakFeature) => {
    setSelectedLeakFeatures((current) => current.includes(feature)
      ? current.filter((item) => item !== feature)
      : [...current, feature])
    setLeakChoice(null)
  }

  const testLeakSelection = () => {
    if (selectedLeakFeatures.length === 0) return
    const model = trainLogistic(rowsForFeatures(learningShots, trainLabels, selectedLeakFeatures), trainLabels)
    const probabilities = rowsForFeatures(challengeShots, testLabels, selectedLeakFeatures).map((row) => predictProbability(model, row))
    const score = accuracy(probabilities, testLabels)
    setLeakRuns((current) => [...current, { features: [...selectedLeakFeatures], score }])
  }

  if (step === 0) {
    const foundPerfect = triedKs.some((k) => knnResults[k].trainScore === 1)
    return (
      <LabShell
        visual={
          <div className="k-training-lab">
            <span>Objectif volontairement suspect</span>
            <strong>Maximise le score TRAIN</strong>
            <div className="k-result-row">
              {kOptions.map((k) => (
                <div key={k} className={selectedK === k ? 'active' : ''}>
                  <small>k = {k}</small>
                  <strong>{triedKs.includes(k) ? `${Math.round(knnResults[k].trainScore * 100)}%` : '?'}</strong>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <Eyebrow>Chapitre 06 · Fabrique un score parfait</Eyebrow>
        <h1>Cette fois, essaie toi-même de faire monter le score d’apprentissage.</h1>
        <p className="lead">Le modèle regarde les k tirs d’apprentissage les plus proches. Teste plusieurs valeurs de k et cherche celle qui colle le mieux aux exemples déjà connus.</p>
        <div className="k-button-row">
          {kOptions.map((k) => <button key={k} className={selectedK === k && triedKs.includes(k) ? 'selected' : ''} onClick={() => tryK(k)}>Tester k = {k}</button>)}
        </div>
        {triedKs.length < 2 && <p className="practice-gate">Teste au moins deux réglages.</p>}
        {triedKs.length >= 2 && !foundPerfect && <p className="practice-gate">Il existe un réglage qui atteint 100% sur train. Trouve-le avant de continuer.</p>}
        {foundPerfect && triedKs.length >= 2 && (
          <>
            <div className="feedback good"><strong>Tu as réussi : 100% sur train.</strong><span>Maintenant, la question importante : est-ce que ce réglage a vraiment mieux appris, ou a-t-il surtout mieux mémorisé ?</span></div>
            <ContinueButton onClick={() => setStep(1)}>Révéler le vrai contrôle</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 1) {
    return (
      <LabShell
        visual={
          <div className="train-test-bars practice-bars">
            {triedKs.map((k) => (
              <div key={k}>
                <span>k = {k}</span>
                <i style={{ width: `${knnResults[k].trainScore * 100}%` }} /><strong>{Math.round(knnResults[k].trainScore * 100)}% train</strong>
                <i style={{ width: `${knnResults[k].testScore * 100}%` }} /><strong>{Math.round(knnResults[k].testScore * 100)}% test</strong>
              </div>
            ))}
          </div>
        }
      >
        <Eyebrow>Chapitre 06 · Compare ce que tu viens de régler</Eyebrow>
        <h1>Ton 100% disparaît sur les tirs inconnus.</h1>
        <p className="lead">Tu as optimisé exactement ce qu’on t’a demandé : le train. Et c’est justement le piège.</p>
        <div className="choice-row">
          <button className={`choice-button ${overfitConclusion === 'train' ? 'selected' : ''}`} onClick={() => setOverfitConclusion('train')}>Le meilleur train doit gagner</button>
          <button className={`choice-button ${overfitConclusion === 'test' ? 'selected' : ''}`} onClick={() => setOverfitConclusion('test')}>Je regarde surtout ce qui tient sur test</button>
        </div>
        {overfitConclusion && (
          <>
            <div className={`feedback ${overfitConclusion === 'test' ? 'good' : 'neutral'}`}><strong>{overfitConclusion === 'test' ? 'Oui.' : 'C’est précisément le piège.'}</strong><span>Un modèle peut devenir excellent pour reconnaître ses exemples sans apprendre une relation qui se généralise.</span></div>
            <div className="definition-inline"><span>Nouveau mot</span><strong>OVERFITTING</strong><p>Surapprentissage : le modèle s’adapte trop aux données d’entraînement et généralise moins bien.</p></div>
            <UnderTheHood><p>Avec <strong>k=1</strong>, chaque tir d’entraînement est son propre voisin le plus proche. Le modèle peut donc retrouver automatiquement son résultat : 100% sur train n’est pas surprenant.</p></UnderTheHood>
            <ContinueButton onClick={() => setStep(2)}>Essayer d’améliorer le test</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 2) {
    const latestRun = leakRuns.at(-1)
    const triedLeak = leakRuns.some((run) => run.features.includes('scoreChanged'))
    return (
      <LabShell
        visual={
          <div className="feature-lab-board">
            <span>Dernier score TEST</span>
            <strong>{latestRun ? `${Math.round(latestRun.score * 100)}%` : '—'}</strong>
            <small>{latestRun ? latestRun.features.map((feature) => leakFeatureLabels[feature].label).join(' + ') : 'Choisis des features puis lance le test'}</small>
          </div>
        }
      >
        <Eyebrow>Chapitre 06 · Feature hunt</Eyebrow>
        <h1>Peux-tu faire grimper le score test en choisissant de meilleures informations&nbsp;?</h1>
        <p className="lead">Compose plusieurs jeux de features et teste-les. Toutes les informations proposées sont présentes dans notre expérience, mais ça ne signifie pas qu’elles sont toutes légitimes pour prédire au moment du tir.</p>
        <div className="feature-toggle-grid">
          {(Object.keys(leakFeatureLabels) as LeakFeature[]).map((feature) => (
            <button key={feature} className={selectedLeakFeatures.includes(feature) ? 'selected' : ''} onClick={() => toggleLeakFeature(feature)}>
              <strong>{selectedLeakFeatures.includes(feature) ? '✓ ' : ''}{leakFeatureLabels[feature].label}</strong>
              <small>{leakFeatureLabels[feature].hint}</small>
            </button>
          ))}
        </div>
        <button className="primary-lab-button" disabled={selectedLeakFeatures.length === 0} onClick={testLeakSelection}>Entraîner + tester cette sélection</button>
        {leakRuns.length > 0 && (
          <div className="compact-run-list">
            {leakRuns.slice(-4).map((run, index) => <div key={`${run.features.join('-')}-${index}`}><span>{run.features.map((feature) => leakFeatureLabels[feature].label).join(' + ')}</span><strong>{Math.round(run.score * 100)}%</strong></div>)}
          </div>
        )}
        {!triedLeak ? (
          <p className="practice-gate">Une des features produit un bond spectaculaire. Essaie plusieurs combinaisons pour la trouver.</p>
        ) : (
          <div className="choice-row">
            <button className={`choice-button ${leakChoice === 'valid' ? 'selected' : ''}`} onClick={() => setLeakChoice('valid')}>Je garde la meilleure, peu importe pourquoi</button>
            <button className={`choice-button ${leakChoice === 'leak' ? 'selected' : ''}`} onClick={() => setLeakChoice('leak')}>Je retire l’info qui vient après le tir</button>
          </div>
        )}
        {triedLeak && leakChoice && (
          <>
            <div className={`feedback ${leakChoice === 'leak' ? 'good' : 'neutral'}`}><strong>{leakChoice === 'leak' ? 'Exactement.' : 'Le score cache une triche.'}</strong><span>Le changement du score est une conséquence presque directe du but. Cette information n’existe pas encore au moment où l’on veut prédire.</span></div>
            <ContinueButton onClick={() => setStep(3)}>Nommer cette fuite</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={
        <div className="guardrail-board">
          <div><span>1</span><strong>Test inconnu</strong><small>pour détecter ce qui ne généralise pas</small></div>
          <div><span>2</span><strong>Features disponibles à temps</strong><small>pas d’information provenant du résultat futur</small></div>
        </div>
      }
    >
      <Eyebrow>Chapitre 06 · Leakage</Eyebrow>
      <h1>Tu viens de provoquer toi-même deux faux succès.</h1>
      <p className="lead"><strong>Overfitting</strong> : tu as poussé le modèle à coller au train. <strong>Data leakage</strong> : tu lui as donné une information qu’il n’aurait pas au moment de la prédiction.</p>
      <div className="reveal-card"><span>Réflexe à garder</span><strong>Avant de célébrer un score : sur quelles données est-il mesuré, et chaque feature existait-elle réellement au moment où la prédiction devait être faite ?</strong></div>
      <p className="microcopy">Pour repère, notre régression logistique distance + angle reste à {Math.round(logisticTrain * 100)}% sur train et {Math.round(logisticTest * 100)}% sur test avec ce seed.</p>
      <ContinueButton onClick={onComplete}>Passer au chapitre 07</ContinueButton>
    </LabShell>
  )
}
