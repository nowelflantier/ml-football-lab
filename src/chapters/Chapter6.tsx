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

export function Chapter6({ step, setStep, onComplete }: Props) {
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

  if (step === 0) return (
    <LabShell visual={<ThreeWaysIntro />}>
      <Eyebrow>Chapitre 06 · Trois façons de prédire</Eyebrow>
      <h1>Un modèle n’est pas une seule formule magique.</h1>
      <p className="lead">On a beaucoup de tirs passés avec leur distance et leur résultat. Un nouveau tir arrive à <b>11 mètres</b>. Comment utiliser le passé pour lui donner une estimation de chance de but&nbsp;?</p>
      <div className="concrete-story-card">
        <span>Trois raisonnements possibles</span>
        <strong>A · résumer tous les exemples par une tendance</strong>
        <strong>B · regarder quelques cas qui ressemblent au nouveau</strong>
        <strong>C · poser une suite de questions si / alors</strong>
      </div>
      <p className="microcopy">On commence par les raisonnements. Les noms techniques arrivent après.</p>
      <ContinueButton onClick={() => setStep(1)}>Essayer la méthode A</ContinueButton>
    </LabShell>
  )

  if (step === 1) return (
    <LabShell visual={<TrendVisual model={logistic} distance={distance} />}>
      <Eyebrow>06.1 · Méthode A — apprendre une tendance</Eyebrow>
      <h1>Imagine une courbe qui résume tous les tirs passés.</h1>
      <p className="lead">Exemple banal : pour estimer le temps d’un trajet, plus la distance augmente, plus le trajet tend à durer. Pas besoin d’une frontière brutale à 10 km. Ici, on cherche une tendance du même genre entre <b>distance du tir</b> et <b>chance de but</b>.</p>
      <div className="concrete-rule-card"><span>Pour cette démonstration, une seule information existe</span><strong>Distance du tir</strong><small>L’angle, le joueur et le contexte sont volontairement cachés.</small></div>
      <label className="concrete-slider">
        <span>Déplace exactement le même tir</span>
        <strong>{distance.toFixed(0)} m → estimation du modèle&nbsp;: {Math.round(smoothProbability * 100)}%</strong>
        <input type="range" min="5" max="30" step="1" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setTrendTouched(true) }} />
      </label>
      <div className="plain-explanation"><strong>Ce que fait la machine</strong><span>Elle a utilisé <b>tous</b> les exemples d’apprentissage pour ajuster une tendance. Quand tu changes la distance, elle lit un autre endroit de cette même tendance. Le pourcentage reste une <b>estimation du modèle</b>, pas une vérité physique.</span></div>
      {trendTouched && <div className="name-reveal"><span>Nom technique</span><strong>Régression logistique</strong><small>Ici, retiens surtout « tendance globale → probabilité ».</small></div>}
      <ContinueButton disabled={!trendTouched} onClick={() => { setDistance(initialDistance); setStep(2) }}>Essayer la méthode B</ContinueButton>
    </LabShell>
  )

  if (step === 2) return (
    <LabShell visual={<NeighborsVisual neighbors={neighbors} goals={neighborGoals} />}>
      <Eyebrow>06.2 · Méthode B — regarder des cas ressemblants</Eyebrow>
      <h1>Pas de grande courbe : on cherche quelques exemples proches.</h1>
      <p className="lead">Pour estimer le prix d’un appartement de 45 m², tu pourrais regarder le prix de quelques appartements de taille proche. Ici, on fait pareil avec la distance des tirs.</p>
      <div className="concrete-rule-card"><span>Tir à estimer</span><strong>{distance.toFixed(0)} mètres</strong><small>On cherche dans le passé les distances les plus proches.</small></div>
      <div className="neighbor-choice-row">{[3, 5, 9].map((value) => <button key={value} className={k === value ? 'selected' : ''} onClick={() => { setK(value); setNeighborTouched(true) }}>Regarder {value} tirs proches</button>)}</div>
      <div className="plain-explanation"><strong>Le calcul est littéral</strong><span>Parmi les {neighbors.length} tirs choisis, <b>{neighborGoals}</b> ont fini en but. Cette méthode répond donc <b>{neighborGoals}/{neighbors.length} ≈ {Math.round(neighborProbability * 100)}%</b>.</span></div>
      <label className="concrete-slider compact"><span>Change la distance du nouveau tir</span><strong>{distance.toFixed(0)} m</strong><input type="range" min="5" max="30" step="1" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setNeighborTouched(true) }} /></label>
      {neighborTouched && <div className="name-reveal"><span>Nom technique</span><strong>k-NN</strong><small>k nearest neighbours = les k plus proches voisins.</small></div>}
      <ContinueButton disabled={!neighborTouched} onClick={() => { setDistance(initialDistance); setStep(3) }}>Essayer la méthode C</ContinueButton>
    </LabShell>
  )

  if (step === 3) return (
    <LabShell visual={<RulesVisual trace={treeTrace} probability={treeProbability} />}>
      <Eyebrow>06.3 · Méthode C — poser des questions successives</Eyebrow>
      <h1>Comme un petit questionnaire « si / alors ».</h1>
      <p className="lead">Pour choisir un manteau, tu pourrais demander « fait-il moins de 10°C ? », puis « est-ce qu’il pleut ? ». Ici, la machine apprend elle-même des coupures de distance qui séparent les exemples.</p>
      <div className="concrete-rule-card"><span>Le tir entre dans le questionnaire</span><strong>{distance.toFixed(0)} mètres</strong><small>Chaque réponse oui/non choisit la branche suivante.</small></div>
      <label className="concrete-slider"><span>Déplace le tir et regarde son chemin</span><strong>{distance.toFixed(0)} m → groupe final estimé à {Math.round(treeProbability * 100)}%</strong><input type="range" min="5" max="30" step="1" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setTreeTouched(true) }} /></label>
      <div className="plain-explanation"><strong>D’où vient le pourcentage final&nbsp;?</strong><span>Le chemin termine dans un groupe de tirs passés. Si ce groupe contient par exemple 2 buts sur 12 tirs, le modèle renvoie environ 17%. C’est pour cela qu’un tir à 23 m peut parfois recevoir plus qu’un tir à 20 m&nbsp;: ils peuvent tomber dans <b>deux groupes différents</b>.</span></div>
      {treeTouched && <div className="name-reveal"><span>Nom technique</span><strong>Arbre de décision</strong><small>Une suite de règles si/alors apprises automatiquement.</small></div>}
      <ContinueButton disabled={!treeTouched} onClick={() => { setDistance(initialDistance); setStep(4) }}>Comparer les trois</ContinueButton>
    </LabShell>
  )

  if (step === 4) return (
    <LabShell visual={<ComparisonVisual smooth={smoothProbability} neighbors={neighborProbability} tree={treeProbability} />}>
      <Eyebrow>06.4 · Même tir, trois raisonnements</Eyebrow>
      <h1>Trois estimations différentes ne sont pas trois vérités différentes.</h1>
      <p className="lead">Les trois méthodes utilisent les mêmes exemples passés et, ici, uniquement la distance. Mais elles exploitent ces exemples de façons différentes.</p>
      <label className="concrete-slider"><span>Distance du tir</span><strong>{distance.toFixed(0)} m</strong><input type="range" min="5" max="30" step="1" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setCompareTouched(true) }} /></label>
      <div className="three-method-recap">
        <div><span>Régression logistique</span><strong>{Math.round(smoothProbability * 100)}%</strong><small>« J’utilise une tendance globale apprise sur tous les exemples. »</small></div>
        <div><span>k-NN · {k} voisins</span><strong>{Math.round(neighborProbability * 100)}%</strong><small>« Je regarde ce qui est arrivé aux exemples les plus proches. »</small></div>
        <div><span>Arbre de décision</span><strong>{Math.round(treeProbability * 100)}%</strong><small>« Je fais passer le tir dans une suite de règles. »</small></div>
      </div>
      <div className="plain-explanation"><strong>Le mot « modèle » devient plus concret</strong><span>Un modèle est une façon apprise d’utiliser des données passées pour produire une prédiction. La famille choisie détermine <b>comment</b> les exemples passés sont utilisés.</span></div>
      <ContinueButton disabled={!compareTouched} onClick={() => setStep(5)}>Faire le point</ContinueButton>
    </LabShell>
  )

  return (
    <LabShell visual={<ThreeWaysIntro named />}>
      <Eyebrow>Chapitre 06 · Checkpoint</Eyebrow>
      <h1>Le mécanisme compte avant le nom.</h1>
      <div className="three-method-recap text-only">
        <div><strong>Tendance générale</strong><small>Apprendre une relation globale et lisse.</small></div>
        <div><strong>Cas ressemblants</strong><small>Regarder ce qui est arrivé à quelques voisins proches.</small></div>
        <div><strong>Questions successives</strong><small>Découper les exemples avec des règles si/alors.</small></div>
      </div>
      <div className="checkpoint"><span>À garder</span><strong>Logistique, k-NN et arbre sont trois façons différentes de transformer des exemples passés en estimation. Aucune estimation n’est automatiquement « la vérité ».</strong></div>
      <ContinueButton onClick={onComplete}>Passer au surapprentissage</ContinueButton>
    </LabShell>
  )
}

