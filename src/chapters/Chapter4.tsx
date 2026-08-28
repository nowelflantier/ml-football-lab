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

export function Chapter4({ step, setStep, onComplete }: Props) {
  const [trustAnswer, setTrustAnswer] = useState<'yes' | 'doubt' | null>(null)
  const [seed, setSeed] = useState(3)
  const fixedEvaluation = useMemo(() => evaluateLogistic(learningShots, challengeShots), [])
  const resplit = useMemo(() => {
    const split = stratifiedSplit(allShots, seed)
    return { split, evaluation: evaluateLogistic(split.train, split.test) }
  }, [seed])

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
            <ContinueButton onClick={() => setStep(1)}>Faisons-lui passer un vrai contrôle</ContinueButton>
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
            <div className="split-card train"><span>APPRENTISSAGE</span><strong>{learningShots.length} tirs</strong><small>le modèle peut les utiliser</small></div>
            <div className="split-arrow">→</div>
            <div className="split-card test"><span>TEST</span><strong>{challengeShots.length} tirs</strong><small>jamais montrés au modèle</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 04 · Cacher une partie des données</Eyebrow>
        <h1>On garde des tirs de côté.</h1>
        <p className="lead">Le modèle apprend sur un premier groupe. Ensuite seulement, on mesure ses prédictions sur des tirs qu’il n’a jamais vus.</p>
        <div className="metric-grid">
          <div className="metric"><strong>{Math.round(fixedEvaluation.trainAccuracy * 100)}%</strong><span>sur les tirs d’apprentissage</span></div>
          <div className="metric"><strong>{Math.round(fixedEvaluation.testAccuracy * 100)}%</strong><span>sur les tirs cachés</span></div>
        </div>
        <p>Le second score nous intéresse davantage : il commence à répondre à la question <strong>« est-ce que ce que le modèle a appris fonctionne aussi ailleurs ? »</strong></p>
        <div className="definition-inline"><span>Nouveaux mots</span><strong>TRAIN / TEST</strong><p>Train = exemples utilisés pour apprendre. Test = exemples gardés hors de l’apprentissage pour évaluer ensuite.</p></div>
        <ContinueButton onClick={() => setStep(2)}>Et si le découpage change&nbsp;?</ContinueButton>
      </LabShell>
    )
  }

  if (step === 2) {
    const trainScore = Math.round(resplit.evaluation.trainAccuracy * 100)
    const testScore = Math.round(resplit.evaluation.testAccuracy * 100)
    return (
      <LabShell
        visual={
          <div className="experiment-board">
            <div><span>Train</span><strong>{trainScore}%</strong><small>{resplit.split.train.length} tirs</small></div>
            <div><span>Test</span><strong>{testScore}%</strong><small>{resplit.split.test.length} tirs</small></div>
            <button className="secondary-button inline-button" onClick={() => setSeed((current) => current + 1)}>↻ Nouveau découpage</button>
          </div>
        }
      >
        <Eyebrow>Chapitre 04 · Une vraie expérience</Eyebrow>
        <h1>Le score bouge quand les tirs cachés changent.</h1>
        <p className="lead">Clique plusieurs fois sur « Nouveau découpage ». À chaque fois, l’app mélange réellement les tirs, entraîne un nouveau modèle et le teste sur un autre groupe.</p>
        <div className="thought-prompt"><strong>À observer</strong><span>Avec peu de données, quelques tirs difficiles peuvent faire beaucoup bouger le score. Un chiffre isolé n’est pas une vérité absolue.</span></div>
        <UnderTheHood>
          <p>Le navigateur sépare ici les buts et les tirs ratés, mélange chaque groupe avec une graine déterministe, réserve environ 30% des tirs pour le test, puis réentraîne la régression logistique uniquement sur le reste.</p>
        </UnderTheHood>
        <ContinueButton onClick={() => setStep(3)}>Mettre un nom sur ce qu’on cherche</ContinueButton>
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
      <p className="lead">Un modèle utile apprend une relation sur des exemples passés et reste pertinent sur de nouveaux exemples.</p>
      <div className="reveal-card"><span>Concept débloqué</span><strong>Généralisation : capacité du modèle à rester utile sur des données qu’il n’a pas utilisées pour apprendre.</strong></div>
      <p>On vient aussi de poser une règle essentielle pour tout ce qui suit : <strong>on ne compare plus sérieusement des modèles sur leur score d’entraînement.</strong></p>
      <ContinueButton onClick={onComplete}>Passer au chapitre 05</ContinueButton>
    </LabShell>
  )
}
