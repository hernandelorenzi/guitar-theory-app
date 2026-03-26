export type IntervalDegree =
  | '1' | 'b2' | '2' | 'b3' | '3' | '4'
  | 'b5' | '5' | 'b6' | '6' | 'b7' | '7'

export interface IntervalDef {
  degree: IntervalDegree
  semitones: number
  label: string
}

export const INTERVALS: Record<IntervalDegree, IntervalDef> = {
  '1':  { degree: '1',  semitones: 0,  label: 'Root' },
  'b2': { degree: 'b2', semitones: 1,  label: 'b2' },
  '2':  { degree: '2',  semitones: 2,  label: '2nd' },
  'b3': { degree: 'b3', semitones: 3,  label: 'b3' },
  '3':  { degree: '3',  semitones: 4,  label: '3rd' },
  '4':  { degree: '4',  semitones: 5,  label: '4th' },
  'b5': { degree: 'b5', semitones: 6,  label: 'b5' },
  '5':  { degree: '5',  semitones: 7,  label: '5th' },
  'b6': { degree: 'b6', semitones: 8,  label: 'b6' },
  '6':  { degree: '6',  semitones: 9,  label: '6th' },
  'b7': { degree: 'b7', semitones: 10, label: 'b7' },
  '7':  { degree: '7',  semitones: 11, label: '7th' },
}

export type Formula = IntervalDef[]

export function buildFormula(degrees: IntervalDegree[]): Formula {
  return degrees.map(d => INTERVALS[d])
}
