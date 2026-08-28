import { useMemo, useState } from 'react'
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

export function Chapter6({ step, setStep, onComplete }: Props) {
  const [choice, setChoice] = useState<'perfect' | 'test' | null>(null)
  const [leakChoice, setLeakChoice] = useState<'valid' | 'leak' | null>(null)
  const trainRows = useMemo(() => shotRows(learningShots, ['distance', 'angle']), [])
  const testRows = useMemo(() => shotRows(challengeShots, ['distance', 'angle']), [])
  const trainLabels = useMemo(() => shotLabels(learningShots), [])
  const testLabels = useMemo(() => shotLabels(challengeShots), [])
  const logistic = useMemo(() => trainLogistic(trainRows, trainLabels), [trainLabels, trainRows])
  const knn = useMemo(() => trainKnn(trainRows, trainLabels), [trainLabels, trainRows])
  const logisticTrain = accuracy(trainRows.map((row) => predictProbability(logistic, row)), trainLabels)
  const logisticTest = accuracy(testRows.map((row) => predictProbability(logistic, row)), testLabels)
  const knnTrain = accuracy(trainRows.map((row) => predictKnnProbability(knn, row, 1)), trainLabels)
  const knnTest = accuracy(testRows.map((row) => predictKnnProbability(knn, row, 1)), testLabels)
  const leakedTrainRows = useMemo(() => trainRows.map((row, index) => [...row, trainLabels[index]]), [trainLabels, trainRows])
  const leakedTestRows = useMemo(() => testRows.map((row, index) => [...row, testLabels[index]]), [testLabels, testRows])
  const leakedModel = useMemo(() => trainLogistic(leakedTrainRows, trainLabels), [leakedTrainRows, trainLabels])
  const leakedTest = accuracy(leakedTestRows.map((row) => predictProbability(leakedModel, row)), testLabels)

  if (step === 0) {
    return (
      <LabShell
        visual={
          <div className="model-comparison">
            <div className="model-card"><span>Modèle simple</span><strong>relation globale</strong><div className="model-score">{Math.round(logisticTrain * 100)}%</div><small>score train</small></div>
            <div className="plus-sign">VS</div>
            <div className="model-card emphasized"><span>Modèle ultra-flexible</span><strong>1 voisin</strong><div className="model-score">{Math.round(knnTrain * 100)}%</div><small>score train</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 06 · Trop beau pour être vrai</Eyebrow>
        <h1>100% sur l’apprentissage. Tu prends lequel&nbsp;?</h1>
        <p className="lead">Le second modèle retrouve parfaitement le résultat de chaque tir qu’on lui a donné.</p>
        <div className="choice-row">
          <button className={`choice-button ${choice === 'perfect' ? 'selected' : ''}`} onClick={() => setChoice('perfect')}>Le modèle à 100%</button>
          <button className={`choice-button ${choice === 'test' ? 'selected' : ''}`} onClick={() => setChoice('test')}>Je veux voir le test</button>
        </div>
        {choice && (
          <>
            <div className="feedback neutral"><strong>Bonne réaction : regardons le test.</strong><span>Un modèle peut devenir excellent pour reconnaître ses exemples sans avoir appris une règle qui fonctionne ailleurs.</span></div>
            <ContinueButton onClick={() => setStep(1)}>Afficher les tirs inconnus</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 1) {
    return (
      <LabShell
        visual={
          <div className="train-test-bars">
            <div><span>Relation globale</span><i style={{ width: `${logisticTrain * 100}%` }} /><strong>{Math.round(logisticTrain * 100)}% train</strong><i style={{ width: `${logisticTest * 100}%` }} /><strong>{Math.round(logisticTest * 100)}% test</strong></div>
            <div><span>1 voisin</span><i style={{ width: `${knnTrain * 100}%` }} /><strong>{Math.round(knnTrain * 100)}% train</strong><i style={{ width: `${knnTest * 100}%` }} /><strong>{Math.round(knnTest * 100)}% test</strong></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 06 · Mémoriser n’est pas généraliser</Eyebrow>
        <h1>Le modèle parfait sur train baisse davantage sur test.</h1>
        <p className="lead">Le modèle « 1 voisin » colle tellement aux exemples d’apprentissage qu’il mémorise leurs particularités. Sur les tirs inconnus, cette perfection disparaît.</p>
        <div className="definition-inline"><span>Nouveau mot</span><strong>OVERFITTING</strong><p>Surapprentissage : le modèle s’adapte trop aux données d’entraînement et généralise moins bien.</p></div>
        <UnderTheHood>
          <p>Le modèle « 1 voisin » est un <strong>k-nearest neighbors</strong> avec k=1. Pour prédire un nouveau tir, il cherche le tir d’entraînement le plus proche en distance + angle et copie son résultat. Sur les tirs d’entraînement eux-mêmes, il retrouve forcément chacun d’eux : 100%.</p>
        </UnderTheHood>
        <ContinueButton onClick={() => setStep(2)}>Découvrir un autre piège</ContinueButton>
      </LabShell>
    )
  }

  if (step === 2) {
    return (
      <LabShell
        visual={
          <div className="leak-card">
            <span>Nouvelle feature proposée</span>
            <strong>« Le score a-t-il changé juste après le tir ? »</strong>
            <div className="perfect-score">{Math.round(leakedTest * 100)}% <small>sur test</small></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 06 · Un score miraculeux</Eyebrow>
        <h1>On ajoute une feature et le test passe à {Math.round(leakedTest * 100)}%.</h1>
        <p className="lead">La feature indique si le tableau d’affichage a changé juste après le tir. Est-ce une information légitime pour prédire le but au moment où le joueur frappe&nbsp;?</p>
        <div className="choice-row">
          <button className={`choice-button ${leakChoice === 'valid' ? 'selected' : ''}`} onClick={() => setLeakChoice('valid')}>Oui, puisque ça marche</button>
          <button className={`choice-button ${leakChoice === 'leak' ? 'selected' : ''}`} onClick={() => setLeakChoice('leak')}>Non, elle vient du futur</button>
        </div>
        {leakChoice && (
          <>
            <div className={`feedback ${leakChoice === 'leak' ? 'good' : 'neutral'}`}>
              <strong>{leakChoice === 'leak' ? 'Exactement.' : 'Le score cache une triche.'}</strong>
              <span>Le changement du score est une conséquence presque directe du but. Cette information n’existe pas encore au moment où l’on veut faire la prédiction.</span>
            </div>
            <ContinueButton onClick={() => setStep(3)}>Nommer cette fuite</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={
        <div className="guardrail-board">
          <div><span>1</span><strong>Données inconnues</strong><small>pour tester la généralisation</small></div>
          <div><span>2</span><strong>Pas d’info du futur</strong><small>uniquement ce qui existe au moment de prédire</small></div>
        </div>
      }
    >
      <Eyebrow>Chapitre 06 · Leakage</Eyebrow>
      <h1>Un excellent score peut être faux pour deux raisons très différentes.</h1>
      <p className="lead"><strong>Overfitting</strong> : le modèle a trop mémorisé le train. <strong>Data leakage</strong> : on lui a donné une information qu’il ne devrait pas avoir.</p>
      <div className="reveal-card"><span>Réflexe à garder</span><strong>Avant de célébrer un score, demande toujours : « sur quelles données est-il mesuré ? » et « ces features existaient-elles vraiment au moment de la prédiction ? »</strong></div>
      <ContinueButton onClick={onComplete}>Passer au chapitre 07</ContinueButton>
    </LabShell>
  )
}