function ThreeWaysIntro({ named = false }: { named?: boolean }) {
  const methods = [
    ['A', 'Apprendre une tendance', named ? 'Régression logistique' : 'nom après'],
    ['B', 'Chercher des cas ressemblants', named ? 'k-NN' : 'nom après'],
    ['C', 'Poser des questions successives', named ? 'Arbre de décision' : 'nom après'],
  ]
  return <div className="three-ways-board">{methods.map(([letter, title, name]) => <div key={letter}><span>Méthode {letter}</span><strong>{title}</strong><small>{name}</small></div>)}</div>
}

function TrendVisual({ model, distance }: { model: ReturnType<typeof trainLogistic>; distance: number }) {
  const points = [6, 10, 14, 20, 28].map((value) => ({ value, probability: predictProbability(model, [value]) }))
  return <div className="trend-concrete-board"><span>Tendance apprise sur les exemples</span>{points.map((point) => <div key={point.value} className={Math.round(distance) === point.value ? 'active' : ''}><strong>{point.value} m</strong><i style={{ width: `${Math.max(3, point.probability * 100)}%` }} /><b>{Math.round(point.probability * 100)}%</b></div>)}</div>
}

function NeighborsVisual({ neighbors, goals }: { neighbors: Neighbor[]; goals: number }) {
  return <div className="neighbors-concrete-board"><span>Tirs passés les plus proches en distance</span>{neighbors.map((neighbor, index) => <div key={neighbor.shot.id}><small>#{index + 1}</small><strong>{neighbor.shot.distance.toFixed(1)} m</strong><em>écart {neighbor.gap.toFixed(1)} m</em><b>{neighbor.shot.goal ? '⚽ BUT' : '× raté'}</b></div>)}<p>{goals} but(s) / {neighbors.length} voisins</p></div>
}

function RulesVisual({ trace, probability }: { trace: TreeTrace[]; probability: number }) {
  return <div className="rules-concrete-board"><span>Chemin suivi</span>{trace.map((item, index) => <div key={`${item.question}-${index}`}><small>Question {index + 1}</small><strong>{item.question}</strong><b>{item.answer.toUpperCase()}</b></div>)}<p>Groupe final → {Math.round(probability * 100)}% de buts observés</p></div>
}

function ComparisonVisual({ smooth, neighbors, tree }: { smooth: number; neighbors: number; tree: number }) {
  return <div className="comparison-concrete-board">{[['Tendance', smooth], ['Voisins', neighbors], ['Règles', tree]].map(([label, probability]) => <div key={String(label)}><span>{String(label)}</span><strong>{Math.round(Number(probability) * 100)}%</strong><i style={{ width: `${Math.max(3, Number(probability) * 100)}%` }} /></div>)}</div>
}

function nearestByDistance(shots: Shot[], distance: number, k: number): Neighbor[] {
  return shots.map((shot) => ({ shot, gap: Math.abs(shot.distance - distance) })).sort((a, b) => a.gap - b.gap).slice(0, k)
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
