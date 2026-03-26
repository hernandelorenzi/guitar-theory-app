// Standard tuning as semitone offsets from C (MIDI: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64)
export const STANDARD_TUNING = [40, 45, 50, 55, 59, 64]; // low E to high e
export const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
export const FRET_COUNT = 22; // frets 0 (open) through 22
export function buildFretboard(tuning = STANDARD_TUNING) {
    return tuning.map((openNote, s) => Array.from({ length: FRET_COUNT + 1 }, (_, f) => ({
        string: s,
        fret: f,
        noteIndex: (openNote + f) % 12,
        degree: null,
        isActive: false,
        isBass: false,
    })));
}
// Logarithmic fret x position (rule of 18 / equal temperament)
// nutX: x of nut, scaleWidth: total width across all frets
export function fretX(fret, nutX, scaleWidth) {
    if (fret === 0)
        return nutX;
    return nutX + (1 - Math.pow(0.5, fret / 12)) * scaleWidth;
}
// Midpoint between two frets (where note circle sits)
export function fretMidX(fret, nutX, scaleWidth) {
    const x0 = fretX(fret === 0 ? 0 : fret - 1, nutX, scaleWidth);
    const x1 = fretX(fret, nutX, scaleWidth);
    return fret === 0
        ? nutX - 28 // open string: left of nut
        : (x0 + x1) / 2;
}
