export type LessonTerm = {
  id: string
  name: string
  label: string
  definition: string
}

export type LessonStep = {
  id: string
  title: string
  beginnerExplanation: string
  whyItMatters: string
  technicalExplanation: string
  interactionHint: string
  terms: string[]
}

export type ChallengeQuestion = {
  id: string
  prompt: string
  options: { id: string; label: string; explanation: string }[]
  answer: string
}

export type ChapterDefinition = {
  id: string
  phase: number
  title: string
  heading: string
  subtitle: string
  minutes: number
  connection: string
  goal: string
  steps: LessonStep[]
  terms: LessonTerm[]
  misconceptions: { wrong: string; correct: string }[]
  challenge: ChallengeQuestion[]
  takeaway: string
}

export type ChapterVisualProps = {
  step: number
  onComplete: () => void
  completed: boolean
}

export type ChapterProgress = {
  currentStep: number
  completedSteps: string[]
  unlockedTerms: string[]
  answers: Record<string, string>
  challengePassed: boolean
}
