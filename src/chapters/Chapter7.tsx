import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { realShots } from '../data/realShots'
import { stratifiedSplit } from '../ml/evaluation'
import { accuracy, shotLabels } from '../ml/logistic'
import { predictKnnProbability, trainKnn } from '../ml/knn'

const kOptions = [1, 3, 5, 9, 15]

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type Score = { train: number; test: number; trainCorrect: number; testCorrect: number }

export function Chapter7({ step, setStep, onComplete }: Props) {
  const split = useMemo(() => stratifiedSplit(realShots, 71, 0.3), [])
  const trainRows = useMemo(() => split.train.map((shot) => [shot.distance]), [split.train])
  const testRows = useMemo(() => split.test.map((shot) => [shot.distance]), [split.test])
  const trainLabels = useMemo(() => shotLabels(split.train), [split.train])
  const testLabels = useMemo(() => shotLabels(split.test), [split.test])
  const model = useMemo(() => trainKnn(trainRows, trainLabels), [trainRows, trainLabels])
  const [tried, setTried] = useState<number[]>([])
  const [selectedK, setSelectedK] = useState(5)
  const [comparisonTouched, setComparisonTouched] = useState(false)

  const scores = useMemo(() => Object.fromEntries(kOptions.map((k) => {
    const trainProbabilities = trainRows.map((row) => predictKnnProbability(model, row, k))
    const testProbabilities = testRows.map((row) => predictKnnProbability(model, row, k))
    const trainScore = accuracy(trainProbabilities, trainLabels)
    const testScore = accuracy(testProbabilities, testLabels)
    return [k, {
      train: trainScore,
      test: testScore,
      trainCorrect: Math.round(trainScore * trainLabels.length),
      testCorrect: Math.round(testScore * testLabels.length),
    }]
  })) as Record<number, Score>, [model, testLabels, testRows, trainLabels, trainRows])

  const tryK = (k: number) => {
    setSelectedK(k)
    setTried((current) => current.includes(k) ? current : [...current, k])
  }
  const selected = scores[selectedK]

  if (step === 0) return (
    <LabShell visual={<SelfNeighborVisual />}>
      <Eyebrow>Chapitre 07 · Quand apprendre devient mémoriser</Eyebrow>
      <h1>Reprenons uniquement la méthode des voisins.</h1>
      <p className="lead">Au chapitre précédent, k-NN estimait un nouveau tir en regardant des tirs passés proches. Maintenant on va lui demander quelque chose de volontairement suspect&nbsp;: être excellent sur les tirs qui ont déjà servi à apprendre.</p>
      <div className="concrete-story-card">
        <span>Le piège à anticiper</span>
        <strong>Si k = 1 et que je demande au modèle de « prédire » un tir d’apprentissage…</strong>
        <small>…son voisin le plus proche peut être le tir lui-même.</small>
      </div>
      <ContinueButton onClick={() => setStep(1)}>Tester plusieurs valeurs de k</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    const foundPerfect = tried.some((k) => scores[k].train === 1)
    return (
      <LabShell visual={<KScoreBoard tried={tried} scores={scores} selectedK={selectedK} mode="train" />}>
        <Eyebrow>07.1 · Optimise volontairement le mauvais objectif</Eyebrow>
        <h1>Fais monter le score sur les exemples déjà connus.</h1>
        <p className="lead">Pour l’instant, tu ne vois que la performance sur les tirs d’apprentissage. Essaie plusieurs valeurs de k.</p>
        <div className="neighbor-choice-row">{kOptions.map((k) => <button key={k} className={selectedK === k && tried.includes(k) ? 'selected' : ''} onClick={() => tryK(k)}>k = {k}</button>)}</div>
        {tried.includes(selectedK) && <div className="plain-explanation"><strong>Avec k = {selectedK}</strong><span>{selected.trainCorrect}/{trainLabels.length} tirs d’apprentissage sont classés correctement, soit {Math.round(selected.train * 100)}%.</span></div>}
        {!foundPerfect ? <p className="practice-gate">Trouve le réglage qui atteint 100% sur les exemples d’apprentissage.</p> : (
          <>
            <div className="feedback good"><strong>k = 1 atteint 100%.</strong><span>Mais ce résultat est presque trop facile&nbsp;: chaque tir connu peut se retrouver lui-même comme voisin.</span></div>
            <ContinueButton onClick={() => setStep(2)}>Tester ces mêmes réglages sur de nouveaux tirs</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 2) return (
    <LabShell visual={<KScoreBoard tried={tried.length >= 3 ? tried : kOptions} scores={scores} selectedK={selectedK} mode="both" />}>
      <Eyebrow>07.2 · Le vrai contrôle</Eyebrow>
      <h1>Le champion des exemples connus n’est pas forcément le meilleur sur l’inconnu.</h1>
      <p className="lead">Le même réglage est maintenant évalué sur des tirs que le modèle n’a jamais utilisés pour apprendre.</p>
      <div className="neighbor-choice-row">{kOptions.map((k) => <button key={k} className={selectedK === k ? 'selected' : ''} onClick={() => { setSelectedK(k); setComparisonTouched(true) }}>Comparer k = {k}</button>)}</div>
      <div className="two-count-cards">
        <div><span>Exemples connus</span><strong>{selected.trainCorrect}/{trainLabels.length}</strong><small>{Math.round(selected.train * 100)}% correct</small></div>
        <div><span>Tirs jamais vus</span><strong>{selected.testCorrect}/{testLabels.length}</strong><small>{Math.round(selected.test * 100)}% correct</small></div>
      </div>
      <div className="plain-explanation"><strong>Ce que tu cherches</strong><span>Pas le réglage qui mémorise le mieux le passé. Tu veux un réglage dont le comportement <b>tient encore sur l’inconnu</b>. Essaie k=1 puis quelques valeurs plus grandes.</span></div>
      <ContinueButton disabled={!comparisonTouched} onClick={() => setStep(3)}>Nommer le piège</ContinueButton>
    </LabShell>
  )

  return (
    <LabShell visual={<OverfitVisual train={scores[1].train} test={scores[1].test} />}>
      <Eyebrow>Chapitre 07 · Surapprentissage</Eyebrow>
      <h1>Un modèle peut apprendre trop précisément ses exemples.</h1>
      <p className="lead">Avec k=1, le score parfait sur les données connues ne prouve presque rien&nbsp;: le mécanisme permet de retrouver exactement les cas déjà vus. Dès qu’on passe à de nouveaux tirs, cette perfection disparaît.</p>
      <div className="reveal-card"><span>Nom technique</span><strong>Overfitting / surapprentissage : le modèle colle tellement aux données d’apprentissage qu’il généralise moins bien à de nouveaux exemples.</strong></div>
      <UnderTheHood><p>k contrôle ici la « localité » du raisonnement. k=1 est extrêmement local. Augmenter k oblige la prédiction à résumer davantage d’exemples voisins, ce qui peut réduire la mémorisation — sans garantir automatiquement un meilleur modèle.</p></UnderTheHood>
      <div className="checkpoint"><span>Nouveau réflexe</span><strong>Un score excellent sur TRAIN est une information sur les exemples connus. Pour juger ce qui a été appris, je regarde aussi des données inconnues.</strong></div>
      <ContinueButton onClick={onComplete}>Passer à la baseline et aux erreurs</ContinueButton>
    </LabShell>
  )
}

function SelfNeighborVisual() {
  return <div className="concrete-story-card wide"><span>Exemple</span><strong>Tir connu à 11,2 m</strong><b>→ son voisin le plus proche →</b><strong>le même tir à 11,2 m</strong><small>Avec k=1, mémoriser les exemples d’apprentissage devient très facile.</small></div>
}

function KScoreBoard({ tried, scores, selectedK, mode }: { tried: number[]; scores: Record<number, Score>; selectedK: number; mode: 'train' | 'both' }) {
  return <div className="k-training-lab"><span>{mode === 'train' ? 'Score sur exemples connus' : 'Connu vs inconnu'}</span><div className="k-result-row">{kOptions.map((k) => <div key={k} className={selectedK === k ? 'active' : ''}><small>k = {k}</small><strong>{tried.includes(k) ? `${Math.round(scores[k].train * 100)}%` : '?'}</strong>{mode === 'both' && tried.includes(k) && <span>test {Math.round(scores[k].test * 100)}%</span>}</div>)}</div></div>
}

function OverfitVisual({ train, test }: { train: number; test: number }) {
  return <div className="overfit-simple-board"><div><span>k=1 · exemples connus</span><strong>{Math.round(train * 100)}%</strong></div><b>≠</b><div><span>k=1 · nouveaux tirs</span><strong>{Math.round(test * 100)}%</strong></div></div>
}
