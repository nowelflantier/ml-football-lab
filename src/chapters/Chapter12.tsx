import { useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { UnderTheHood } from '../components/UnderTheHood'
import { realShots } from '../data/realShots'
import { crossValidate } from '../ml/validation'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type Run = { foldCount: number; result: ReturnType<typeof crossValidate> }

const fixedConfig = { family: 'logistic' as const, features: ['distance', 'angle'] as Array<'distance' | 'angle'> }

export function Chapter12({ step, setStep, onComplete }: Props) {
  const [foldCount, setFoldCount] = useState(5)
  const [runs, setRuns] = useState<Run[]>([])

  const execute = () => {
    const result = crossValidate(realShots, fixedConfig, foldCount, 0.25, 97)
    setRuns((current) => [...current.slice(-5), { foldCount, result }])
  }

  if (step === 0) return (
    <LabShell visual={<RotatingExamVisual />}>
      <Eyebrow>Chapitre 12 · Et si notre test était juste chanceux&nbsp;?</Eyebrow>
      <h1>Un seul groupe de contrôle peut raconter une histoire particulière.</h1>
      <p className="lead">Au chapitre 04, tu cachais une partie des tirs puis tu mesurais le modèle dessus. Mais un autre groupe caché pouvait donner un score différent. Alors, plutôt que choisir une seule feuille d’examen, on peut <b>faire tourner le rôle du test</b>.</p>
      <div className="concrete-story-card"><span>Image mentale</span><strong>On coupe les données en plusieurs paquets.</strong><small>À chaque tour, un paquet est caché pour le test et tous les autres servent à apprendre. Puis on change de paquet caché.</small></div>
      <ContinueButton onClick={() => setStep(1)}>Faire tourner les groupes</ContinueButton>
    </LabShell>
  )

  if (step === 1) {
    const latest = runs.at(-1)
    const triedCounts = new Set(runs.map((run) => run.foldCount)).size
    return (
      <LabShell visual={latest ? <FoldPlainVisual run={latest} /> : <RotatingExamVisual />}>
        <Eyebrow>12.1 · Même modèle, protocole différent</Eyebrow>
        <h1>Tu ne règles plus le modèle. Tu règles seulement la façon de l’évaluer.</h1>
        <p className="lead">Le modèle reste toujours le même&nbsp;: tendance logistique avec distance + angle. Choisis simplement en combien de groupes on découpe les tirs.</p>
        <div className="fixed-model-card"><span>Fixé pour tout le chapitre</span><strong>Régression logistique · distance + angle</strong><small>Aucun autre réglage ne change pendant tes essais.</small></div>
        <div className="workbench-block inline-fold-control">
          <span>Découper les données en…</span>
          <div className="segmented-control">{[3, 5, 7].map((count) => <button key={count} className={foldCount === count ? 'selected' : ''} onClick={() => setFoldCount(count)}>{count} groupes</button>)}</div>
          <small>Chaque groupe sera utilisé une fois comme test.</small>
        </div>
        <button className="primary-lab-button" onClick={execute}>▶ Faire tourner les {foldCount} tests</button>
        {latest && <div className="cv-summary plain"><div><span>Moyenne des décisions justes</span><strong>{Math.round(latest.result.meanAccuracy * 100)}%</strong></div><div><span>Écart entre meilleur et pire groupe</span><strong>{Math.round(latest.result.accuracyRange * 100)} points</strong></div></div>}
        {runs.length > 0 && <div className="workbench-history compact">{runs.map((run, index) => <div key={index}><span>#{index + 1} · {run.foldCount} groupes</span><strong>{Math.round(run.result.meanAccuracy * 100)}% en moyenne</strong><small>écart {Math.round(run.result.accuracyRange * 100)} pts</small></div>)}</div>}
        {runs.length < 2 || triedCounts < 2 ? <p className="practice-gate">Lance au moins deux protocoles différents, par exemple 3 puis 7 groupes.</p> : <ContinueButton onClick={() => setStep(2)}>Comprendre ce que les répétitions apportent</ContinueButton>}
      </LabShell>
    )
  }

  if (step === 2) {
    const latest = runs.at(-1)
    return (
      <LabShell visual={latest ? <FoldPlainVisual run={latest} /> : <RotatingExamVisual />}>
        <Eyebrow>12.2 · Plusieurs mesures valent mieux qu’un chiffre isolé</Eyebrow>
        <h1>Tu peux voir si ta conclusion dépend beaucoup du groupe choisi.</h1>
        <p className="lead">Si tous les groupes donnent des résultats proches, l’évaluation paraît plus stable. S’ils varient beaucoup, annoncer un seul score sans contexte serait fragile.</p>
        <div className="plain-explanation"><strong>Ce que le nombre de groupes change</strong><span>Avec davantage de groupes, chaque test contient moins de tirs mais on répète davantage l’expérience. Le nombre idéal n’est pas le sujet ici&nbsp;: le réflexe important est de <b>ne pas dépendre d’un unique découpage chanceux</b>.</span></div>
        <ContinueButton onClick={() => setStep(3)}>Mettre un nom sur cette méthode</ContinueButton>
      </LabShell>
    )
  }

  return (
    <LabShell visual={<RotatingExamVisual named />}>
      <Eyebrow>Parcours guidé terminé · Cross-validation</Eyebrow>
      <h1>Évaluer un modèle est aussi une expérience à concevoir.</h1>
      <p className="lead"><strong>Cross-validation</strong> est le nom de la mécanique que tu viens de manipuler&nbsp;: faire tourner plusieurs groupes de validation pour obtenir plusieurs mesures plutôt qu’un score unique.</p>
      <div className="reveal-card"><span>Concept débloqué</span><strong>Chaque exemple sert au test une fois, et à l’apprentissage les autres fois. On résume ensuite la performance moyenne et sa variabilité.</strong></div>
      <UnderTheHood><p>Nos groupes sont stratifiés pour conserver approximativement la proportion de buts. Le modèle est réentraîné de zéro à chaque tour. On peut aussi résumer l’erreur probabiliste moyenne avec le Brier vu au chapitre précédent.</p></UnderTheHood>
      <div className="checkpoint"><span>Fin du parcours guidé 01–12</span><strong>Tu sais maintenant ce qu’est une prédiction apprise, comment plusieurs familles la produisent, comment éviter les faux succès et comment tester si une conclusion tient sur de l’inconnu.</strong></div>
      <ContinueButton onClick={onComplete}>Débloquer les ateliers de construction</ContinueButton>
    </LabShell>
  )
}

function RotatingExamVisual({ named = false }: { named?: boolean }) {
  return <div className="rotating-exam-board"><div className="fold-box active">TEST</div><div className="fold-box">TRAIN</div><div className="fold-box">TRAIN</div><div className="fold-box">TRAIN</div><b>→ on tourne →</b><div className="fold-box">TRAIN</div><div className="fold-box active">TEST</div><div className="fold-box">TRAIN</div><div className="fold-box">TRAIN</div>{named && <strong>cross-validation</strong>}</div>
}

function FoldPlainVisual({ run }: { run: Run }) {
  return <div className="fold-board"><div className="fold-board-title"><span>Modèle fixe</span><strong>{run.foldCount} groupes</strong></div>{run.result.folds.map((fold) => { const correct = Math.round(fold.accuracy * fold.size); return <div key={fold.fold} className="fold-row"><span>Test {fold.fold}</span><i style={{ width: `${fold.accuracy * 100}%` }} /><strong>{correct}/{fold.size}</strong><small>{Math.round(fold.accuracy * 100)}% de décisions justes</small></div> })}</div>
}
