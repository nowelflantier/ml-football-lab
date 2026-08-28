import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { realShots } from '../data/realShots'
import { stratifiedSplit } from '../ml/evaluation'
import { predictProbability, shotLabels, trainLogistic } from '../ml/logistic'
import { trainDecisionTree, type TreeNode } from '../ml/tree'
import type { Shot } from '../types'

type Props = { step: number; setStep: (step: number) => void; onComplete: () => void }
type Neighbor = { shot: Shot; gap: number }
type TreeTrace = { question: string; answer: 'oui' | 'non' }

const initialDistance = 11

export function Chapter11({ step, setStep, onComplete }: Props) {
  const split = useMemo(() => stratifiedSplit(realShots, 83, 0.35), [])
  const [distance, setDistance] = useState(initialDistance)
  const [k, setK] = useState(5)
  const [trendTouched, setTrendTouched] = useState(false)
  const [neighborTouched, setNeighborTouched] = useState(false)
  const [treeTouched, setTreeTouched] = useState(false)
  const [compareTouched, setCompareTouched] = useState(false)

  const trainRows = useMemo(() => split.train.map((shot) => [shot.distance]), [split.train])
  const labels = useMemo(() => shotLabels(split.train), [split.train])
  const logistic = useMemo(() => trainLogistic(trainRows, labels, 3000), [trainRows, labels])
  const tree = useMemo(() => trainDecisionTree(trainRows, labels, 3, 8), [trainRows, labels])

  const smoothProbability = predictProbability(logistic, [distance])
  const neighbors = nearestByDistance(split.train, distance, k)
  const neighborGoals = neighbors.filter((neighbor) => neighbor.shot.goal).length
  const neighborProbability = neighbors.length ? neighborGoals / neighbors.length : 0
  const treeTrace = traceTree(tree.root, distance)
  const treeProbability = leafProbability(tree.root, distance)

  if (step === 0) {
    return (
      <LabShell visual={<ThreeWaysIntro />}>
        <Eyebrow>Chapitre 11 · Trois façons de prédire</Eyebrow>
        <h1>Oublie les mots « logistique », « k-NN » et « arbre » pendant cinq minutes.</h1>
        <p className="lead">On a des centaines de tirs passés avec leur distance et leur résultat. Un nouveau tir arrive à <b>11 mètres</b>. La seule question est : <b>comment utiliser le passé pour lui donner une chance de but ?</b></p>
        <div className="concrete-story-card">
          <span>Même problème, trois raisonnements possibles</span>
          <strong>A · apprendre une tendance générale</strong>
          <strong>B · regarder des tirs passés qui ressemblent au nouveau</strong>
          <strong>C · construire une petite suite de règles</strong>
        </div>
        <p className="microcopy">Les noms techniques arriveront seulement après que chaque raisonnement soit clair.</p>
        <ContinueButton onClick={() => setStep(1)}>Essayer la méthode A</ContinueButton>
      </LabShell>
    )
  }

  if (step === 1) {
    return (
      <LabShell visual={<TrendVisual model={logistic} distance={distance} />}>
        <Eyebrow>11.1 · Méthode A — apprendre une tendance</Eyebrow>
        <h1>Imagine une courbe qui résume tous les tirs passés.</h1>
        <p className="lead">Exemple banal : pour estimer le temps d’un trajet, tu sais que <b>plus la distance augmente, plus le trajet tend à durer</b>. Il n’existe pas forcément une frontière brutale à 10 km. Ici on fait pareil avec les tirs.</p>
        <div className="concrete-rule-card">
          <span>Pour cette démonstration, le modèle ne voit qu’une seule information</span>
          <strong>Distance du tir</strong>
          <small>On cache volontairement l’angle, le joueur, le type de tir, etc.</small>
        </div>
        <label className="concrete-slider">
          <span>Déplace le même tir plus près ou plus loin</span>
          <strong>{distance.toFixed(0)} m → {Math.round(smoothProbability * 100)}% de chance estimée</strong>
          <input type="range" min="5" max="30" step="1" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setTrendTouched(true) }} />
        </label>
        <div className="plain-explanation"><strong>Ce qui se passe vraiment</strong><span>La machine a regardé <b>tous</b> les tirs d’entraînement et a appris une courbe. Quand tu changes seulement la distance, elle lit un autre endroit de cette même courbe.</span></div>
        {trendTouched && <div className="name-reveal"><span>Nom technique, maintenant seulement</span><strong>Régression logistique</strong><small>Ici : une méthode qui apprend une relation lisse pour produire une probabilité.</small></div>}
        <ContinueButton disabled={!trendTouched} onClick={() => { setDistance(initialDistance); setStep(2) }}>Essayer la méthode B</ContinueButton>
      </LabShell>
    )
  }

  if (step === 2) {
    return (
      <LabShell visual={<NeighborsVisual neighbors={neighbors} goals={neighborGoals} />}>
        <Eyebrow>11.2 · Méthode B — chercher des cas ressemblants</Eyebrow>
        <h1>Cette fois, aucune grande courbe : on cherche simplement des tirs proches du tien.</h1>
        <p className="lead">Métaphore : pour estimer le prix d’un appartement de 45 m², tu peux regarder le prix de <b>quelques appartements très similaires</b> plutôt que calculer une grande tendance sur toute la ville.</p>
        <div className="concrete-rule-card">
          <span>Nouveau tir à estimer</span>
          <strong>{distance.toFixed(0)} mètres</strong>
          <small>On cherche les tirs passés dont la distance est la plus proche.</small>
        </div>
        <div className="neighbor-choice-row">
          {[3, 5, 9].map((value) => <button key={value} className={k === value ? 'selected' : ''} onClick={() => { setK(value); setNeighborTouched(true) }}>Regarder {value} tirs similaires</button>)}
        </div>
        <div className="plain-explanation"><strong>Calcul visible</strong><span>Parmi les {neighbors.length} tirs les plus proches, <b>{neighborGoals}</b> ont fini en but. La méthode répond donc simplement <b>{neighborGoals}/{neighbors.length} ≈ {Math.round(neighborProbability * 100)}%</b>.</span></div>
        <label className="concrete-slider compact">
          <span>Change aussi la distance du nouveau tir</span>
          <strong>{distance.toFixed(0)} m</strong>
          <input type="range" min="5" max="30" step="1" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setNeighborTouched(true) }} />
        </label>
        {neighborTouched && <div className="name-reveal"><span>Nom technique</span><strong>k-NN</strong><small>k nearest neighbours = « les k plus proches voisins ».</small></div>}
        <ContinueButton disabled={!neighborTouched} onClick={() => { setDistance(initialDistance); setStep(3) }}>Essayer la méthode C</ContinueButton>
      </LabShell>
    )
  }

  if (step === 3) {
    return (
      <LabShell visual={<RulesVisual trace={treeTrace} probability={treeProbability} />}>
        <Eyebrow>11.3 · Méthode C — poser des questions successives</Eyebrow>
        <h1>Comme un petit questionnaire « si / alors ».</h1>
        <p className="lead">Métaphore : pour choisir un manteau, tu pourrais demander « fait-il moins de 10°C ? », puis « est-ce qu’il pleut ? ». Ici la machine apprend elle-même ses questions à partir des tirs passés.</p>
        <div className="concrete-rule-card">
          <span>Le tir entre dans le questionnaire</span>
          <strong>{distance.toFixed(0)} mètres</strong>
          <small>À chaque question, la réponse oui/non choisit la branche suivante.</small>
        </div>
        <label className="concrete-slider">
          <span>Déplace le tir et regarde son chemin changer</span>
          <strong>{distance.toFixed(0)} m → groupe final à {Math.round(treeProbability * 100)}%</strong>
          <input type="range" min="5" max="30" step="1" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setTreeTouched(true) }} />
        </label>
        <div className="plain-explanation"><strong>Le pourcentage final vient d’où ?</strong><span>Une fois le chemin terminé, le tir tombe dans un groupe de tirs passés. Le pourcentage correspond à la proportion de buts observée dans ce groupe.</span></div>
        {treeTouched && <div className="name-reveal"><span>Nom technique</span><strong>Arbre de décision</strong><small>Un ensemble de règles « si / alors » apprises automatiquement.</small></div>}
        <ContinueButton disabled={!treeTouched} onClick={() => { setDistance(initialDistance); setStep(4) }}>Mettre les trois côte à côte</ContinueButton>
      </LabShell>
    )
  }

  if (step === 4) {
    return (
      <LabShell visual={<ComparisonVisual smooth={smoothProbability} neighbors={neighborProbability} tree={treeProbability} />}>
        <Eyebrow>11.4 · Même tir, trois raisonnements</Eyebrow>
        <h1>Maintenant les trois noms devraient correspondre à quelque chose de concret.</h1>
        <p className="lead">Déplace le même tir. Les trois méthodes reçoivent exactement la même information — la distance — mais elles n’utilisent pas le passé de la même façon.</p>
        <label className="concrete-slider">
          <span>Distance du tir</span>
          <strong>{distance.toFixed(0)} m</strong>
          <input type="range" min="5" max="30" step="1" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setCompareTouched(true) }} />
        </label>
        <div className="three-method-recap">
          <div><span>Régression logistique</span><strong>{Math.round(smoothProbability * 100)}%</strong><small>« Je consulte la tendance générale apprise sur tous les tirs. »</small></div>
          <div><span>k-NN · {k} voisins</span><strong>{Math.round(neighborProbability * 100)}%</strong><small>« Je regarde ce qui est arrivé aux tirs les plus ressemblants. »</small></div>
          <div><span>Arbre de décision</span><strong>{Math.round(treeProbability * 100)}%</strong><small>« Je fais passer le tir dans mes règles si/alors. »</small></div>
        </div>
        <div className="plain-explanation"><strong>Point essentiel</strong><span>Un « modèle » n’est donc pas une formule magique unique. C’est une <b>façon d’utiliser des exemples passés pour fabriquer une prédiction</b>. Des familles différentes utilisent ces exemples différemment.</span></div>
        <ContinueButton disabled={!compareTouched} onClick={() => setStep(5)}>Faire le point</ContinueButton>
      </LabShell>
    )
  }

  return (
    <LabShell visual={<ThreeWaysIntro named />}>
      <Eyebrow>Chapitre 11 · Checkpoint</Eyebrow>
      <h1>On s’arrête volontairement ici sur la technique.</h1>
      <p className="lead">Si tu peux expliquer les trois phrases ci-dessous sans regarder leur nom, alors le pont est enfin au bon endroit.</p>
      <div className="three-method-recap text-only">
        <div><strong>Tendance générale</strong><small>Apprendre une relation globale et lisse à partir de tous les exemples.</small></div>
        <div><strong>Cas ressemblants</strong><small>Regarder ce qui est arrivé à quelques exemples proches du nouveau cas.</small></div>
        <div><strong>Questions successives</strong><small>Découper les exemples avec une suite de règles si/alors.</small></div>
      </div>
      <div className="checkpoint"><span>À ne pas apprendre par cœur</span><strong>Les mots « logistique », « k-NN » et « arbre » sont juste les noms de ces trois mécanismes. Le mécanisme compte avant le vocabulaire.</strong></div>
      <p className="microcopy">Je ne réintroduis volontairement ni accuracy, ni Brier, ni cross-validation dans ce chapitre. On validera d’abord que ces trois modèles sont vraiment clairs.</p>
      <ContinueButton onClick={onComplete}>Terminer le chapitre</ContinueButton>
    </LabShell>
  )
}

