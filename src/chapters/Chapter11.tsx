import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { realShots } from '../data/realShots'
import { stratifiedSplit } from '../ml/evaluation'
import { evaluateConfig } from '../ml/modelLab'
import { calibrationBuckets } from '../ml/validation'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }

export function Chapter11({ step, setStep, onComplete }: Props) {
  const [weatherAnswer, setWeatherAnswer] = useState<number | null>(null)
  const [selectedBucket, setSelectedBucket] = useState(0)
  const [visitedBuckets, setVisitedBuckets] = useState<number[]>([])

  const experiment = useMemo(() => {
    const split = stratifiedSplit(realShots, 83, 0.35)
    const evaluation = evaluateConfig(split.train, split.test, { family: 'logistic', features: ['distance', 'angle'] }, 0.25)
    return { evaluation, buckets: calibrationBuckets(evaluation.probabilities, evaluation.labels, 5) }
  }, [])

  const bucket = experiment.buckets[selectedBucket] ?? experiment.buckets[0]
  const expectedGoals = bucket.predicted * bucket.count
  const observedGoals = Math.round(bucket.observed * bucket.count)

  const selectBucket = (index: number) => {
    setSelectedBucket(index)
    setVisitedBuckets((current) => current.includes(index) ? current : [...current, index])
  }

  if (step === 0) return (
    <LabShell visual={<WeatherCalibrationVisual />}>
      <Eyebrow>Chapitre 11 · Quand 30% veut-il vraiment dire 30%&nbsp;?</Eyebrow>
      <h1>Commençons loin du football.</h1>
      <p className="lead">Imagine dix journées différentes où une météo annonce chaque fois <b>30% de risque de pluie</b>. Si cette météo est bien réglée, combien de ces dix journées devraient finir sous la pluie, à peu près&nbsp;?</p>
      <div className="choice-row three-choices">{[0, 3, 10].map((choice) => <button key={choice} className={`choice-button ${weatherAnswer === choice ? 'selected' : ''}`} onClick={() => setWeatherAnswer(choice)}>{choice} jour{choice > 1 ? 's' : ''}</button>)}</div>
      {weatherAnswer !== null && <><div className={`feedback ${weatherAnswer === 3 ? 'good' : 'neutral'}`}><strong>Environ 3 jours sur 10.</strong><span>Pas forcément exactement 3 sur chaque série de dix. Mais si on accumule beaucoup de prévisions annoncées à 30%, la fréquence observée devrait tourner autour de 30%.</span></div><ContinueButton onClick={() => setStep(1)}>Revenir aux tirs</ContinueButton></>}
    </LabShell>
  )

  if (step === 1) return (
    <LabShell visual={<BucketVisual buckets={experiment.buckets} selected={selectedBucket} onSelect={selectBucket} />}>
      <Eyebrow>11.1 · Faire la même chose avec nos probabilités de but</Eyebrow>
      <h1>« 0–20% » désigne un groupe de tirs, pas une note.</h1>
      <p className="lead">On prend tous les tirs de test auxquels notre modèle a donné une estimation entre <b>0% et 20%</b>. Puis on regarde combien ont réellement fini en but.</p>
      <div className="bucket-picker">{experiment.buckets.map((item, index) => <button key={index} className={selectedBucket === index ? 'selected' : ''} onClick={() => selectBucket(index)}><strong>{Math.round(item.from * 100)}–{Math.round(item.to * 100)}%</strong><small>{item.count} tirs</small></button>)}</div>
      <div className="bucket-detail">
        <span>Tranche sélectionnée</span>
        <strong>{bucket.count} tirs</strong>
        <p>Le modèle leur donnait en moyenne <b>{Math.round(bucket.predicted * 100)}%</b> de chance de but. Sur {bucket.count} tirs, cela représente environ <b>{expectedGoals.toFixed(1)} but(s) attendu(s)</b>. En réalité, on observe <b>{observedGoals} but(s)</b>.</p>
      </div>
      <div className="plain-explanation"><strong>Comment lire ça</strong><span>Si « attendu » et « observé » restent proches sur beaucoup de groupes, les pourcentages du modèle ont un sens fréquentiste. Un tir individuel peut évidemment faire le contraire de son pourcentage.</span></div>
      {visitedBuckets.length < 3 ? <p className="practice-gate">Explore au moins trois tranches différentes.</p> : <ContinueButton onClick={() => setStep(2)}>Voir toutes les tranches ensemble</ContinueButton>}
    </LabShell>
  )

  if (step === 2) return (
    <LabShell visual={<CalibrationOverview buckets={experiment.buckets} />}>
      <Eyebrow>11.2 · Promesse annoncée vs fréquence observée</Eyebrow>
      <h1>On ne demande pas au modèle d’avoir raison tir par tir.</h1>
      <p className="lead">On lui demande plutôt ceci&nbsp;: lorsqu’il annonce souvent 10%, 30% ou 60%, les fréquences réelles ressemblent-elles à ces valeurs sur beaucoup de cas&nbsp;?</p>
      <div className="calibration-reading-guide">
        <div><span>Barre 1</span><strong>Probabilité moyenne annoncée</strong></div>
        <div><span>Barre 2</span><strong>Fréquence réelle de buts</strong></div>
      </div>
      <div className="plain-explanation"><strong>Pas besoin d’une diagonale parfaite sur 100 tirs.</strong><span>Notre échantillon reste petit. L’objectif ici est de comprendre le principe&nbsp;: une probabilité utile doit être interprétable sur des groupes de situations comparables.</span></div>
      <ContinueButton onClick={() => setStep(3)}>Mettre un nom sur ce contrôle</ContinueButton>
    </LabShell>
  )

  return (
    <LabShell visual={<CalibrationOverview buckets={experiment.buckets} />}>
      <Eyebrow>Chapitre 11 · Calibration</Eyebrow>
      <h1>Une probabilité crédible doit tenir sa promesse à long terme.</h1>
      <p className="lead"><strong>Calibration</strong> est le nom de ce contrôle&nbsp;: comparer les probabilités annoncées aux fréquences réellement observées.</p>
      <div className="reveal-card"><span>Idée à garder</span><strong>« 20% » ne veut pas dire « ce tir va rater ». Cela veut dire que, sur beaucoup de situations auxquelles le modèle donne environ 20%, on espère observer environ 20% de buts.</strong></div>
      <UnderTheHood><p>On peut résumer l’erreur probabiliste avec un score appelé <strong>Brier</strong>. Il compare chaque probabilité au résultat réel 0/1 puis moyenne les écarts au carré. 0 serait parfait et plus bas est meilleur. Ce score est utile, mais le graphique par tranches est le meilleur point de départ pour comprendre ce qu’il mesure.</p></UnderTheHood>
      <div className="checkpoint"><span>Réflexe</span><strong>Un modèle xG ne doit pas seulement classer correctement des tirs&nbsp;: ses probabilités doivent aussi être interprétables comme des fréquences.</strong></div>
      <ContinueButton onClick={onComplete}>Passer à l’évaluation répétée</ContinueButton>
    </LabShell>
  )
}

