import { useEffect, useMemo, useState } from 'react'
import { Chapter1 } from './chapters/Chapter1'
import { Chapter2 } from './chapters/Chapter2'
import { Chapter3 } from './chapters/Chapter3'
import { Chapter4 } from './chapters/Chapter4'
import { Chapter5 } from './chapters/Chapter5'
import { Chapter6 } from './chapters/Chapter6'
import { Chapter7 } from './chapters/Chapter7'
import { Chapter8 } from './chapters/Chapter8'
import { Chapter9 } from './chapters/Chapter9'
import { Chapter10 } from './chapters/Chapter10'
import type { ChapterId, Progress } from './types'

const STORAGE_KEY = 'ml-football-lab-progress-v1'
const LEGACY_STORAGE_KEY = 'ml-football-lab-progress-v0'
const CHAPTER_COUNT = 10

const defaultProgress: Progress = {
  chapter: 1,
  chapter1Step: 0,
  chapter2Step: 0,
  chapter3Step: 0,
  chapter4Step: 0,
  chapter5Step: 0,
  chapter6Step: 0,
  chapter7Step: 0,
  chapter8Step: 0,
  chapter9Step: 0,
  chapter10Step: 0,
  manualThreshold: 11,
  completed: [],
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
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
  { id: 4, short: '04', title: 'Tester', subtitle: 'Train / test' },
  { id: 5, short: '05', title: 'Probabiliser', subtitle: 'Comprendre le xG' },
  { id: 6, short: '06', title: 'Déjouer', subtitle: 'Overfitting & leakage' },
  { id: 7, short: '07', title: 'Comparer', subtitle: 'Premier mini-labo' },
  { id: 8, short: '08', title: 'Mesurer', subtitle: 'Baseline & erreurs' },
  { id: 9, short: '09', title: 'Préparer', subtitle: 'Vraies données source' },
  { id: 10, short: '10', title: 'Enrichir', subtitle: 'Feature engineering' },
] as const

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const maxUnlocked = useMemo(
    () => Math.min(CHAPTER_COUNT, Math.max(1, ...progress.completed.map((chapter) => chapter + 1))),
    [progress.completed],
  )
  const finished = progress.completed.includes(CHAPTER_COUNT) && progress.chapter === CHAPTER_COUNT

  const update = (patch: Partial<Progress>) => setProgress((current) => ({ ...current, ...patch }))

  const restartPatch = (chapter: ChapterId): Partial<Progress> => {
    switch (chapter) {
      case 1: return { chapter1Step: 0 }
      case 2: return { chapter2Step: 0 }
      case 3: return { chapter3Step: 0 }
      case 4: return { chapter4Step: 0 }
      case 5: return { chapter5Step: 0 }
      case 6: return { chapter6Step: 0 }
      case 7: return { chapter7Step: 0 }
      case 8: return { chapter8Step: 0 }
      case 9: return { chapter9Step: 0 }
      case 10: return { chapter10Step: 0 }
    }
  }

  const openChapter = (chapter: ChapterId) => update({ chapter, ...restartPatch(chapter) })

  const completeChapter = (chapter: ChapterId) => {
    setProgress((current) => ({
      ...current,
      completed: current.completed.includes(chapter) ? current.completed : [...current.completed, chapter],
      chapter: chapter < CHAPTER_COUNT ? ((chapter + 1) as ChapterId) : chapter,
    }))
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    setProgress(defaultProgress)
  }

  const renderChapterLink = (chapter: (typeof chapterMeta)[number]) => {
    const locked = chapter.id > maxUnlocked
    const active = progress.chapter === chapter.id
    const done = progress.completed.includes(chapter.id)
    return (
      <button
        key={chapter.id}
        className={`chapter-link ${active ? 'active' : ''} ${done ? 'done' : ''}`}
        disabled={locked}
        onClick={() => openChapter(chapter.id)}
      >
        <span className="chapter-number">{done ? '✓' : chapter.short}</span>
        <span><strong>{chapter.title}</strong><small>{locked ? 'Verrouillé' : done ? `${chapter.subtitle} · rejouer` : chapter.subtitle}</small></span>
      </button>
    )
  }

  return (
    <div className="app-frame">
      <header className="topbar">
        <button className="brand" onClick={() => openChapter(1)} aria-label="Rejouer le premier chapitre">
          <span className="brand-mark">ML</span>
          <span><strong>Football Lab</strong><small>apprendre en manipulant</small></span>
        </button>
        <div className="top-progress" aria-label={`${progress.completed.length} chapitres terminés sur ${CHAPTER_COUNT}`}>
          <span>{progress.completed.length}/{CHAPTER_COUNT}</span>
          <div><i style={{ width: `${(progress.completed.length / CHAPTER_COUNT) * 100}%` }} /></div>
        </div>
        <button className="reset-button" onClick={reset}>Tout recommencer</button>
      </header>

      <div className="workspace">
        <aside className="chapter-nav">
          <div className="nav-heading">Cycle 1 · Du problème au modèle</div>
          {chapterMeta.slice(0, 7).map(renderChapterLink)}
          <div className="nav-heading cycle-two-heading">Cycle 2 · Du modèle aux vraies données</div>
          {chapterMeta.slice(7).map(renderChapterLink)}
          <div className="nav-footer">
            <span className="status-dot" />
            <span>Modèles exécutés dans le navigateur<br />StatsBomb réel à partir du chapitre 08</span>
          </div>
        </aside>

        <main className="main-stage">
          {finished ? (
            <Completion onReview={() => openChapter(10)} />
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
          ) : progress.chapter === 3 ? (
            <Chapter3
              step={progress.chapter3Step}
              setStep={(chapter3Step) => update({ chapter3Step })}
              onComplete={() => completeChapter(3)}
            />
          ) : progress.chapter === 4 ? (
            <Chapter4
              step={progress.chapter4Step}
              setStep={(chapter4Step) => update({ chapter4Step })}
              onComplete={() => completeChapter(4)}
            />
          ) : progress.chapter === 5 ? (
            <Chapter5
              step={progress.chapter5Step}
              setStep={(chapter5Step) => update({ chapter5Step })}
              onComplete={() => completeChapter(5)}
            />
          ) : progress.chapter === 6 ? (
            <Chapter6
              step={progress.chapter6Step}
              setStep={(chapter6Step) => update({ chapter6Step })}
              onComplete={() => completeChapter(6)}
            />
          ) : progress.chapter === 7 ? (
            <Chapter7
              step={progress.chapter7Step}
              setStep={(chapter7Step) => update({ chapter7Step })}
              onComplete={() => completeChapter(7)}
            />
          ) : progress.chapter === 8 ? (
            <Chapter8
              step={progress.chapter8Step}
              setStep={(chapter8Step) => update({ chapter8Step })}
              onComplete={() => completeChapter(8)}
            />
          ) : progress.chapter === 9 ? (
            <Chapter9
              step={progress.chapter9Step}
              setStep={(chapter9Step) => update({ chapter9Step })}
              onComplete={() => completeChapter(9)}
            />
          ) : (
            <Chapter10
              step={progress.chapter10Step}
              setStep={(chapter10Step) => update({ chapter10Step })}
              onComplete={() => completeChapter(10)}
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
      <div className="completion-badge">CHECKPOINT CYCLE 2 · ATTEINT</div>
      <h1>Tu as quitté le petit modèle de démonstration.</h1>
      <p>Tu as maintenant utilisé des tirs StatsBomb réels, comparé ton modèle à une baseline, manipulé les types d’erreurs, ouvert la donnée source et testé des features sur des tirs inconnus.</p>
      <div className="completion-grid four-cards">
        <div><span>01–03</span><strong>Construire le problème.</strong><small>Cible, features, modèle.</small></div>
        <div><span>04–07</span><strong>Expérimenter.</strong><small>Train/test, probabilité, overfitting, comparaison.</small></div>
        <div><span>08–09</span><strong>Questionner le score et la donnée.</strong><small>Baseline, erreurs, raw data, preprocessing.</small></div>
        <div><span>10</span><strong>Tester une hypothèse football.</strong><small>Feature engineering et ablation.</small></div>
      </div>
      <div className="next-teaser wide"><span>Prochaine marche</span><strong>Vérifier si nos probabilités sont crédibles, puis si nos conclusions restent stables quand on change les données de validation.</strong><small>Calibration puis cross-validation — mais seulement après ton prochain playtest.</small></div>
      <button className="secondary-button" onClick={onReview}>Rejouer le chapitre 10</button>
    </div>
  )
}
