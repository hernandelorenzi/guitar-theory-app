import { buildFretboard, STANDARD_TUNING, type FretPosition } from './model'
import type { Formula } from '../theory/intervals'

export interface SolverOptions {
  rootNote: number   // 0–11
  formula: Formula
  bassNote: number   // semitone of the inversion bass note (0–11), = rootNote for root position
}

export function solve(opts: SolverOptions): FretPosition[][] {
  const { rootNote, formula, bassNote } = opts
  const board = buildFretboard(STANDARD_TUNING)

  // Build map: semitone → interval degree
  const degreeMap = new Map<number, typeof formula[0]['degree']>()
  for (const interval of formula) {
    const semitone = (rootNote + interval.semitones) % 12
    degreeMap.set(semitone, interval.degree)
  }

  // Activate matching positions and annotate degree
  for (const string of board) {
    for (const pos of string) {
      const degree = degreeMap.get(pos.noteIndex)
      if (degree !== undefined) {
        pos.isActive = true
        pos.degree = degree
      }
    }
  }

  // Mark isBass: for each string, the lowest-fret active position
  // where the note matches the bass semitone
  const bassSemitone = bassNote % 12
  for (const string of board) {
    for (const pos of string) {
      if (pos.isActive && pos.noteIndex === bassSemitone) {
        pos.isBass = true
        break // only the lowest occurrence per string
      }
    }
  }

  return board
}
