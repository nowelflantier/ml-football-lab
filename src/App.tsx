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
import { Chapter11 } from './chapters/Chapter11'
import { Chapter12 } from './chapters/Chapter12'
import { Chapter13 } from './chapters/Chapter13'
import { Chapter14 } from './chapters/Chapter14'
import { Chapter15 } from './chapters/Chapter15'
import { Chapter16 } from './chapters/Chapter16'
import { Chapter17 } from './chapters/Chapter17'
import { Chapter18 } from './chapters/Chapter18'
import { Chapter19 } from './chapters/Chapter19'
import { Chapter20 } from './chapters/Chapter20'
import type { ChapterId, Progress } from './types'

const STORAGE_KEY = 'ml-football-lab-progress-v1'
const LEGACY_STORAGE_KEY = 'ml-football-lab-progress-v0'
const GUIDED_COUNT = 12
const CHAPTER_COUNT = 20

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
  chapter11Step: 0,
  chapter12Step: 0,
  chapter13Step: 0,
  chapter14Step: 0,
  chapter15Step: 0,
  chapter16Step: 0,
  chapter17Step: 0,
  chapter18Step: 0,
  chapter19Step: 0,
  chapter20Step: 0,
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
  { id: 6, short: '06', title: 'Comprendre', subtitle: 'Trois façons de prédire' },
  { id: 7, short: '07', title: 'Surapprendre', subtitle: 'Trop coller aux exemples' },
  { id: 8, short: '08', title: 'Mesurer', subtitle: 'Baseline & erreurs' },
  { id: 9, short: '09', title: 'Préparer', subtitle: 'Vraies données source' },
  { id: 10, short: '10', title: 'Enrichir', subtitle: 'Features & fuite' },
  { id: 11, short: '11', title: 'Calibrer', subtitle: 'Quand 20% veut dire 20%' },
  { id: 12, short: '12', title: 'Valider', subtitle: 'Répéter le test' },
  { id: 13, short: '13', title: 'Arborer', subtitle: 'Decision tree' },
  { id: 14, short: '14', title: 'Régler', subtitle: 'Validation & tuning' },
  { id: 15, short: '15', title: 'Construire', subtitle: 'Model Workshop' },
  { id: 16, short: '16', title: 'Éprouver', subtitle: 'Holdout final' },
  { id: 17, short: '17', title: 'Diagnostiquer', subtitle: 'Error analysis' },
  { id: 18, short: '18', title: 'Interroger', subtitle: 'What-if lab' },
  { id: 19, short: '19', title: 'Agréger', subtitle: 'xG de match' },
  { id: 20, short: '20', title: 'Analyser', subtitle: 'Dashboard football' },
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
  const guidedComplete = progress.completed.includes(GUIDED_COUNT)
  const visibleProgressCount = guidedComplete
    ? progress.completed.length
    : progress.completed.filter((chapter) => chapter <= GUIDED_COUNT).length
  const visibleProgressTotal = guidedComplete ? CHAPTER_COUNT : GUIDED_COUNT
  const finished = progress.completed.includes(CHAPTER_COUNT) && progress.chapter === CHAPTER_COUNT
  const workshopUnlocked = maxUnlocked >= 13
  const analystUnlocked = maxUnlocked >= 17

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
      case 11: return { chapter11Step: 0 }
      case 12: return { chapter12Step: 0 }
      case 13: return { chapter13Step: 0 }
      case 14: return { chapter14Step: 0 }
      case 15: return { chapter15Step: 0 }
      case 16: return { chapter16Step: 0 }
      case 17: return { chapter17Step: 0 }
      case 18: return { chapter18Step: 0 }
      case 19: return { chapter19Step: 0 }
      case 20: return { chapter20Step: 0 }
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
        <div className="top-progress" aria-label={`${visibleProgressCount} chapitres terminés sur ${visibleProgressTotal}`}>
          <span>{visibleProgressCount}/{visibleProgressTotal}{!guidedComplete ? ' guidé' : ''}</span>
          <div><i style={{ width: `${(visibleProgressCount / visibleProgressTotal) * 100}%` }} /></div>
        </div>
        <button className="reset-button" onClick={reset}>Tout recommencer</button>
      </header>

      <div className="workspace">
        <aside className="chapter-nav">
          <div className="nav-heading">Parcours guidé · Comprendre une prédiction</div>
          {chapterMeta.slice(0, 6).map(renderChapterLink)}
          <div className="nav-heading cycle-two-heading">Parcours guidé · Faire confiance à l’expérience</div>
          {chapterMeta.slice(6, 12).map(renderChapterLink)}

          {workshopUnlocked ? (
            <>
              <div className="nav-heading cycle-two-heading">Ateliers avancés · Model Workshop</div>
              {chapterMeta.slice(12, 16).map(renderChapterLink)}
            </>
          ) : (
            <LockedCycle title="Model Workshop" copy="4 ateliers se débloquent après le chapitre 12." />
          )}

          {analystUnlocked ? (
            <>
              <div className="nav-heading cycle-two-heading">Pratique ouverte · Football Analyst</div>
              {chapterMeta.slice(16).map(renderChapterLink)}
            </>
          ) : workshopUnlocked ? (
            <LockedCycle title="Football Analyst" copy="4 analyses ouvertes se débloquent après le workshop." />
          ) : null}

          <div className="nav-footer">
            <span className="status-dot" />
            <span>Parcours guidé d’abord<br />Ateliers ensuite · StatsBomb réel</span>
          </div>
        </aside>

        <main className="main-stage">
          {finished ? <Completion onReview={() => openChapter(20)} /> : <ChapterRouter progress={progress} update={update} completeChapter={completeChapter} />}
        </main>
      </div>
    </div>
  )
}

