import { useMemo, useState } from 'react'
import { ContinueButton, Eyebrow, LabShell } from '../components/LabShell'
import { realShotMetadata, realShots } from '../data/realShots'

type Props = {
  step: number
  setStep: (step: number) => void
  onComplete: () => void
}

type Origin = 'source' | 'derived'
type FieldName = 'x' | 'y' | 'distance' | 'angle'

const fieldLabels: Record<FieldName, string> = {
  x: 'Position X',
  y: 'Position Y',
  distance: 'Distance au but',
  angle: 'Angle vers le but',
}

export function Chapter9({ step, setStep, onComplete }: Props) {
  const [guess, setGuess] = useState<'ready' | 'derived' | null>(null)
  const [showClean, setShowClean] = useState(false)
  const [origins, setOrigins] = useState<Partial<Record<FieldName, Origin>>>({})

  const shot = useMemo(
    () => realShots.find((item) => item.raw_excerpt && item.provenance?.player) ?? realShots[0],
    [],
  )

  const correctOrigins: Record<FieldName, Origin> = { x: 'source', y: 'source', distance: 'derived', angle: 'derived' }
  const allAnswered = (Object.keys(correctOrigins) as FieldName[]).every((field) => origins[field])
  const allCorrect = allAnswered && (Object.keys(correctOrigins) as FieldName[]).every((field) => origins[field] === correctOrigins[field])

  if (step === 0) {
    return (
      <LabShell
        visual={
          <div className="clean-row-card">
            <span>La ligne que notre modèle aime</span>
            <div><small>distance</small><strong>{shot.distance.toFixed(1)} m</strong></div>
            <div><small>angle</small><strong>{shot.angle.toFixed(1)}°</strong></div>
            <div><small>résultat</small><strong>{shot.goal ? 'BUT' : 'PAS BUT'}</strong></div>
          </div>
        }
      >
        <Eyebrow>Chapitre 09 · D’où viennent vraiment nos colonnes&nbsp;?</Eyebrow>
        <h1>StatsBomb nous livre-t-il cette ligne toute prête&nbsp;?</h1>
        <p className="lead">Jusqu’ici, l’app t’a présenté des colonnes propres. Cette fois on ouvre la boîte et on regarde ce qui existait réellement dans la donnée source.</p>
        <div className="choice-row">
          <button className={`choice-button ${guess === 'ready' ? 'selected' : ''}`} onClick={() => setGuess('ready')}>Oui, distance et angle sont déjà là</button>
          <button className={`choice-button ${guess === 'derived' ? 'selected' : ''}`} onClick={() => setGuess('derived')}>Non, on les a probablement calculés</button>
        </div>
        {guess && (
          <>
            <div className={`feedback ${guess === 'derived' ? 'good' : 'neutral'}`}><strong>{guess === 'derived' ? 'Exact.' : 'Pas tout à fait.'}</strong><span>StatsBomb fournit notamment une position sur son terrain 120×80 et le résultat du tir. Notre pipeline transforme ensuite cette représentation en colonnes utiles au modèle.</span></div>
            <ContinueButton onClick={() => setStep(1)}>Voir l’extrait source réel</ContinueButton>
          </>
        )}
      </LabShell>
    )
  }

  if (step === 1) {
    return (
      <LabShell
        visual={
          <div className="raw-clean-stage">
            <div className="raw-panel">
              <span>Extrait exact StatsBomb</span>
              <pre>{JSON.stringify(shot.raw_excerpt, null, 2)}</pre>
            </div>
            {showClean && (
              <div className="clean-panel">
                <span>Après notre préparation</span>
                <code>{`{
  "x": ${shot.x},
  "y": ${shot.y},
  "distance": ${shot.distance},
  "angle": ${shot.angle},
  "goal": ${shot.goal}
}`}</code>
              </div>
            )}
          </div>
        }
      >
        <Eyebrow>Chapitre 09 · Raw → propre</Eyebrow>
        <h1>Ça, c’est beaucoup plus proche de la vraie vie.</h1>
        <p className="lead">Le JSON contient des objets imbriqués, des IDs, du texte et une position. Le modèle, lui, préfère une matrice simple de nombres et une cible.</p>
        <div className="intent-card"><strong>Ce que tu manipules</strong><span>Ici, pas de modèle : on transforme une observation réelle en représentation exploitable. C’est une partie entière du travail ML.</span></div>
        {!showClean ? <button className="secondary-button" onClick={() => setShowClean(true)}>Transformer cette observation</button> : <ContinueButton onClick={() => setStep(2)}>Distinguer donné et calculé</ContinueButton>}
      </LabShell>
    )
  }

  if (step === 2) {
    return (
      <LabShell
        visual={
          <div className="origin-grid">
            {(Object.keys(fieldLabels) as FieldName[]).map((field) => (
              <div key={field} className="origin-card">
                <strong>{fieldLabels[field]}</strong>
                <small>{field === 'x' ? shot.x : field === 'y' ? shot.y : field === 'distance' ? `${shot.distance.toFixed(1)} m` : `${shot.angle.toFixed(1)}°`}</small>
                <div>
                  <button className={origins[field] === 'source' ? 'selected' : ''} onClick={() => setOrigins((current) => ({ ...current, [field]: 'source' }))}>vient de la source</button>
                  <button className={origins[field] === 'derived' ? 'selected' : ''} onClick={() => setOrigins((current) => ({ ...current, [field]: 'derived' }))}>calculé par nous</button>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <Eyebrow>Chapitre 09 · Feature dérivée</Eyebrow>
        <h1>Qu’est-ce qui existait déjà, et qu’est-ce que nous avons fabriqué&nbsp;?</h1>
        <p className="lead">Classe les quatre informations. Tu peux changer tes réponses avant de continuer.</p>
        <div className="intent-card"><strong>Pourquoi c’est important</strong><span>Un modèle ne voit jamais « le football ». Il voit une représentation que nous avons construite à partir des données disponibles.</span></div>
        {allAnswered && (
          <>
            <div className={`feedback ${allCorrect ? 'good' : 'neutral'}`}><strong>{allCorrect ? 'Tout bon.' : 'Il reste une confusion.'}</strong><span>X et Y sont fournis par StatsBomb. Distance et angle sont calculés par notre pipeline à partir de ces coordonnées.</span></div>
            {allCorrect && <ContinueButton onClick={() => setStep(3)}>Voir pourquoi la provenance compte</ContinueButton>}
          </>
        )}
      </LabShell>
    )
  }

  return (
    <LabShell
      visual={
        <div className="provenance-card">
          <span>Observation réelle</span>
          <strong>{shot.provenance?.player ?? 'Joueur inconnu'}</strong>
          <div><small>Équipe</small><b>{shot.provenance?.team ?? '—'}</b></div>
          <div><small>Minute</small><b>{shot.provenance?.minute ?? '—'}</b></div>
          <div><small>Match ID</small><b>{shot.match_id ?? '—'}</b></div>
          <div><small>Source</small><b>StatsBomb Open Data</b></div>
        </div>
      }
    >
      <Eyebrow>Chapitre 09 · Préparation des données</Eyebrow>
      <h1>Les features commencent avant le modèle.</h1>
      <p className="lead">Sur {realShotMetadata.shot_count} tirs réels de notre échantillon, le pipeline conserve la provenance et fabrique des colonnes cohérentes. On peut maintenant entraîner un modèle sur la même définition de distance et d’angle pour chaque tir.</p>
      <div className="reveal-card"><span>Concept débloqué</span><strong>Préprocessing : transformer des données brutes en une représentation cohérente que l’algorithme peut utiliser. Feature dérivée : une information calculée à partir des données source.</strong></div>
      <p className="microcopy">Source : StatsBomb Open Data · échantillon Bundesliga 2023/24. Les données sont préparées offline et embarquées dans l’app.</p>
      <ContinueButton onClick={onComplete}>Choisir de meilleures features</ContinueButton>
    </LabShell>
  )
}