function ThreeWaysIntro({ named = false }: { named?: boolean }) {
  const methods = [
    ['A', 'Apprendre une tendance', named ? 'Régression logistique' : 'Nom plus tard'],
    ['B', 'Chercher des cas ressemblants', named ? 'k-NN' : 'Nom plus tard'],
    ['C', 'Poser des questions successives', named ? 'Arbre de décision' : 'Nom plus tard'],
  ]
  return <div className="three-ways-board">{methods.map(([letter, title, name]) => <div key={letter}><span>Méthode {letter}</span><strong>{title}</strong><small>{name}</small></div>)}</div>
}

function TrendVisual({ model, distance }: { model: ReturnType<typeof trainLogistic>; distance: number }) {
  const points = [6, 10, 14, 20, 28].map((value) => ({ value, probability: predictProbability(model, [value]) }))
  return <div className="trend-concrete-board"><span>Une seule courbe apprise sur tous les tirs</span>{points.map((point) => <div key={point.value} className={Math.round(distance) === point.value ? 'active' : ''}><strong>{point.value} m</strong><i style={{ width: `${Math.max(3, point.probability * 100)}%` }} /><b>{Math.round(point.probability * 100)}%</b></div>)}</div>
}

function NeighborsVisual({ neighbors, goals }: { neighbors: Neighbor[]; goals: number }) {
  return <div className="neighbors-concrete-board"><span>Les tirs passés les plus proches en distance</span>{neighbors.map((neighbor, index) => <div key={neighbor.shot.id}><small>#{index + 1}</small><strong>{neighbor.shot.distance.toFixed(1)} m</strong><em>écart {neighbor.gap.toFixed(1)} m</em><b>{neighbor.shot.goal ? '⚽ BUT' : '× raté'}</b></div>)}<p>{goals} but(s) / {neighbors.length} voisins</p></div>
}

function RulesVisual({ trace, probability }: { trace: TreeTrace[]; probability: number }) {
  return <div className="rules-concrete-board"><span>Chemin suivi par le tir</span>{trace.map((item, index) => <div key={`${item.question}-${index}`}><small>Question {index + 1}</small><strong>{item.question}</strong><b>{item.answer.toUpperCase()}</b></div>)}<p>Groupe final → {Math.round(probability * 100)}% de buts observés</p></div>
}

function ComparisonVisual({ smooth, neighbors, tree }: { smooth: number; neighbors: number; tree: number }) {
  return <div className="comparison-concrete-board">{[
    ['Tendance', smooth],
    ['Voisins', neighbors],
    ['Règles', tree],
  ].map(([label, probability]) => <div key={String(label)}><span>{String(label)}</span><strong>{Math.round(Number(probability) * 100)}%</strong><i style={{ width: `${Math.max(3, Number(probability) * 100)}%` }} /></div>)}</div>
}

function nearestByDistance(shots: Shot[], distance: number, k: number): Neighbor[] {
  return shots
    .map((shot) => ({ shot, gap: Math.abs(shot.distance - distance) }))
    .sort((a, b) => a.gap - b.gap)
    .slice(0, k)
}

function traceTree(root: TreeNode, distance: number): TreeTrace[] {
  const trace: TreeTrace[] = []
  let node = root
  while (node.threshold !== undefined && node.left && node.right) {
    const goesLeft = distance <= node.threshold
    trace.push({ question: `Distance ≤ ${node.threshold.toFixed(1)} m ?`, answer: goesLeft ? 'oui' : 'non' })
    node = goesLeft ? node.left : node.right
  }
  return trace
}

function leafProbability(root: TreeNode, distance: number) {
  let node = root
  while (node.threshold !== undefined && node.left && node.right) node = distance <= node.threshold ? node.left : node.right
  return node.probability
}
