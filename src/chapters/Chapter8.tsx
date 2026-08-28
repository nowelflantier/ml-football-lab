import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { realShots } from '../data/realShots'
import { confusionMatrix, stratifiedSplit } from '../ml/evaluation'
import { accuracy, predictProbability, shotLabels, shotRows, trainLogistic } from '../ml/logistic'

type Props = {
  step: number
  setStep: (step: number) => void
  onComplete: () => void
}

export function Chapter8({ step, setStep, onComplete }: Props) {
  const [baselineGuess, setBaselineGuess] = useState<number | null>(null)
  const [modelChoice, setModelChoice] = useState<'model' | 'dumb' | null>(null)
  const [threshold, setThreshold] = useState(50)
  const [thresholdTouched, setThresholdTouched] = useState(false)

  const goalCount = realShots.filter((shot) => shot.goal).length
  const missCount = realShots.length - goalCount
  const baselinePercent = Math.round((missCount / realShots.length) * 100)

  const experiment = useMemo(() => {
    const split = stratifiedSplit(realShots, 29, 0.3)
    const trainRows = shotRows(split.train, ['distance', 'angle'])
    const testRows = shotRows(split.test, ['distance', 'angle'])
    const trainLabels = shotLabels(split.train)
    const testLabels = shotLabels(split.test)
    const model = trainLogistic(trainRows, trainLabels)
    const probabilities = testRows.map((row) => predictProbability(model, row))
    const modelAccuracy = accuracy(probabilities, testLabels)
    const baselineAccuracy = testLabels.filter((label) => label === 0).length / testLabels.length
    return { split, testLabels, probabilities, modelAccuracy, baselineAccuracy }
  }, [])

  const matrix = confusionMatrix(experiment.probabilities, experiment.testLabels, threshold / 100)

  if (step === 0) {
    const choices = [50, 75, baselinePercent]
    return (
      <LabShell
        visual={
          <div className="distribution-board">
            <div className="distribution-total"><span>Vrais tirs StatsBomb</span><strong>{realShots.length}</strong><small>10 matchs · Bundesliga 2023/24</small></div>
            <div className="distribution-split"><div><strong>{goalCount}</strong><span>buts</span></div><div><strong>{missCount}</strong><span>tirs sans but</span></div></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 08 · Un bon score peut ne rien vouloir dire</Eyebrow>
        <h1>Et si notre « modèle » répondait toujours PAS BUT&nbsp;?</h1>
        <p className="lead">Regarde la répartition à gauche. Sans apprendre quoi que ce soit, combien de tirs ce modèle idiot classerait-il correctement&nbsp;?</p>
        <div className="intent-card"><strong>Ce que tu dois faire</strong><span>Estime le score d’un modèle qui ne prédit jamais de but. On veut d’abord savoir ce qu’un modèle intelligent doit battre.</span></div>
        <div className="choice-row three-choices">
          {choices.map((choice) => <button key={choice} className={`choice-button ${baselineGuess === choice ? 'selected' : ''}`} onClick={() => setBaselineGuess(choice)}>{choice}%</button>)}
        </div>
        {baselineGuess !== null && (
          <>
            <div className={`feedback ${baselineGuess === baselinePercent ? 'good' : 'neutral'}`}><strong>{baselinePercent}%.</strong><span>Il suffit de répondre « PAS BUT » sur les {realShots.length} tirs pour être correct {baselinePercent}% du temps. Il n’a pourtant rien appris.</span></div>
            <ContinueButton onClick={() => setStep(1)}>Comparer avec notre vrai modèle</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 1) {
    const modelPercent = Math.round(experiment.modelAccuracy * 100)
    const dumbPercent = Math.round(experiment.baselineAccuracy * 100)
    return (
      <LabShell
        visual={
          <div className="model-comparison">
            <div className="model-card emphasized"><span>Distance + angle</span><strong>modèle appris</strong><div className="model-score">{modelPercent}%</div><small>sur les tirs de test</small></div>
            <div className="plus-sign">VS</div>
            <div className="model-card"><span>Toujours PAS BUT</span><strong>aucun apprentissage</strong><div className="model-score">{dumbPercent}%</div><small>sur les mêmes tirs</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 08 · Battre un point de départ</Eyebrow>
        <h1>Lequel est vraiment meilleur&nbsp;?</h1>
        <p className="lead">Si tu ne regardes que le pourcentage de bonnes réponses, tu peux facilement te raconter une histoire trop simple.</p>
        <div className="choice-row">
          <button className={`choice-button ${modelChoice === 'model' ? 'selected' : ''}`} onClick={() => setModelChoice('model')}>Le modèle appris</button>
          <button className={`choice-button ${modelChoice === 'dumb' ? 'selected' : ''}`} onClick={() => setModelChoice('dumb')}>Le modèle idiot</button>
        </div>
        {modelChoice && (
          <>
            <div className="feedback neutral"><strong>Le score global ne suffit pas.</strong><span>La vraie question devient : quelles erreurs font-ils&nbsp;? Un modèle peut avoir beaucoup de bonnes réponses simplement parce que la classe « pas but » domine.</span></div>
            <div className="definition-inline"><span>Premier nouveau repère</span><strong>BASELINE</strong><p>Un point de comparaison volontairement simple. Notre modèle doit apporter quelque chose de plus qu’une règle idiote qui profite de la distribution des données.</p></div>
            <ContinueButton onClick={() => setStep(2)}>Regarder les types d’erreurs</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 2) {
    return (
      <LabShell
        visual={
          <div className="plain-confusion">
            <div className="good-cell"><span>Buts repérés</span><strong>{matrix.truePositive}</strong><small>le modèle dit BUT, et il y a but</small></div>
            <div className="warning-cell"><span>Fausses alertes</span><strong>{matrix.falsePositive}</strong><small>le modèle dit BUT, mais le tir rate</small></div>
            <div className="danger-cell"><span>Buts ratés</span><strong>{matrix.falseNegative}</strong><small>le modèle dit PAS BUT, mais il y a but</small></div>
            <div><span>Ratés bien écartés</span><strong>{matrix.trueNegative}</strong><small>le modèle dit PAS BUT, et le tir rate</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 08 · Choisir ce que veut dire « BUT »</Eyebrow>
        <h1>Change la barre à franchir pour prédire un but.</h1>
        <p className="lead">Le modèle produit déjà une probabilité. Ici, tu ne le réentraînes pas : tu changes seulement le niveau de confiance à partir duquel tu transformes cette probabilité en « BUT ».</p>
        <div className="intent-card"><strong>À observer</strong><span>Baisse le seuil : tu repèreras généralement plus de vrais buts, mais tu déclencheras aussi plus de fausses alertes. Monte-le : l’inverse devrait se produire.</span></div>
        <div className="slider-card">
          <label htmlFor="goal-threshold">Dire BUT à partir de</label>
          <div className="slider-value">{threshold}%</div>
          <input id="goal-threshold" type="range" min="5" max="80" step="5" value={threshold} onChange={(event) => { setThreshold(Number(event.target.value)); setThresholdTouched(true) }} />
          <div className="range-labels"><span>plus permissif</span><span>plus strict</span></div>
        </div>
        {thresholdTouched && <ContinueButton onClick={() => setStep(3)}>Mettre les vrais noms sur ces erreurs</ContinueButton>}
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={
        <div className="term-map">
          <div><span>But repéré</span><strong>TRUE POSITIVE</strong></div>
          <div><span>Fausse alerte</span><strong>FALSE POSITIVE</strong></div>
          <div><span>But raté</span><strong>FALSE NEGATIVE</strong></div>
          <div><span>Raté bien écarté</span><strong>TRUE NEGATIVE</strong></div>
        </div>
      }
    >
      <Eyebrow>Chapitre 08 · Class imbalance & erreurs</Eyebrow>
      <h1>« 90% correct » n’est plus une conclusion.</h1>
      <p className="lead">Tu sais maintenant demander : 90% par rapport à quelle baseline, sur quelle répartition, et avec quels types d’erreurs&nbsp;?</p>
      <div className="reveal-card"><span>Concept débloqué</span><strong>Quand une classe est beaucoup plus fréquente que l’autre, l’accuracy peut être flatteuse sans que le modèle soit vraiment utile.</strong></div>
      <UnderTheHood>
        <p><strong>Recall</strong> répond à « parmi les vrais buts, combien ai-je repérés ? ». <strong>Precision</strong> répond à « parmi mes prédictions BUT, combien étaient réellement des buts ? ». Pas besoin de les mémoriser maintenant : tu viens déjà de manipuler les deux tensions avec le seuil.</p>
      </UnderTheHood>
      <ContinueButton onClick={onComplete}>Passer aux vraies données source</ContinueButton>
    </LabShell>
  )
}
