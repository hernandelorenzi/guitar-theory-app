import { buildFretboard, STANDARD_TUNING } from './model';
export function solve(opts) {
    const { rootNote, formula, bassNote } = opts;
    const board = buildFretboard(STANDARD_TUNING);
    // Build map: semitone → interval degree
    const degreeMap = new Map();
    for (const interval of formula) {
        const semitone = (rootNote + interval.semitones) % 12;
        degreeMap.set(semitone, interval.degree);
    }
    // Activate matching positions and annotate degree
    for (const string of board) {
        for (const pos of string) {
            const degree = degreeMap.get(pos.noteIndex);
            if (degree !== undefined) {
                pos.isActive = true;
                pos.degree = degree;
            }
        }
    }
    // Mark isBass: for each string, the lowest-fret active position
    // where the note matches the bass semitone
    const bassSemitone = bassNote % 12;
    for (const string of board) {
        for (const pos of string) {
            if (pos.isActive && pos.noteIndex === bassSemitone) {
                pos.isBass = true;
                break; // only the lowest occurrence per string
            }
        }
    }
    return board;
}