function WeatherCalibrationVisual() {
  return <div className="weather-calibration-board"><span>10 jours annoncés à</span><strong>30%</strong><small>de pluie chacun</small><b>→</b><span>sur beaucoup de séries similaires</span><strong>≈ 3 jours de pluie / 10</strong></div>
}

function BucketVisual({ buckets, selected, onSelect }: { buckets: ReturnType<typeof calibrationBuckets>; selected: number; onSelect: (index: number) => void }) {
  return <div className="bucket-plain-board">{buckets.map((bucket, index) => <button key={index} className={selected === index ? 'selected' : ''} onClick={() => onSelect(index)}><span>{Math.round(bucket.from * 100)}–{Math.round(bucket.to * 100)}%</span><strong>{bucket.count} tirs</strong><small>annoncé {Math.round(bucket.predicted * 100)}% · réel {Math.round(bucket.observed * 100)}%</small></button>)}</div>
}

function CalibrationOverview({ buckets }: { buckets: ReturnType<typeof calibrationBuckets> }) {
  return <div className="calibration-board"><div className="calibration-title"><span>Modèle fixe · distance + angle</span><strong>annoncé vs observé</strong></div>{buckets.map((bucket, index) => <div key={index} className="calibration-row"><span>{Math.round(bucket.from * 100)}–{Math.round(bucket.to * 100)}%</span><div><i className="predicted" style={{ width: `${bucket.predicted * 100}%` }} /><i className="observed" style={{ width: `${bucket.observed * 100}%` }} /></div><small>{bucket.count} tirs · annoncé {Math.round(bucket.predicted * 100)}% / réel {Math.round(bucket.observed * 100)}%</small></div>)}</div>
}
