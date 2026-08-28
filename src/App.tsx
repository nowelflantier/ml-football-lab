import { useEffect, useMemo, useState } from 'react'
import { Chapter1 } from './chapters/Chapter1'
import { Chapter2 } from './chapters/Chapter2'
import { Chapter3 } from './chapters/Chapter3'
import { Chapter4 } from './chapters/Chapter4'
import { Chapter5 } from './chapters/Chapter5'
import { Chapter6 } from './chapters/Chapter6'
import { Chapter7 } from './chapters/Chapter7'
import type { ChapterId, Progress } from './types'

const STORAGE_KEY = 'ml-football-lab-progress-v1'
const LEGACY_STORAGE_KEY = 'ml-football-lab-progress-v0'
const CHAPTER_COUNT = 7

const defaultProgress: Progress = {
  chapter: 1,
  chapter1Step: 0,
  chapter2Step: 0,
  chapter3Step: 0,
  chapter4Step: 0,
  chapter5Step: 0,
  chapter6Step: 0,
  chapter7Step: 0,
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
  { id: 7, short: '07', title: 'Comparer', subtitle: 'Deux familles' },
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

  return (
    <div className="app-frame">
      <header className="topbar">
        <button className="brand" onClick={() => update({ chapter: 1 })} aria-label="Retour au premier chapitre">
          <span className="brand-mark">ML</span>
          <span><strong>Football Lab</strong><small>apprendre en manipulant</small></span>
        </button>
        <div className="top-progress" aria-label={`${progress.completed.length} chapitres terminés sur ${CHAPTER_COUNT}`}>
          <span>{progress.completed.length}/{CHAPTER_COUNT}</span>
          <div><i style={{ width: `${(progress.completed.length / CHAPTER_COUNT) * 100}%` }} /></div>
        </div>
        <button className="reset-button" onClick={reset}>Recommencer</button>
      </header>

      <div className="workspace">
        <aside className="chapter-nav">
          <div className="nav-heading">Cycle 1 · Du problème au modèle</div>
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
            <span>Modèles exécutés dans le navigateur<br />Seed pédagogique · pipeline StatsBomb prêt</span>
          </div>
        </aside>

        <main className="main-stage">
          {finished ? (
            <Completion onReview={() => update({ chapter7Step: 0, completed: progress.completed.filter((chapter) => chapter !== 7) })} />
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
          ) : (
            <Chapter7
              step={progress.chapter7Step}
              setStep={(chapter7Step) => update({ chapter7Step })}
              onComplete={() => completeChapter(7)}
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
      <div className="completion-badge">CYCLE 1 · TERMINÉ</div>
      <h1>Tu as maintenant le raisonnement ML de base.</h1>
      <p>L’objectif n’était pas de mémoriser une API. C’était de pouvoir regarder un problème de prédiction et poser les bonnes questions avant même de choisir un algorithme.</p>
      <div className="completion-grid four-cards">
        <div><span>01–03</span><strong>Construire le problème.</strong><small>Cible, features, modèle et prédiction.</small></div>
        <div><span>04</span><strong>Tester sur de l’inconnu.</strong><small>Train/test et généralisation.</small></div>
        <div><span>05</span><strong>Lire une probabilité.</strong><small>xG, fréquence et incertitude.</small></div>
        <div><span>06–07</span><strong>Ne pas se faire piéger par le score.</strong><small>Overfitting, leakage, familles et réglages.</small></div>
      </div>
      <div className="next-teaser wide"><span>Prochaine marche</span><strong>Remplacer progressivement le seed pédagogique par de vraies données de match et construire un xG plus crédible.</strong><small>On pourra alors aborder nettoyage, distribution, calibration, métriques et features football plus riches sans perdre le fil conceptuel.</small></div>
      <button className="secondary-button" onClick={onReview}>Revoir le chapitre 07</button>
    </div>
  )
}