function LockedCycle({ title, copy }: { title: string; copy: string }) {
  return <div className="nav-locked-cycle"><span>À venir</span><strong>{title}</strong><small>{copy}</small></div>
}

function ChapterRouter({ progress, update, completeChapter }: { progress: Progress; update: (patch: Partial<Progress>) => void; completeChapter: (chapter: ChapterId) => void }) {
  switch (progress.chapter) {
    case 1: return <Chapter1 step={progress.chapter1Step} setStep={(chapter1Step) => update({ chapter1Step })} manualThreshold={progress.manualThreshold} setManualThreshold={(manualThreshold) => update({ manualThreshold })} onComplete={() => completeChapter(1)} />
    case 2: return <Chapter2 step={progress.chapter2Step} setStep={(chapter2Step) => update({ chapter2Step })} manualThreshold={progress.manualThreshold} onComplete={() => completeChapter(2)} />
    case 3: return <Chapter3 step={progress.chapter3Step} setStep={(chapter3Step) => update({ chapter3Step })} onComplete={() => completeChapter(3)} />
    case 4: return <Chapter4 step={progress.chapter4Step} setStep={(chapter4Step) => update({ chapter4Step })} onComplete={() => completeChapter(4)} />
    case 5: return <Chapter5 step={progress.chapter5Step} setStep={(chapter5Step) => update({ chapter5Step })} onComplete={() => completeChapter(5)} />
    case 6: return <Chapter6 step={progress.chapter6Step} setStep={(chapter6Step) => update({ chapter6Step })} onComplete={() => completeChapter(6)} />
    case 7: return <Chapter7 step={progress.chapter7Step} setStep={(chapter7Step) => update({ chapter7Step })} onComplete={() => completeChapter(7)} />
    case 8: return <Chapter8 step={progress.chapter8Step} setStep={(chapter8Step) => update({ chapter8Step })} onComplete={() => completeChapter(8)} />
    case 9: return <Chapter9 step={progress.chapter9Step} setStep={(chapter9Step) => update({ chapter9Step })} onComplete={() => completeChapter(9)} />
    case 10: return <Chapter10 step={progress.chapter10Step} setStep={(chapter10Step) => update({ chapter10Step })} onComplete={() => completeChapter(10)} />
    case 11: return <Chapter11 step={progress.chapter11Step} setStep={(chapter11Step) => update({ chapter11Step })} onComplete={() => completeChapter(11)} />
    case 12: return <Chapter12 step={progress.chapter12Step} setStep={(chapter12Step) => update({ chapter12Step })} onComplete={() => completeChapter(12)} />
    case 13: return <Chapter13 step={progress.chapter13Step} setStep={(chapter13Step) => update({ chapter13Step })} onComplete={() => completeChapter(13)} />
    case 14: return <Chapter14 step={progress.chapter14Step} setStep={(chapter14Step) => update({ chapter14Step })} onComplete={() => completeChapter(14)} />
    case 15: return <Chapter15 step={progress.chapter15Step} setStep={(chapter15Step) => update({ chapter15Step })} onComplete={() => completeChapter(15)} />
    case 16: return <Chapter16 step={progress.chapter16Step} setStep={(chapter16Step) => update({ chapter16Step })} onComplete={() => completeChapter(16)} />
    case 17: return <Chapter17 step={progress.chapter17Step} setStep={(chapter17Step) => update({ chapter17Step })} onComplete={() => completeChapter(17)} />
    case 18: return <Chapter18 step={progress.chapter18Step} setStep={(chapter18Step) => update({ chapter18Step })} onComplete={() => completeChapter(18)} />
    case 19: return <Chapter19 step={progress.chapter19Step} setStep={(chapter19Step) => update({ chapter19Step })} onComplete={() => completeChapter(19)} />
    case 20: return <Chapter20 step={progress.chapter20Step} setStep={(chapter20Step) => update({ chapter20Step })} onComplete={() => completeChapter(20)} />
  }
}

function Completion({ onReview }: { onReview: () => void }) {
  return (
    <div className="completion-screen">
      <div className="completion-badge">FOOTBALL ANALYST MODE · TERMINÉ</div>
      <h1>Tu as quitté le tutoriel linéaire.</h1>
      <p>Tu peux maintenant construire un modèle, le valider, analyser ses erreurs, l’interroger, l’appliquer à un match complet et utiliser ses sorties pour chercher des questions football intéressantes.</p>
      <div className="completion-grid four-cards">
        <div><span>01–06</span><strong>Comprendre.</strong><small>Prédiction, features, test, probabilités et familles de modèles.</small></div>
        <div><span>07–12</span><strong>Faire confiance.</strong><small>Overfitting, baseline, données, leakage, calibration, validation.</small></div>
        <div><span>13–16</span><strong>Construire.</strong><small>Arbre, tuning, workbench, holdout.</small></div>
        <div><span>17–20</span><strong>Analyser.</strong><small>Erreurs, what-if, match xG, dashboard.</small></div>
      </div>
      <div className="next-teaser wide"><span>Suite ouverte</span><strong>Ensembles / boosting, interprétation avancée, davantage de matchs, profils joueurs, clustering, tracking — désormais déclenchés par une question football réelle.</strong></div>
      <button className="secondary-button" onClick={onReview}>Rejouer le dashboard analyste</button>
    </div>
  )
}
