import { useEffect, useMemo, useState } from 'react'
import { Chapter1 } from './chapters/Chapter1'
import { Chapter2 } from './chapters/Chapter2'
import { Chapter3 } from './chapters/Chapter3'
import type { Progress } from './types'

const STORAGE_KEY = 'ml-football-lab-progress-v0'

const defaultProgress: Progress = {
  chapter: 1,
  chapter1Step: 0,
  chapter2Step: 0,
  chapter3Step: 0,
  manualThreshold: 11,
  completed: [],
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress
    return { ...defaultProgress, ...JSON.parse(raw) }
  } catch {
    return defaultProgress
  }
}

const chapterMeta = [
  { id: 1, short: '01', title: 'Prédire', subtitle: 'Construire une règle' },
  { id: 2, short: '02', title: 'Apprendre', subtitle: 'Premier modèle' },
  { id: 3, short: '03', title: 'Décrire', subtitle: 'Choisir des features' },
] as const

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const maxUnlocked = useMemo(() => Math.min(3, Math.max(1, ...progress.completed.map((chapter) => chapter + 1))), [progress.completed])
  const finished = progress.completed.includes(3) && progress.chapter === 3

  const update = (patch: Partial<Progress>) => setProgress((current) => ({ ...current, ...patch }))
  const completeChapter = (chapter: 1 | 2 | 3) => {
    setProgress((current) => ({
      ...current,
      completed: current.completed.includes(chapter) ? current.completed : [...current.completed, chapter],
      chapter: chapter < 3 ? ((chapter + 1) as 1 | 2 | 3) : 3,
    }))
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setProgress(defaultProgress)
  }

  return (
    <div className="app-frame">
      <header className="topbar">
        <button className="brand" onClick={() => update({ chapter: 1 })} aria-label="Retour au premier chapitre">
          <span className="brand-mark">ML</span>
          <span><strong>Football Lab</strong><small>apprendre en manipulant</small></span>
        </button>
        <div className="top-progress" aria-label={`${progress.completed.length} chapitres terminés sur 3`}>
          <span>{progress.completed.length}/3</span>
          <div><i style={{ width: `${(progress.completed.length / 3) * 100}%` }} /></div>
        </div>
        <button className="reset-button" onClick={reset}>Recommencer</button>
      </header>

      <div className="workspace">
        <aside className="chapter-nav">
          <div className="nav-heading">V0 · Les fondations</div>
          {chapterMeta.map((chapter) => {
            const locked = chapter.id > maxUnlocked
            const active = progress.chapter === chapter.id
            const done = progress.completed.includes(chapter.id)
            return (
              <button
                key={chapter.id}
                className={`chapter-link ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                disabled={locked}
                onClick={() => update({ chapter: chapter.id })}
              >
                <span className="chapter-number">{done ? '✓' : chapter.short}</span>
                <span><strong>{chapter.title}</strong><small>{locked ? 'Verrouillé' : chapter.subtitle}</small></span>
              </button>
            )
          })}
          <div className="nav-footer">
            <span className="status-dot" />
            <span>Données V0 pédagogiques<br />Pipeline StatsBomb prêt</span>
          </div>
        </aside>

        <main className="main-stage">
          {finished ? (
            <Completion onReview={() => update({ chapter3Step: 0, completed: progress.completed.filter((chapter) => chapter !== 3) })} />
          ) : progress.chapter === 1 ? (
            <Chapter1
              step={progress.chapter1Step}
              setStep={(chapter1Step) => update({ chapter1Step })}
              manualThreshold={progress.manualThreshold}
              setManualThreshold={(manualThreshold) => update({ manualThreshold })}
              onComplete={() => completeChapter(1)}
            />
          ) : progress.chapter === 2 ? (
            <Chapter2
              step={progress.chapter2Step}
              setStep={(chapter2Step) => update({ chapter2Step })}
              manualThreshold={progress.manualThreshold}
              onComplete={() => completeChapter(2)}
            />
          ) : (
            <Chapter3
              step={progress.chapter3Step}
              setStep={(chapter3Step) => update({ chapter3Step })}
              onComplete={() => completeChapter(3)}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function Completion({ onReview }: { onReview: () => void }) {
  return (
    <div className="completion-screen">
      <div className="completion-badge">V0 · TERMINÉE</div>
      <h1>Tu as posé les fondations.</h1>
      <p>Pas besoin de connaître dix algorithmes. Pour l’instant, l’important est que la boucle <strong>données → features → modèle → prédiction</strong> ait du sens.</p>
      <div className="completion-grid">
        <div><span>01</span><strong>Une prédiction peut venir d’une règle.</strong><small>Et une règle peut se tromper.</small></div>
        <div><span>02</span><strong>Un modèle apprend une relation.</strong><small>On ne programme pas chaque décision.</small></div>
        <div><span>03</span><strong>Il ne voit que ses features.</strong><small>Mieux décrire change ce qu’il peut apprendre.</small></div>
      </div>
      <div className="next-teaser wide"><span>Chapitre 04</span><strong>« 91% de bonnes réponses » — impressionnant… ou complètement trompeur&nbsp;?</strong><small>Prochaine marche : comprendre pourquoi il faut séparer apprentissage et évaluation.</small></div>
      <button className="secondary-button" onClick={onReview}>Revoir le chapitre 03</button>
    </div>
  )
}
