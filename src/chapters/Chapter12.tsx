import { useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { ModelWorkbenchControls } from '../components/ModelWorkbench'
import { UnderTheHood } from '../components/UnderTheHood'
import { realShots } from '../data/realShots'
import { modelLabel, type ModelConfig } from '../ml/modelLab'
import { crossValidate } from '../ml/validation'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }

type Run = { config: ModelConfig; foldCount: number; result: ReturnType<typeof crossValidate> }
const initialConfig: ModelConfig = { family: 'logistic', features: ['distance', 'angle'], k: 7, depth: 3 }

export function Chapter12({ step, setStep, onComplete }: Props) {
  const [config, setConfig] = useState<ModelConfig>(initialConfig)
  const [foldCount, setFoldCount] = useState(5)
  const [runs, setRuns] = useState<Run[]>([])

  const execute = () => {
    const result = crossValidate(realShots, config, foldCount, 0.25, 97)
    setRuns((current) => [...current.slice(-6), { config: { ...config, features: [...config.features] }, foldCount, result }])
  }

  if (step === 0) {
    return (
      <LabShell visual={<div className="fold-intro"><div>TRAIN</div><b>→</b><div>TEST</div><b>?</b><div>autre TEST</div></div>}>
        <Eyebrow>Chapitre 12 · Et si notre test était juste chanceux&nbsp;?</Eyebrow>
        <h1>Un seul découpage peut raconter une histoire trompeuse.</h1>
        <p className="lead">Au chapitre 04, tu as déjà vu le score bouger quand les tirs cachés changent. Avec plus de données, on peut faire mieux que choisir arbitrairement un seul test.</p>
        <div className="intent-card"><strong>Ce que tu vas manipuler</strong><span>Le nombre de groupes de validation. Chaque groupe devient le test une fois, pendant que les autres servent à apprendre.</span></div>
        <ContinueButton onClick={() => setStep(1)}>Ouvrir le labo de validation</ContinueButton>
      </LabShell>
    )
  }

  if (step === 1) {
    const latest = runs.at(-1)
    const triedFoldCounts = new Set(runs.map((run) => run.foldCount)).size
    return (
      <LabShell visual={latest ? <FoldVisual run={latest} /> : <div className="empty-lab-visual"><strong>Pas encore de validation</strong><span>Choisis un protocole puis lance-le.</span></div>}>
        <Eyebrow>Chapitre 12 · Cross-validation</Eyebrow>
        <h1>Teste la même idée plusieurs fois sur des données différentes.</h1>
        <p className="lead">Change le modèle si tu veux, mais joue surtout avec 3, 5 et 7 folds. Observe la moyenne et l’écart entre les folds.</p>
        <ModelWorkbenchControls config={config} onChange={setConfig} />
        <div className="workbench-block inline-fold-control">
          <span>3 · Combien de validations successives&nbsp;?</span>
          <div className="segmented-control">{[3, 5, 7].map((count) => <button key={count} className={foldCount === count ? 'selected' : ''} onClick={() => setFoldCount(count)}>{count} folds</button>)}</div>
          <small>Plus de folds = davantage de répétitions, avec des groupes de test plus petits.</small>
        </div>
        <button className="primary-lab-button" onClick={execute}>▶ Lancer la cross-validation</button>
        {latest && <div className="cv-summary"><div><span>Brier moyen</span><strong>{latest.result.meanBrier.toFixed(3)}</strong></div><div><span>Accuracy moyenne</span><strong>{Math.round(latest.result.meanAccuracy * 100)}%</strong></div><div><span>Variation accuracy</span><strong>{Math.round(latest.result.accuracyRange * 100)} pts</strong></div></div>}
        {runs.length > 0 && <div className="workbench-history compact">{runs.map((run, index) => <div key={index}><span>#{index + 1} · {modelLabel(run.config)} · {run.foldCount} folds</span><strong>{run.result.meanBrier.toFixed(3)} Brier</strong><small>± {Math.round(run.result.accuracyRange * 100)} pts accuracy</small></div>)}</div>}
        <p className="practice-gate">{runs.length < 3 || triedFoldCounts < 2 ? 'Fais au moins 3 essais et teste au moins deux nombres de folds.' : 'Tu as assez varié le protocole pour comparer.'}</p>
        {runs.length >= 3 && triedFoldCounts >= 2 && <ContinueButton onClick={() => setStep(2)}>Comprendre ce protocole</ContinueButton>}
      </LabShell>
    )
  }

  const latest = runs.at(-1)
  return (
    <LabShell visual={latest ? <FoldVisual run={latest} /> : undefined}>
      <Eyebrow>Cycle 2 terminé · Cross-validation</Eyebrow>
      <h1>Évaluer un modèle, c’est concevoir une expérience.</h1>
      <p className="lead">La cross-validation fait tourner le rôle du groupe de test. On obtient plusieurs scores plutôt qu’un chiffre unique, ce qui permet de voir si une conclusion est stable ou dépend d’un découpage chanceux.</p>
      <div className="reveal-card"><span>Concept débloqué</span><strong>Cross-validation : répéter train/validation sur plusieurs folds et résumer la moyenne + la variabilité.</strong></div>
      <UnderTheHood><p>Chaque tir appartient à un seul fold de validation. Pour chaque tour, le modèle est réentraîné de zéro sur tous les autres folds. Les folds sont stratifiés pour conserver approximativement la proportion de buts.</p></UnderTheHood>
      <div className="checkpoint"><span>Fin du Cycle 2</span><strong>Tu sais maintenant questionner la donnée, les erreurs, les probabilités et le protocole d’évaluation. Le Cycle 3 va te demander de construire réellement des modèles.</strong></div>
      <ContinueButton onClick={onComplete}>Entrer dans le Model Workshop</ContinueButton>
    </LabShell>
  )
}

function FoldVisual({ run }: { run: Run }) {
  return <div className="fold-board"><div className="fold-board-title"><span>{modelLabel(run.config)}</span><strong>{run.foldCount} folds</strong></div>{run.result.folds.map((fold) => <div key={fold.fold} className="fold-row"><span>Fold {fold.fold}</span><i style={{ width: `${fold.accuracy * 100}%` }} /><strong>{Math.round(fold.accuracy * 100)}%</strong><small>Brier {fold.brier.toFixed(3)} · {fold.size} tirs</small></div>)}</div>
}
