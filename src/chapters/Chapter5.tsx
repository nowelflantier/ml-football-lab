import { useMemo, useState } from 'react'
import { FootballPitch } from '../components/FootballPitch'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { challengeShots, learningShots } from '../data/shots'
import { predictProbability, shotLabels, shotRows, trainLogistic } from '../ml/logistic'

const scenarioIds = ['N02', 'N03', 'N05', 'N06']

type Props = {
  step: number
  setStep: (step: number) => void
  onComplete: () => void
}

export function Chapter5({ step, setStep, onComplete }: Props) {
  const [answer, setAnswer] = useState<'wrong' | 'possible' | null>(null)
  const [sumAnswer, setSumAnswer] = useState<number | null>(null)
  const model = useMemo(() => trainLogistic(shotRows(learningShots, ['distance', 'angle']), shotLabels(learningShots)), [])
  const probabilities = useMemo(() => new Map(challengeShots.map((shot) => [shot.id, predictProbability(model, [shot.distance, shot.angle])])), [model])
  const surprisingShot = challengeShots.find((shot) => shot.id === 'N06') ?? challengeShots[0]
  const surprisingProbability = probabilities.get(surprisingShot.id) ?? 0
  const scenarioShots = challengeShots.filter((shot) => scenarioIds.includes(shot.id))
  const totalXg = scenarioShots.reduce((sum, shot) => sum + (probabilities.get(shot.id) ?? 0), 0)
  const choices = [0.3, Number(totalXg.toFixed(1)), 2.8]

  if (step === 0) {
    return (
      <LabShell
        visual={
          <div className="visual-stack">
            <FootballPitch shots={[surprisingShot]} showLabels />
            <div className="probability-badge"><span>modèle</span><strong>{Math.round(surprisingProbability * 100)}%</strong><small>de chance de but</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 05 · Probabilité</Eyebrow>
        <h1>Le modèle disait {Math.round(surprisingProbability * 100)}%. Pourtant, il y a eu but.</h1>
        <p className="lead">Est-ce que cette prédiction était forcément mauvaise&nbsp;?</p>
        <div className="choice-row">
          <button className={`choice-button ${answer === 'wrong' ? 'selected' : ''}`} onClick={() => setAnswer('wrong')}>Oui, il s’est trompé</button>
          <button className={`choice-button ${answer === 'possible' ? 'selected' : ''}`} onClick={() => setAnswer('possible')}>Non, c’était possible</button>
        </div>
        {answer && (
          <>
            <div className={`feedback ${answer === 'possible' ? 'good' : 'neutral'}`}>
              <strong>{answer === 'possible' ? 'Exact.' : 'Pas forcément.'}</strong>
              <span>Une probabilité faible ne signifie pas impossible. Si des situations comparables se produisaient souvent, certaines finiraient quand même en but.</span>
            </div>
            <ContinueButton onClick={() => setStep(1)}>Alors, que signifie vraiment ce pourcentage&nbsp;?</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 1) {
    return (
      <LabShell
        visual={
          <div className="probability-ladder">
            {[0.1, 0.3, 0.5, 0.8].map((probability) => (
              <div key={probability}><strong>{Math.round(probability * 100)}%</strong><span style={{ width: `${probability * 100}%` }} /><small>fréquence attendue sur beaucoup de situations comparables</small></div>
            ))}
          </div>
        }
      >
        <Eyebrow>Chapitre 05 · Penser en fréquence</Eyebrow>
        <h1>Une probabilité se juge sur beaucoup de cas, pas sur un tir isolé.</h1>
        <p className="lead">Dans un modèle bien calibré, des situations évaluées autour de 30% devraient produire environ 30 buts sur 100 cas comparables.</p>
        <div className="thought-prompt"><strong>Important</strong><span>Notre petit modèle pédagogique n’a pas assez de données pour démontrer qu’il est bien calibré. Ici, on apprend le sens du nombre, pas qu’il est déjà parfait.</span></div>
        <UnderTheHood>
          <p>La régression logistique calcule d’abord un score à partir des features, puis le transforme en nombre entre 0 et 1 avec une fonction appelée <strong>sigmoïde</strong>. C’est ce nombre que l’app affiche comme probabilité.</p>
        </UnderTheHood>
        <ContinueButton onClick={() => setStep(2)}>Relier ça au xG</ContinueButton>
      </LabShell>
    )
  }

  if (step === 2) {
    return (
      <LabShell
        visual={
          <div className="xg-shot-list">
            {scenarioShots.map((shot) => <div key={shot.id}><span>{shot.id}</span><strong>{Math.round((probabilities.get(shot.id) ?? 0) * 100)}%</strong><small>{shot.goal ? 'but réel' : 'tir raté'}</small></div>)}
          </div>
        }
      >
        <Eyebrow>Chapitre 05 · Additionner les occasions</Eyebrow>
        <h1>Combien de buts « attendus » représentent ces quatre tirs&nbsp;?</h1>
        <p className="lead">Additionne simplement les quatre probabilités affichées à gauche.</p>
        <div className="choice-row three-choices">
          {choices.map((choice) => <button key={choice} className={`choice-button ${sumAnswer === choice ? 'selected' : ''}`} onClick={() => setSumAnswer(choice)}>{choice.toFixed(1)} xG</button>)}
        </div>
        {sumAnswer !== null && (
          <>
            <div className={`feedback ${Math.abs(sumAnswer - Number(totalXg.toFixed(1))) < 0.01 ? 'good' : 'neutral'}`}>
              <strong>Total : {totalXg.toFixed(2)} xG.</strong>
              <span>On additionne les probabilités de chaque tir. Le total ne dit pas combien de buts ont réellement été marqués : il résume la qualité estimée des occasions.</span>
            </div>
            <ContinueButton onClick={() => setStep(3)}>Mettre un nom dessus</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={
        <div className="formula-board">
          <span>tir 1</span><strong>0.17</strong><b>+</b><span>tir 2</span><strong>0.72</strong><b>+ … =</b><strong>{totalXg.toFixed(2)} xG</strong>
        </div>
      }
    >
      <Eyebrow>Chapitre 05 · Expected Goals</Eyebrow>
      <h1>Le xG est une prédiction de probabilité appliquée aux tirs.</h1>
      <p className="lead">Pour chaque tir, un modèle estime la probabilité qu’il devienne un but à partir des informations disponibles. Cette estimation est son <strong>xG</strong>.</p>
      <p>Les vrais modèles de xG utilisent généralement davantage de données que notre duo distance + angle : type d’action, partie du corps, pression, passe précédente, contexte, etc. Mais la mécanique fondamentale que tu viens de manipuler est la même.</p>
      <div className="reveal-card"><span>Idée à garder</span><strong>Un xG de 0,20 ne signifie pas « le tir vaut un cinquième de but ». Il signifie « le modèle estime environ 20% de chance de marquer dans cette situation ».</strong></div>
      <ContinueButton onClick={onComplete}>Passer au chapitre 06</ContinueButton>
    </LabShell>
  )
}
