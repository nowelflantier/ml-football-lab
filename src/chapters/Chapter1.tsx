import { useMemo, useState } from 'react'
import { FootballPitch } from '../components/FootballPitch'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { challengeShots, learningShots } from '../data/shots'
import { bestDistanceThreshold, thresholdAccuracy } from '../ml/logistic'

const predictionShots = challengeShots.slice(0, 4)

type Props = {
  step: number
  setStep: (step: number) => void
  manualThreshold: number
  setManualThreshold: (value: number) => void
  onComplete: () => void
}

export function Chapter1({ step, setStep, manualThreshold, setManualThreshold, onComplete }: Props) {
  const [predictionIndex, setPredictionIndex] = useState(0)
  const [guess, setGuess] = useState<boolean | null>(null)
  const [predictionScore, setPredictionScore] = useState(0)
  const [finishedPredictions, setFinishedPredictions] = useState(false)
  const thresholdScore = useMemo(() => thresholdAccuracy(learningShots, manualThreshold), [manualThreshold])
  const best = useMemo(() => bestDistanceThreshold(learningShots), [])

  if (step === 0) {
    return (
      <LabShell
        visual={
          <div className="visual-stack">
            <FootballPitch shots={learningShots} showLabels />
            <div className="legend"><span><i className="legend-dot goal-dot" /> But</span><span><i className="legend-dot miss-dot" /> Pas but</span></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 01 · Observer</Eyebrow>
        <h1>Peut-on prédire un but&nbsp;?</h1>
        <p className="lead">Voici 18 tirs. Pour l’instant, on ne cherche rien de compliqué : regarde seulement où ils ont été pris et ce qu’ils sont devenus.</p>
        <div className="data-card compact-table">
          <div className="table-row table-head"><span>Tir</span><span>Distance</span><span>Résultat</span></div>
          {learningShots.slice(0, 7).map((shot) => (
            <div className="table-row" key={shot.id}><span>{shot.id}</span><span>{shot.distance.toFixed(1)} m</span><span>{shot.goal ? 'BUT' : '—'}</span></div>
          ))}
          <div className="table-more">+ 11 autres tirs sur le terrain</div>
        </div>
        <div className="thought-prompt"><strong>Regarde avant de continuer.</strong><span>Est-ce qu’une tendance te saute aux yeux&nbsp;?</span></div>
        <ContinueButton onClick={() => setStep(1)}>J’ai observé</ContinueButton>
      </LabShell>
    )
  }

  if (step === 1) {
    const current = predictionShots[predictionIndex]
    const reveal = guess !== null
    return (
      <LabShell
        visual={
          <div className="visual-stack">
            <FootballPitch shots={[current]} hiddenResults={!reveal} selectedId={current.id} />
            <div className="shot-fact"><strong>{current.distance.toFixed(1)} m</strong><span>du but</span></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 01 · Prédire</Eyebrow>
        <h1>{finishedPredictions ? 'Tu viens de faire des prédictions.' : `Tir ${predictionIndex + 1} sur ${predictionShots.length}`}</h1>
        {!finishedPredictions ? (
          <>
            <p className="lead">Sans autre information que sa position et sa distance : que prédis-tu&nbsp;?</p>
            <div className="choice-row">
              <button className={`choice-button ${guess === true ? 'selected' : ''}`} disabled={reveal} onClick={() => { setGuess(true); if (current.goal) setPredictionScore((value) => value + 1) }}>BUT</button>
              <button className={`choice-button ${guess === false ? 'selected' : ''}`} disabled={reveal} onClick={() => { setGuess(false); if (!current.goal) setPredictionScore((value) => value + 1) }}>PAS BUT</button>
            </div>
            {reveal && (
              <div className={`feedback ${guess === current.goal ? 'good' : 'neutral'}`}>
                <strong>{current.goal ? 'Le tir a fini en but.' : 'Le tir n’a pas fini en but.'}</strong>
                <span>{guess === current.goal ? 'Ta prédiction était juste.' : 'Ta prédiction était fausse — et c’est précisément ce qu’on veut pouvoir mesurer.'}</span>
              </div>
            )}
            {reveal && <ContinueButton onClick={() => {
              if (predictionIndex === predictionShots.length - 1) {
                setFinishedPredictions(true)
              } else {
                setPredictionIndex((value) => value + 1)
                setGuess(null)
              }
            }}>{predictionIndex === predictionShots.length - 1 ? 'Voir mon résultat' : 'Tir suivant'}</ContinueButton>}
          </>
        ) : (
          <>
            <div className="big-score"><strong>{predictionScore}/{predictionShots.length}</strong><span>prédictions justes</span></div>
            <p>Tu n’avais aucune certitude : tu as utilisé les exemples et ton intuition pour choisir une réponse. Une prédiction peut être utile sans être certaine.</p>
            <ContinueButton onClick={() => setStep(2)}>Automatisons cette intuition</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 2) {
    return (
      <LabShell
        visual={
          <div className="visual-stack">
            <FootballPitch shots={learningShots} />
            <div className="threshold-readout">Règle actuelle&nbsp;: <strong>BUT si distance &lt; {manualThreshold.toFixed(1)} m</strong></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 01 · Construire une règle</Eyebrow>
        <h1>À toi de fabriquer un système.</h1>
        <p className="lead">Choisis une distance. En dessous, ton système prédit automatiquement «&nbsp;BUT&nbsp;». Au-dessus, «&nbsp;PAS BUT&nbsp;».</p>
        <div className="slider-card">
          <label htmlFor="threshold">Je prédis BUT si la distance est inférieure à</label>
          <div className="slider-value">{manualThreshold.toFixed(1)} m</div>
          <input id="threshold" type="range" min="5" max="25" step="0.5" value={manualThreshold} onChange={(event: { target: { value: string } }) => setManualThreshold(Number(event.target.value))} />
          <div className="range-labels"><span>5 m</span><span>25 m</span></div>
        </div>
        <div className="metric-grid">
          <div className="metric"><strong>{thresholdScore.correct}/{thresholdScore.total}</strong><span>bonnes prédictions</span></div>
          <div className="metric"><strong>{Math.round(thresholdScore.ratio * 100)}%</strong><span>justes sur ces exemples</span></div>
        </div>
        <p className="microcopy">Bouge le curseur. Tu peux volontairement chercher une règle qui fonctionne mieux.</p>
        <ContinueButton onClick={() => setStep(3)}>J’ai essayé plusieurs seuils</ContinueButton>
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={
        <div className="concept-board">
          <div className="concept-node">18 exemples</div><span>→</span><div className="concept-node">ta règle</div><span>→</span><div className="concept-node">prédictions</div><span>→</span><div className="concept-node">erreurs</div>
        </div>
      }
    >
      <Eyebrow>Chapitre 01 · Ce que tu viens de faire</Eyebrow>
      <h1>Tu as cherché une règle à la main.</h1>
      <p className="lead">Sur nos exemples, le meilleur seuil simple se situe autour de <strong>{best.threshold.toFixed(1)} m</strong> et classe correctement <strong>{best.correct}/{best.total}</strong> tirs.</p>
      <p>Ce chiffre n’est pas la grande leçon. La vraie question est : <strong>pourquoi passer notre temps à essayer des seuils nous-mêmes&nbsp;?</strong></p>
      <div className="reveal-card">
        <span>Question pour la suite</span>
        <strong>Et si l’ordinateur cherchait la relation à notre place&nbsp;?</strong>
      </div>
      <div className="glossary-unlock">
        <span>Premiers mots débloqués</span>
        <div><b>observation</b><b>variable</b><b>cible</b><b>prédiction</b><b>erreur</b></div>
      </div>
      <ContinueButton onClick={onComplete}>Passer au chapitre 02</ContinueButton>
    </LabShell>
  )
}
