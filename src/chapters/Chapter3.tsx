import { useMemo, useState } from 'react'
import { FootballPitch } from '../components/FootballPitch'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { learningShots, sameDistancePair } from '../data/shots'
import { accuracy, predictProbability, shotLabels, shotRows, trainLogistic } from '../ml/logistic'

const featureChoices = [
  { id: 'distance', label: 'Distance au but', direct: true },
  { id: 'angle', label: 'Angle vers le but', direct: true },
  { id: 'shirt', label: 'Numéro de maillot', direct: false },
  { id: 'minute', label: 'Minute du match', direct: false },
  { id: 'stadium', label: 'Nom du stade', direct: false },
  { id: 'temperature', label: 'Température', direct: false },
]

type Props = {
  step: number
  setStep: (step: number) => void
  onComplete: () => void
}

export function Chapter3({ step, setStep, onComplete }: Props) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const labels = useMemo(() => shotLabels(learningShots), [])
  const oneFeatureModel = useMemo(() => trainLogistic(shotRows(learningShots, ['distance']), labels), [labels])
  const twoFeatureModel = useMemo(() => trainLogistic(shotRows(learningShots, ['distance', 'angle']), labels), [labels])
  const oneFeatureAccuracy = useMemo(() => accuracy(shotRows(learningShots, ['distance']).map((row) => predictProbability(oneFeatureModel, row)), labels), [labels, oneFeatureModel])
  const twoFeatureAccuracy = useMemo(() => accuracy(shotRows(learningShots, ['distance', 'angle']).map((row) => predictProbability(twoFeatureModel, row)), labels), [labels, twoFeatureModel])

  if (step === 0) {
    return (
      <LabShell
        visual={
          <div className="visual-stack">
            <FootballPitch shots={sameDistancePair} showLabels highlightIds={['A', 'B']} />
            <div className="pair-cards">
              {sameDistancePair.map((shot) => <div key={shot.id}><b>Tir {shot.id}</b><span>{shot.distance.toFixed(1)} m</span><span>angle {shot.angle}°</span></div>)}
            </div>
          </div>
        }
      >
        <Eyebrow>Chapitre 03 · Une information manque</Eyebrow>
        <h1>Même distance. Même tir&nbsp;?</h1>
        <p className="lead">Ces deux tirs sont à <strong>10,5 mètres</strong> du but. Pourtant, l’un est presque plein axe et l’autre très excentré.</p>
        <div className="thought-prompt"><strong>Problème</strong><span>Notre premier modèle ne reçoit que la distance. Pour lui, A et B sont donc identiques.</span></div>
        <div className="reveal-card"><span>Nouvelle information</span><strong>L’angle vers le but permet de décrire une différence que la distance ne voit pas.</strong></div>
        <ContinueButton onClick={() => setStep(1)}>Donnons-lui aussi l’angle</ContinueButton>
      </LabShell>
    )
  }

  if (step === 1) {
    return (
      <LabShell
        visual={
          <div className="model-comparison">
            <div className="model-card"><span>Modèle A</span><strong>distance</strong><div className="model-score">{Math.round(oneFeatureAccuracy * 100)}%</div><small>sur les exemples utilisés ici</small></div>
            <div className="plus-sign">+</div>
            <div className="model-card emphasized"><span>Modèle B</span><strong>distance + angle</strong><div className="model-score">{Math.round(twoFeatureAccuracy * 100)}%</div><small>sur les mêmes exemples</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 03 · Ajouter une information</Eyebrow>
        <h1>Le modèle ne voit que ce qu’on lui donne.</h1>
        <p className="lead">On entraîne maintenant deux modèles sur les mêmes tirs. Le premier connaît seulement la distance. Le second connaît aussi l’angle.</p>
        <p>Le score affiché n’est <strong>pas encore une preuve qu’un modèle est meilleur dans le monde réel</strong>. Pour l’instant, regarde simplement ce qui change quand sa description d’un tir devient plus riche.</p>
        <div className="definition-inline"><span>Nouveau mot</span><strong>FEATURE</strong><p>Une information donnée au modèle pour décrire un exemple.</p></div>
        <ContinueButton onClick={() => setStep(2)}>Choisir de bonnes features</ContinueButton>
      </LabShell>
    )
  }

  if (step === 2) {
    const toggleFeature = (id: string) => {
      if (checked) return
      setSelectedFeatures((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    }
    const pickedDirect = featureChoices.filter((choice) => choice.direct && selectedFeatures.includes(choice.id)).length
    const pickedIndirect = featureChoices.filter((choice) => !choice.direct && selectedFeatures.includes(choice.id)).length
    return (
      <LabShell
        visual={<div className="feature-cloud">{featureChoices.map((choice) => <span key={choice.id} className={selectedFeatures.includes(choice.id) ? 'active' : ''}>{choice.label}</span>)}</div>}
      >
        <Eyebrow>Chapitre 03 · À toi</Eyebrow>
        <h1>Plus d’informations = toujours mieux&nbsp;?</h1>
        <p className="lead">Pour décrire <strong>la géométrie immédiate d’un tir</strong>, quelles informations donnerais-tu d’abord au modèle&nbsp;?</p>
        <div className="feature-list">
          {featureChoices.map((choice) => (
            <button key={choice.id} className={`feature-choice ${selectedFeatures.includes(choice.id) ? 'selected' : ''}`} onClick={() => toggleFeature(choice.id)} disabled={checked}>
              <span className="checkbox">{selectedFeatures.includes(choice.id) ? '✓' : ''}</span>{choice.label}
            </button>
          ))}
        </div>
        {!checked ? <ContinueButton onClick={() => setChecked(true)} disabled={selectedFeatures.length === 0}>Vérifier mon choix</ContinueButton> : (
          <>
            <div className={`feedback ${pickedDirect === 2 && pickedIndirect === 0 ? 'good' : 'neutral'}`}>
              <strong>{pickedDirect === 2 ? 'Tu as bien retenu distance et angle.' : 'Distance et angle sont les deux signaux directs attendus ici.'}</strong>
              <span>{pickedIndirect > 0 ? 'Les autres données pourraient parfois être corrélées au résultat, mais elles ne décrivent pas directement la géométrie du tir. Une corrélation n’est pas forcément une bonne raison.' : 'Elles décrivent directement la situation que nous cherchons à représenter.'}</span>
            </div>
            <ContinueButton onClick={() => setStep(3)}>Voir ce que j’ai construit</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={
        <div className="learning-map">
          <div><span>1</span><strong>DONNÉES</strong><small>des exemples passés</small></div>
          <b>→</b><div><span>2</span><strong>FEATURES</strong><small>ce qu’on décrit</small></div>
          <b>→</b><div><span>3</span><strong>MODÈLE</strong><small>la relation apprise</small></div>
          <b>→</b><div><span>4</span><strong>PRÉDICTION</strong><small>sur un tir</small></div>
        </div>
      }
    >
      <Eyebrow>V0 terminée · Le socle</Eyebrow>
      <h1>Tu as construit la boucle minimale du machine learning.</h1>
      <p className="lead">Tu as commencé par écrire une règle toi-même, puis tu as laissé un modèle apprendre à partir d’exemples, puis tu as vu que <strong>les informations qu’on lui fournit limitent ce qu’il peut apprendre</strong>.</p>
      <div className="checkpoint">
        <span>Si cette phrase te paraît maintenant naturelle, le chapitre a fait son travail :</span>
        <strong>« Je donne des exemples et des features à un modèle pour qu’il apprenne une relation utile à une prédiction. »</strong>
      </div>
      <div className="next-teaser"><span>Prochaine question</span><strong>Notre modèle obtient un joli score. Mais comment savoir s’il est vraiment bon&nbsp;?</strong><small>Ce sera l’entrée vers train / test — pas avant.</small></div>
      <ContinueButton onClick={onComplete}>Terminer la V0</ContinueButton>
    </LabShell>
  )
}
