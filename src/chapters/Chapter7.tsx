import { useMemo, useState } from 'react'
import { FootballPitch } from '../components/FootballPitch'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { challengeShots, learningShots } from '../data/shots'
import { confusionMatrix } from '../ml/evaluation'
import { accuracy, predictProbability, shotLabels, shotRows, trainLogistic } from '../ml/logistic'
import { predictKnnProbability, trainKnn } from '../ml/knn'

type Props = {
  step: number
  setStep: (step: number) => void
  onComplete: () => void
}

type LabFeature = 'distance' | 'angle'
type ModelFamily = 'logistic' | 'knn'
type LabConfig = {
  model: ModelFamily
  features: LabFeature[]
  k: number
  threshold: number
}

type LabResult = {
  trainProbabilities: number[]
  testProbabilities: number[]
  trainAccuracy: number
  testAccuracy: number
  matrix: ReturnType<typeof confusionMatrix>
}

type RunSummary = {
  id: number
  config: LabConfig
  trainAccuracy: number
  testAccuracy: number
}

const trainLabels = shotLabels(learningShots)
const testLabels = shotLabels(challengeShots)
const defaultConfig: LabConfig = { model: 'logistic', features: ['distance', 'angle'], k: 3, threshold: 0.5 }

function runLab(config: LabConfig): LabResult {
  const trainRows = shotRows(learningShots, config.features)
  const testRows = shotRows(challengeShots, config.features)

  let trainProbabilities: number[]
  let testProbabilities: number[]

  if (config.model === 'logistic') {
    const model = trainLogistic(trainRows, trainLabels)
    trainProbabilities = trainRows.map((row) => predictProbability(model, row))
    testProbabilities = testRows.map((row) => predictProbability(model, row))
  } else {
    const model = trainKnn(trainRows, trainLabels)
    trainProbabilities = trainRows.map((row) => predictKnnProbability(model, row, config.k))
    testProbabilities = testRows.map((row) => predictKnnProbability(model, row, config.k))
  }

  return {
    trainProbabilities,
    testProbabilities,
    trainAccuracy: accuracy(trainProbabilities, trainLabels, config.threshold),
    testAccuracy: accuracy(testProbabilities, testLabels, config.threshold),
    matrix: confusionMatrix(testProbabilities, testLabels, config.threshold),
  }
}

