export type NoteIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export const NOTE_NAMES_SHARP: Record<number, string> = {
  0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E',
  5: 'F', 6: 'F#', 7: 'G', 8: 'G#', 9: 'A',
  10: 'A#', 11: 'B'
}

export const NOTE_NAMES_FLAT: Record<number, string> = {
  0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E',
  5: 'F', 6: 'Gb', 7: 'G', 8: 'Ab', 9: 'A',
  10: 'Bb', 11: 'B'
}

// Roots that prefer flat notation
const FLAT_ROOTS = new Set([5, 10, 3, 8, 1, 6]) // F, Bb, Eb, Ab, Db, Gb

export function noteName(noteIndex: number, root: number): string {
  const n = ((noteIndex % 12) + 12) % 12
  return FLAT_ROOTS.has(root) ? NOTE_NAMES_FLAT[n] : NOTE_NAMES_SHARP[n]
}

export const ALL_NOTES: { index: NoteIndex; name: string }[] = [
  { index: 0, name: 'C' },
  { index: 1, name: 'C#/Db' },
  { index: 2, name: 'D' },
  { index: 3, name: 'D#/Eb' },
  { index: 4, name: 'E' },
  { index: 5, name: 'F' },
  { index: 6, name: 'F#/Gb' },
  { index: 7, name: 'G' },
  { index: 8, name: 'G#/Ab' },
  { index: 9, name: 'A' },
  { index: 10, name: 'A#/Bb' },
  { index: 11, name: 'B' },
]
