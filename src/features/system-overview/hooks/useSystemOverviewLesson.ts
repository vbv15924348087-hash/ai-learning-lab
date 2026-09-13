import { useCallback, useEffect, useState } from 'react'
import { useLearningStore } from '../../../stores/learningStore'
import { systemOverviewSteps } from '../data/systemOverviewSteps'
import { OVERVIEW_LESSON_ID, type OverviewNodeId, type PredictionChoice } from '../types'

export const AUTOPLAY_INTERVAL = 7500

export function useSystemOverviewLesson() {
  const currentStep = useLearningStore((state) => state.currentStep)
  const furthestStep = useLearningStore((state) => state.furthestStep)
  const unlockedTerms = useLearningStore((state) => state.unlockedTerms)
  const predictionChoice = useLearningStore((state) => state.predictionChoice)
  const harnessRevealed = useLearningStore((state) => state.harnessRevealed)
  const challengePassed = useLearningStore((state) => state.challengePassed)
  const [playing, setPlaying] = useState(false)
  const [selectedNode, setSelectedNode] = useState<OverviewNodeId | null>(null)
  const step = systemOverviewSteps[currentStep]
  const lastStep = currentStep === systemOverviewSteps.length - 1
  const gateBlocked =
    (step.gate === 'prediction' && !predictionChoice) ||
    (step.gate === 'harness' && !harnessRevealed)

  const goToStep = useCallback((index: number) => {
    const state = useLearningStore.getState()
    const bounded = Math.max(0, Math.min(index, systemOverviewSteps.length - 1))
    const next = systemOverviewSteps[bounded]
    state.updateOverviewProgress({
      currentStep: bounded,
      furthestStep: Math.max(state.furthestStep, bounded),
      unlockedTerms: next.unlocks
        ? [...new Set([...state.unlockedTerms, next.unlocks])]
        : state.unlockedTerms,
    })
    setSelectedNode(null)
    if (next.gate || next.section === 'explore') setPlaying(false)
  }, [])

  const advance = useCallback(() => {
    const state = useLearningStore.getState()
    const active = systemOverviewSteps[state.currentStep]
    if (
      (active.gate === 'prediction' && !state.predictionChoice) ||
      (active.gate === 'harness' && !state.harnessRevealed)
    ) {
      setPlaying(false)
      return
    }
    goToStep(state.currentStep + 1)
  }, [goToStep])

  useEffect(() => {
    if (!playing || gateBlocked || lastStep) return
    const timer = window.setTimeout(advance, AUTOPLAY_INTERVAL)
    return () => window.clearTimeout(timer)
  }, [advance, currentStep, gateBlocked, lastStep, playing])

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden)
  }, [])

  function choosePrediction(choice: PredictionChoice) {
    setPlaying(false)
    useLearningStore.getState().updateOverviewProgress({ predictionChoice: choice })
  }

  function revealHarness() {
    useLearningStore.getState().updateOverviewProgress({ harnessRevealed: true })
    goToStep(currentStep + 1)
  }

  function restart() {
    setPlaying(false)
    setSelectedNode(null)
    useLearningStore.getState().restartOverview()
  }

  function passChallenge() {
    const state = useLearningStore.getState()
    if (state.furthestStep < systemOverviewSteps.length - 1) return
    state.updateOverviewProgress({ challengePassed: true })
    state.completeLesson(OVERVIEW_LESSON_ID)
    setPlaying(false)
  }

  return {
    step,
    currentStep,
    furthestStep,
    unlockedTerms,
    predictionChoice,
    playing,
    selectedNode,
    lastStep,
    gateBlocked,
    challengePassed,
    choosePrediction,
    revealHarness,
    restart,
    passChallenge,
    next: () => {
      setPlaying(false)
      advance()
    },
    previous: () => {
      setPlaying(false)
      goToStep(currentStep - 1)
    },
    togglePlayback: () => setPlaying((value) => !value && !gateBlocked && !lastStep),
    selectNode: (id: OverviewNodeId) => {
      setPlaying(false)
      setSelectedNode(id)
    },
    clearSelection: () => setSelectedNode(null),
    replayDemo: () => {
      setPlaying(false)
      goToStep(12)
    },
  }
}
