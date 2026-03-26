import { buildFormula } from './intervals';
function scale(type, name, degrees, group) {
    return { type, name, formula: buildFormula(degrees), group };
}
export const SCALES = {
    // ── Diatonic ─────────────────────────────────────────────────────────────
    major: scale('major', 'Major (Ionian)', ['1', '2', '3', '4', '5', '6', '7'], 'diatonic'),
    natural_minor: scale('natural_minor', 'Natural Minor', ['1', '2', 'b3', '4', '5', 'b6', 'b7'], 'diatonic'),
    harmonic_minor: scale('harmonic_minor', 'Harmonic Minor', ['1', '2', 'b3', '4', '5', 'b6', '7'], 'diatonic'),
    melodic_minor: scale('melodic_minor', 'Melodic Minor', ['1', '2', 'b3', '4', '5', '6', '7'], 'diatonic'),
    // ── Pentatonic & Blues ───────────────────────────────────────────────────
    pentatonic_major: scale('pentatonic_major', 'Pentatonic Major', ['1', '2', '3', '5', '6'], 'pentatonic'),
    pentatonic_minor: scale('pentatonic_minor', 'Pentatonic Minor', ['1', 'b3', '4', '5', 'b7'], 'pentatonic'),
    blues: scale('blues', 'Blues', ['1', 'b3', '4', 'b5', '5', 'b7'], 'pentatonic'),
    // ── Modes ────────────────────────────────────────────────────────────────
    dorian: scale('dorian', 'Dorian', ['1', '2', 'b3', '4', '5', '6', 'b7'], 'modes'),
    phrygian: scale('phrygian', 'Phrygian', ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'], 'modes'),
    lydian: scale('lydian', 'Lydian', ['1', '2', '3', 'b5', '5', '6', '7'], 'modes'),
    mixolydian: scale('mixolydian', 'Mixolydian', ['1', '2', '3', '4', '5', '6', 'b7'], 'modes'),
    locrian: scale('locrian', 'Locrian', ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'], 'modes'),
};
export const SCALE_GROUPS = [
    { label: 'Diatonic', group: 'diatonic' },
    { label: 'Pentatonic/Blues', group: 'pentatonic' },
    { label: 'Modes', group: 'modes' },
];
export function getScalesByGroup(group) {
    return Object.values(SCALES).filter(s => s.group === group);
}