export function Chapter7({ step, setStep, onComplete }: Props) {
  const [sameAnswer, setSameAnswer] = useState<'same' | 'different' | null>(null)
  const [draftModel, setDraftModel] = useState<ModelFamily>('logistic')
  const [draftFeatures, setDraftFeatures] = useState<LabFeature[]>(['distance', 'angle'])
  const [draftK, setDraftK] = useState(3)
  const [draftThreshold, setDraftThreshold] = useState(0.5)
  const [activeConfig, setActiveConfig] = useState<LabConfig | null>(null)
  const [runs, setRuns] = useState<RunSummary[]>([])
  const [selectedId, setSelectedId] = useState(challengeShots[0].id)
  const [inspectionThreshold, setInspectionThreshold] = useState(0.5)

  const defaultLogistic = useMemo(() => runLab(defaultConfig), [])
  const defaultKnn = useMemo(() => runLab({ ...defaultConfig, model: 'knn' }), [])
  const activeResult = useMemo(() => activeConfig ? runLab(activeConfig) : null, [activeConfig])

  const toggleFeature = (feature: LabFeature) => {
    setDraftFeatures((current) => current.includes(feature)
      ? current.filter((item) => item !== feature)
      : [...current, feature])
  }

  const executeRun = () => {
    if (draftFeatures.length === 0) return
    const config: LabConfig = {
      model: draftModel,
      features: [...draftFeatures],
      k: draftK,
      threshold: draftThreshold,
    }
    const result = runLab(config)
    setActiveConfig(config)
    setInspectionThreshold(config.threshold)
    setRuns((current) => [...current, {
      id: current.length + 1,
      config,
      trainAccuracy: result.trainAccuracy,
      testAccuracy: result.testAccuracy,
    }])
  }

  if (step === 0) {
    return (
      <LabShell
        visual={
          <div className="model-comparison">
            <div className="model-card"><span>Modèle A</span><strong>logistique</strong><div className="model-score">{Math.round(defaultLogistic.testAccuracy * 100)}%</div><small>sur test</small></div>
            <div className="plus-sign">VS</div>
            <div className="model-card emphasized"><span>Modèle B</span><strong>3 voisins</strong><div className="model-score">{Math.round(defaultKnn.testAccuracy * 100)}%</div><small>sur test</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 07 · Deux façons d’apprendre</Eyebrow>
        <h1>Un score proche signifie-t-il que les modèles font la même chose&nbsp;?</h1>
        <p className="lead">Ils voient les mêmes tirs et les mêmes features, mais ils ne construisent pas leurs prédictions de la même façon.</p>
        <div className="choice-row">
          <button className={`choice-button ${sameAnswer === 'same' ? 'selected' : ''}`} onClick={() => setSameAnswer('same')}>Oui, à peu près</button>
          <button className={`choice-button ${sameAnswer === 'different' ? 'selected' : ''}`} onClick={() => setSameAnswer('different')}>Le score ne suffit pas</button>
        </div>
        {sameAnswer && (
          <>
            <div className={`feedback ${sameAnswer === 'different' ? 'good' : 'neutral'}`}><strong>Le score ne raconte pas tout.</strong><span>Cette fois, au lieu que je te montre les différences, tu vas construire et comparer les configurations toi-même.</span></div>
            <ContinueButton onClick={() => setStep(1)}>Ouvrir le labo</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 1) {
    const triedBothFamilies = runs.some((run) => run.config.model === 'logistic') && runs.some((run) => run.config.model === 'knn')
    const canContinue = runs.length >= 3 && triedBothFamilies && activeConfig && activeResult

    return (
      <LabShell
        visual={
          <div className="sandbox-scoreboard">
            <div><span>TRAIN</span><strong>{activeResult ? `${Math.round(activeResult.trainAccuracy * 100)}%` : '—'}</strong></div>
            <div><span>TEST</span><strong>{activeResult ? `${Math.round(activeResult.testAccuracy * 100)}%` : '—'}</strong></div>
            <small>{activeConfig ? `${activeConfig.model === 'logistic' ? 'Logistique' : `k-NN · k=${activeConfig.k}`} · ${activeConfig.features.join(' + ')} · seuil ${Math.round(activeConfig.threshold * 100)}%` : 'Aucune expérience lancée'}</small>
          </div>
        }
      >
        <Eyebrow>Chapitre 07 · Ton premier mini-labo</Eyebrow>
        <h1>Construis plusieurs expériences et garde une trace des résultats.</h1>
        <p className="lead">Change une chose, entraîne, regarde train/test, puis essaie autre chose. Il n’y a pas une configuration secrète à découvrir.</p>

        <div className="sandbox-controls">
          <div className="sandbox-control-block">
            <span>Famille</span>
            <div className="segmented-control">
              <button className={draftModel === 'logistic' ? 'selected' : ''} onClick={() => setDraftModel('logistic')}>Logistique</button>
              <button className={draftModel === 'knn' ? 'selected' : ''} onClick={() => setDraftModel('knn')}>k-NN</button>
            </div>
          </div>
          <div className="sandbox-control-block">
            <span>Features</span>
            <div className="segmented-control">
              {(['distance', 'angle'] as LabFeature[]).map((feature) => <button key={feature} className={draftFeatures.includes(feature) ? 'selected' : ''} onClick={() => toggleFeature(feature)}>{feature}</button>)}
            </div>
          </div>
          {draftModel === 'knn' && (
            <div className="sandbox-control-block">
              <label htmlFor="lab-k">Voisins · k = {draftK}</label>
              <input id="lab-k" type="range" min="1" max="7" step="2" value={draftK} onChange={(event) => setDraftK(Number(event.target.value))} />
            </div>
          )}
          <div className="sandbox-control-block">
            <label htmlFor="lab-threshold">Seuil de décision · {Math.round(draftThreshold * 100)}%</label>
            <input id="lab-threshold" type="range" min="0.1" max="0.9" step="0.1" value={draftThreshold} onChange={(event) => setDraftThreshold(Number(event.target.value))} />
          </div>
        </div>

        <button className="primary-lab-button" disabled={draftFeatures.length === 0} onClick={executeRun}>Entraîner + tester</button>
        {draftFeatures.length === 0 && <p className="practice-gate">Choisis au moins une feature pour entraîner un modèle.</p>}

        {runs.length > 0 && (
          <div className="lab-run-table">
            {runs.slice(-5).map((run) => (
              <div key={run.id}>
                <span>#{run.id}</span>
                <strong>{run.config.model === 'logistic' ? 'Logistique' : `k-NN k=${run.config.k}`}</strong>
                <small>{run.config.features.join(' + ')} · seuil {Math.round(run.config.threshold * 100)}%</small>
                <b>{Math.round(run.trainAccuracy * 100)}% / {Math.round(run.testAccuracy * 100)}%</b>
              </div>
            ))}
          </div>
        )}

        {!canContinue && <p className="practice-gate">Fais au moins 3 expériences et essaie les deux familles de modèles avant de continuer.</p>}
        {canContinue && (
          <>
            <UnderTheHood><p>À chaque clic sur « Entraîner + tester », l’app reconstruit réellement le modèle avec les features choisies. Le seuil ne change pas l’apprentissage : il change seulement le point à partir duquel une probabilité devient « je prédis but ».</p></UnderTheHood>
            <ContinueButton onClick={() => setStep(2)}>Inspecter les erreurs de ta dernière expérience</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 2) {
    const baseConfig = activeConfig ?? defaultConfig
    const inspectionConfig = { ...baseConfig, threshold: inspectionThreshold }
    const result = runLab(inspectionConfig)
    const selectedIndex = challengeShots.findIndex((shot) => shot.id === selectedId)
    const selectedShot = challengeShots[selectedIndex]
    const selectedProbability = result.testProbabilities[selectedIndex]
    const misclassifiedIds = challengeShots
      .filter((shot, index) => (result.testProbabilities[index] >= inspectionThreshold) !== shot.goal)
      .map((shot) => shot.id)

    return (
      <LabShell
        visual={
          <div className="visual-stack">
            <FootballPitch shots={challengeShots} selectedId={selectedId} highlightIds={misclassifiedIds} onSelect={(shot) => setSelectedId(shot.id)} />
            <div className="inspection-probability"><span>{selectedShot.id}</span><strong>{Math.round(selectedProbability * 100)}%</strong><small>réalité : {selectedShot.goal ? 'BUT' : 'PAS BUT'}</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 07 · Inspecte, puis change la règle de décision</Eyebrow>
        <h1>Les halos indiquent les tirs mal classés avec ton seuil actuel.</h1>
        <p className="lead">Clique sur les tirs puis déplace le seuil. Les probabilités du modèle restent identiques, mais ta décision « but / pas but » change.</p>
        <div className="threshold-lab">
          <label htmlFor="inspection-threshold">Seuil : <strong>{Math.round(inspectionThreshold * 100)}%</strong></label>
          <input id="inspection-threshold" type="range" min="0.1" max="0.9" step="0.1" value={inspectionThreshold} onChange={(event) => setInspectionThreshold(Number(event.target.value))} />
        </div>
        <div className="confusion-grid">
          <div><span>But → But</span><strong>{result.matrix.truePositive}</strong></div>
          <div><span>Pas but → Pas but</span><strong>{result.matrix.trueNegative}</strong></div>
          <div className="error"><span>Pas but → But</span><strong>{result.matrix.falsePositive}</strong><small>faux positif</small></div>
          <div className="error"><span>But → Pas but</span><strong>{result.matrix.falseNegative}</strong><small>faux négatif</small></div>
        </div>
        <div className="thought-prompt"><strong>Observe le compromis</strong><span>En baissant le seuil, le modèle annonce davantage de buts : certains faux négatifs disparaissent, mais des faux positifs peuvent apparaître. Le « bon » seuil dépend du coût des erreurs.</span></div>
        <ContinueButton onClick={() => setStep(3)}>Boucler le Cycle 1</ContinueButton>
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
          <div><span>5</span><strong>EXPÉRIMENTER</strong><small>modifier une chose et comparer</small></div>
        </div>
      }
    >
      <Eyebrow>Cycle 1 terminé · Du problème à l’expérience</Eyebrow>
      <h1>Cette fois, tu n’as pas seulement regardé des modèles : tu les as manipulés.</h1>
      <p className="lead">Tu as choisi une taille de test, produit tes propres probabilités, provoqué de l’overfitting, testé des features, comparé deux familles et déplacé un seuil de décision.</p>
      <div className="checkpoint"><span>Le réflexe central</span><strong>Changer une chose → entraîner → mesurer sur de l’inconnu → inspecter les erreurs → seulement ensuite conclure.</strong></div>
      <div className="next-teaser"><span>Suite naturelle</span><strong>Faire la même chose sur de vraies données de match, avec davantage de tirs et de vraies features football.</strong></div>
      <ContinueButton onClick={onComplete}>Terminer le cycle 1</ContinueButton>
    </LabShell>
  )
}
