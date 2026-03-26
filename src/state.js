export const DEFAULT_COLORS = {
    '1': '#E8A838', // amber — tonic
    'b2': '#4A9EBF',
    '2': '#4A9EBF',
    'b3': '#4A9EBF',
    '3': '#4A9EBF',
    '4': '#4A9EBF',
    'b5': '#4A9EBF',
    '5': '#4A9EBF',
    'b6': '#4A9EBF',
    '6': '#4A9EBF',
    'b7': '#4A9EBF',
    '7': '#4A9EBF',
};
export const state = {
    rootNote: 0,
    displayMode: 'chord',
    chordType: 'major',
    scaleType: 'major',
    inversion: 0,
    viewMode: 'fretboard',
    colors: { ...DEFAULT_COLORS },
    showOpenStrings: true,
    showLabels: true,
};
const listeners = [];
export function subscribe(fn) {
    listeners.push(fn);
}
export function setState(patch) {
    Object.assign(state, patch);
    listeners.forEach(fn => fn());
}
export function getIntervalColor(degree) {
    return state.colors[degree] ?? '#4A9EBF';
}
