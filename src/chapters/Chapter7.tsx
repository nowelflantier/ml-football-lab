import { useMemo, useState } from 'react'
import { FootballPitch } from '../components/FootballPitch'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { challengeShots, learningShots } from '../data/shots'
import { accuracy, predictProbability, shotLabels, shotRows, trainLogistic } from '../ml/logistic'
import { predictKnnProbability, trainKnn } from '../ml/knn'

type Props = {
  step: number
  setStep: (step: number) => void
  onComplete: () => void
}

export function Chapter7({ step, setStep, onComplete }: Props) {
  const [sameAnswer, setSameAnswer] = useState<'same' | 'different' | null>(null)
  const [selectedId, setSelectedId] = useState(challengeShots[0].id)
  const [k, setK] = useState(3)
  const trainRows = useMemo(() => shotRows(learningShots, ['distance', 'angle']), [])
  const testRows = useMemo(() => shotRows(challengeShots, ['distance', 'angle']), [])
  const trainLabels = useMemo(() => shotLabels(learningShots), [])
  const testLabels = useMemo(() => shotLabels(challengeShots), [])
  const logistic = useMemo(() => trainLogistic(trainRows, trainLabels), [trainLabels, trainRows])
  const knn = useMemo(() => trainKnn(trainRows, trainLabels), [trainLabels, trainRows])
  const logisticProbabilities = useMemo(() => testRows.map((row) => predictProbability(logistic, row)), [logistic, testRows])
  const knnProbabilities = useMemo(() => testRows.map((row) => predictKnnProbability(knn, row, k)), [k, knn, testRows])
  const logisticAccuracy = accuracy(logisticProbabilities, testLabels)
  const knnAccuracy = accuracy(knnProbabilities, testLabels)

  if (step === 0) {
    const k3Probabilities = testRows.map((row) => predictKnnProbability(knn, row, 3))
    const k3Accuracy = accuracy(k3Probabilities, testLabels)
    return (
      <LabShell
        visual={
          <div className="model-comparison">
            <div className="model-card"><span>Modèle A</span><strong>logistique</strong><div className="model-score">{Math.round(logisticAccuracy * 100)}%</div><small>sur test</small></div>
            <div className="plus-sign">VS</div>
            <div className="model-card emphasized"><span>Modèle B</span><strong>3 voisins</strong><div className="model-score">{Math.round(k3Accuracy * 100)}%</div><small>sur test</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 07 · Deux façons d’apprendre</Eyebrow>
        <h1>Même score. Même modèle&nbsp;?</h1>
        <p className="lead">Deux méthodes différentes obtiennent ici le même nombre de bonnes réponses sur les tirs cachés.</p>
        <div className="choice-row">
          <button className={`choice-button ${sameAnswer === 'same' ? 'selected' : ''}`} onClick={() => setSameAnswer('same')}>Ils font donc la même chose</button>
          <button className={`choice-button ${sameAnswer === 'different' ? 'selected' : ''}`} onClick={() => setSameAnswer('different')}>Le score ne suffit pas</button>
        </div>
        {sameAnswer && (
          <>
            <div className={`feedback ${sameAnswer === 'different' ? 'good' : 'neutral'}`}><strong>Le score ne raconte pas tout.</strong><span>Regardons les probabilités produites tir par tir : les deux méthodes peuvent réussir les mêmes cas pour des raisons très différentes.</span></div>
            <ContinueButton onClick={() => setStep(1)}>Inspecter leurs prédictions</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 1) {
    const selectedIndex = challengeShots.findIndex((shot) => shot.id === selectedId)
    const shot = challengeShots[selectedIndex]
    const logisticProbability = logisticProbabilities[selectedIndex]
    const knnProbability = predictKnnProbability(knn, testRows[selectedIndex], 3)
    return (
      <LabShell
        visual={
          <div className="visual-stack">
            <FootballPitch shots={challengeShots} selectedId={selectedId} onSelect={(item) => setSelectedId(item.id)} />
            <div className="dual-probability"><div><span>Logistique</span><strong>{Math.round(logisticProbability * 100)}%</strong></div><div><span>3 voisins</span><strong>{Math.round(knnProbability * 100)}%</strong></div></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 07 · Comportements différents</Eyebrow>
        <h1>Clique sur les tirs. Les deux modèles ne « pensent » pas pareil.</h1>
        <p className="lead">La logistique apprend une relation globale et lisse. Le modèle des voisins regarde surtout les exemples d’apprentissage proches du tir courant.</p>
        <div className="shot-inspector">
          <div><span>Tir</span><strong>{shot.id}</strong></div>
          <div><span>Distance</span><strong>{shot.distance.toFixed(1)} m</strong></div>
          <div><span>Angle</span><strong>{shot.angle.toFixed(0)}°</strong></div>
          <div><span>Réalité</span><strong>{shot.goal ? 'BUT' : 'PAS BUT'}</strong></div>
        </div>
        <div className="definition-inline"><span>Nouveau concept</span><strong>FAMILLE DE MODÈLES</strong><p>Des méthodes différentes peuvent apprendre des types de relations différents à partir des mêmes données.</p></div>
        <ContinueButton onClick={() => setStep(2)}>Jouer avec la flexibilité</ContinueButton>
      </LabShell>
    )
  }

  if (step === 2) {
    return (
      <LabShell
        visual={
          <div className="neighbor-stage">
            <span>Nombre de voisins consultés</span>
            <strong>k = {k}</strong>
            <div className="neighbor-dots">{Array.from({ length: k }, (_, index) => <i key={index} />)}</div>
            <small>Score test : {Math.round(knnAccuracy * 100)}%</small>
          </div>
        }
      >
        <Eyebrow>Chapitre 07 · Hyperparamètre</Eyebrow>
        <h1>Un même modèle peut lui aussi être réglé.</h1>
        <p className="lead">Avec k=1, on copie presque un exemple. Avec davantage de voisins, la prédiction devient moins sensible à un seul tir particulier.</p>
        <div className="slider-card">
          <label htmlFor="neighbor-count">Nombre de voisins k</label>
          <div className="slider-value">{k}</div>
          <input id="neighbor-count" type="range" min="1" max="7" step="2" value={k} onChange={(event: { target: { value: string } }) => setK(Number(event.target.value))} />
          <div className="range-labels"><span>1 · très local</span><span>7 · plus lissé</span></div>
        </div>
        <p className="microcopy">Le score est recalculé instantanément sur les tirs de test. Essaie 1, 3, 5 et 7.</p>
        <UnderTheHood>
          <p><strong>k</strong> est un hyperparamètre : une valeur choisie par nous avant la prédiction, contrairement aux poids de la régression logistique qui sont appris à partir des données.</p>
        </UnderTheHood>
        <ContinueButton onClick={() => setStep(3)}>Boucler le parcours</ContinueButton>
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={
        <div className="learning-map extended-map">
          <div><span>1</span><strong>CIBLE</strong><small>ce qu’on veut prédire</small></div><b>→</b>
          <div><span>2</span><strong>FEATURES</strong><small>ce que le modèle voit</small></div><b>→</b>
          <div><span>3</span><strong>TRAIN</strong><small>ce qui sert à apprendre</small></div><b>→</b>
          <div><span>4</span><strong>TEST</strong><small>ce qui sert à vérifier</small></div><b>→</b>
          <div><span>5</span><strong>COMPARER</strong><small>erreurs et comportements</small></div>
        </div>
      }
    >
      <Eyebrow>Cycle 1 terminé · Du problème au modèle</Eyebrow>
      <h1>Tu ne regardes plus un score de modèle de la même façon.</h1>
      <p className="lead">Tu sais maintenant construire le raisonnement complet : définir ce qu’on prédit, choisir ce qu’on montre au modèle, séparer apprentissage et test, repérer overfitting/leakage et comparer plusieurs façons d’apprendre.</p>
      <div className="checkpoint"><span>Le réflexe central</span><strong>« Je ne demande pas seulement quel modèle a le meilleur score. Je demande sur quelles données, avec quelles features, et comment il se comporte sur des cas qu’il n’a jamais vus. »</strong></div>
      <div className="next-teaser"><span>Suite naturelle</span><strong>Passer du petit labo pédagogique à de vraies données de match : distribution des tirs, nettoyage, features plus riches, calibration et vrais modèles xG.</strong></div>
      <ContinueButton onClick={onComplete}>Terminer le cycle 1</ContinueButton>
    </LabShell>
  )
}
