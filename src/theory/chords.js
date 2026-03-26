import { buildFormula } from './intervals';
function chord(type, name, shortName, degrees, group) {
    return { type, name, shortName, formula: buildFormula(degrees), group };
}
export const CHORDS = {
    // ── Triads ──────────────────────────────────────────────────────────────
    major: chord('major', 'Major', 'maj', ['1', '3', '5'], 'triads'),
    minor: chord('minor', 'Minor', 'm', ['1', 'b3', '5'], 'triads'),
    dim: chord('dim', 'Diminished', 'dim', ['1', 'b3', 'b5'], 'triads'),
    aug: chord('aug', 'Augmented', 'aug', ['1', '3', 'b6'], 'triads'),
    dom7: chord('dom7', 'Dominant 7th', '7', ['1', '3', '5', 'b7'], 'triads'),
    min7: chord('min7', 'Minor 7th', 'm7', ['1', 'b3', '5', 'b7'], 'triads'),
    // ── Suspended ───────────────────────────────────────────────────────────
    sus2: chord('sus2', 'Suspended 2nd', 'sus2', ['1', '2', '5'], 'suspended'),
    sus4: chord('sus4', 'Suspended 4th', 'sus4', ['1', '4', '5'], 'suspended'),
    // ── Seventh chords ──────────────────────────────────────────────────────
    maj7: chord('maj7', 'Major 7th', 'maj7', ['1', '3', '5', '7'], 'seventh'),
    min_maj7: chord('min_maj7', 'Minor/Major 7th', 'm/maj7', ['1', 'b3', '5', '7'], 'seventh'),
    dim7: chord('dim7', 'Diminished 7th', 'dim7', ['1', 'b3', 'b5', '6'], 'seventh'),
    half_dim7: chord('half_dim7', 'Half Diminished', 'ø7', ['1', 'b3', 'b5', 'b7'], 'seventh'),
    aug_maj7: chord('aug_maj7', 'Augmented Maj7', 'aug/maj7', ['1', '3', 'b6', '7'], 'seventh'),
    aug7: chord('aug7', 'Augmented 7th', 'aug7', ['1', '3', 'b6', 'b7'], 'seventh'),
    // ── Added ────────────────────────────────────────────────────────────────
    add9: chord('add9', 'Add 9', 'add9', ['1', '2', '3', '5'], 'added'),
    madd9: chord('madd9', 'Minor Add 9', 'm(add9)', ['1', '2', 'b3', '5'], 'added'),
};
export const CHORD_GROUPS = [
    { label: 'Triads', group: 'triads' },
    { label: 'Suspended', group: 'suspended' },
    { label: 'Seventh Chords', group: 'seventh' },
    { label: 'Added Tones', group: 'added' },
];
export function getChordsByGroup(group) {
    return Object.values(CHORDS).filter(c => c.group === group);
}
// Return inversion formula: rotate the chord formula so that
// formula[inversionIndex] is the bass note
export function getInversionFormula(formula, inversion) {
    if (inversion === 0)
        return formula;
    const n = formula.length;
    const pivot = inversion % n;
    return [...formula.slice(pivot), ...formula.slice(0, pivot)];
}
