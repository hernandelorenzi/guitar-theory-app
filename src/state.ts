import type { ChordType } from './theory/chords'
import type { ScaleType } from './theory/scales'
import type { IntervalDegree } from './theory/intervals'

export type ViewMode = 'fretboard' | 'formula'
export type DisplayMode = 'chord' | 'scale'

export interface IntervalColors {
  '1': string
  'b2': string
  '2': string
  'b3': string
  '3': string
  '4': string
  'b5': string
  '5': string
  'b6': string
  '6': string
  'b7': string
  '7': string
}

export const DEFAULT_COLORS: IntervalColors = {
  '1':  '#E8A838', // amber — tonic
  'b2': '#4A9EBF',
  '2':  '#4A9EBF',
  'b3': '#4A9EBF',
  '3':  '#4A9EBF',
  '4':  '#4A9EBF',
  'b5': '#4A9EBF',
  '5':  '#4A9EBF',
  'b6': '#4A9EBF',
  '6':  '#4A9EBF',
  'b7': '#4A9EBF',
  '7':  '#4A9EBF',
}

export interface AppState {
  rootNote: number          // 0–11
  displayMode: DisplayMode
  chordType: ChordType
  scaleType: ScaleType
  inversion: number         // 0 = root, 1 = 1st inv, 2 = 2nd inv
  viewMode: ViewMode
  colors: IntervalColors
  showOpenStrings: boolean
  showLabels: boolean
}

export const state: AppState = {
  rootNote: 0,
  displayMode: 'chord',
  chordType: 'major',
  scaleType: 'major',
  inversion: 0,
  viewMode: 'fretboard',
  colors: { ...DEFAULT_COLORS },
  showOpenStrings: true,
  showLabels: true,
}

type Listener = () => void
const listeners: Listener[] = []

export function subscribe(fn: Listener): void {
  listeners.push(fn)
}

export function setState(patch: Partial<AppState>): void {
  Object.assign(state, patch)
  listeners.forEach(fn => fn())
}

export function getIntervalColor(degree: IntervalDegree): string {
  return state.colors[degree] ?? '#4A9EBF'
}
