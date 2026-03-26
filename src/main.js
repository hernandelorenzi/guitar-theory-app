import './styles/base.css';
import './styles/layout.css';
import './styles/controls.css';
import { state, setState, subscribe } from './state';
import { CHORDS, getInversionFormula } from './theory/chords';
import { SCALES } from './theory/scales';
import { noteName } from './theory/notes';
import { solve } from './fretboard/solver';
import { createFretboardSVG, renderNotes } from './ui/fretboard-svg';
import { renderFormulaView } from './ui/formula-view';
import { buildControls, buildOptions } from './ui/controls';
import { renderColorEditor } from './ui/color-editor';
// ── DOM refs ──────────────────────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const fretboardWrap = document.getElementById('fretboard-container');
const formulaWrap = document.getElementById('formula-container');
const colorWrap = document.getElementById('color-editor-container');
const optionsWrap = document.getElementById('options-container');
const statusBar = document.getElementById('status-bar');
// ── Create fretboard SVG ──────────────────────────────────────────────────────
const svg = createFretboardSVG();
fretboardWrap.appendChild(svg);
// ── Render ────────────────────────────────────────────────────────────────────
function render() {
    const { rootNote, displayMode, chordType, scaleType, inversion, viewMode, showOpenStrings, showLabels } = state;
    let formula = displayMode === 'chord'
        ? CHORDS[chordType].formula
        : SCALES[scaleType].formula;
    let bassNote = rootNote;
    if (displayMode === 'chord' && inversion > 0) {
        const invFormula = getInversionFormula(formula, inversion);
        bassNote = (rootNote + invFormula[0].semitones) % 12;
        formula = invFormula;
    }
    // Solve fretboard
    const board = solve({ rootNote, formula, bassNote });
    // Fretboard or formula view
    if (viewMode === 'fretboard') {
        fretboardWrap.classList.remove('hidden');
        formulaWrap.classList.add('hidden');
        renderNotes(svg, board, showOpenStrings, showLabels);
    }
    else {
        fretboardWrap.classList.add('hidden');
        formulaWrap.classList.remove('hidden');
        // Use the non-inverted formula for display in formula view (shows base formula)
        const displayFormula = displayMode === 'chord'
            ? CHORDS[chordType].formula
            : SCALES[scaleType].formula;
        renderFormulaView(formulaWrap, displayFormula, rootNote);
    }
    // Color editor: only show degrees present in current formula
    const activeDegrees = formula.map(i => i.degree);
    renderColorEditor(colorWrap, activeDegrees);
    buildOptions(optionsWrap);
    // Status bar
    const rootStr = noteName(rootNote, rootNote);
    if (displayMode === 'chord') {
        const chord = CHORDS[chordType];
        const invLabels = ['', ' — 1st inv.', ' — 2nd inv.', ' — 3rd inv.'];
        statusBar.textContent = `${rootStr} ${chord.name}${invLabels[inversion] ?? ''}`;
    }
    else {
        const scale = SCALES[scaleType];
        statusBar.textContent = `${rootStr} ${scale.name}`;
    }
    // Rebuild controls (to reflect new state highlights)
    buildControls(sidebar);
}
// ── Subscribe and initial render ──────────────────────────────────────────────
subscribe(render);
render();
// ── Keyboard shortcuts ────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement)
        return;
    // Arrow keys: cycle root note
    if (e.key === 'ArrowRight')
        setState({ rootNote: (state.rootNote + 1) % 12, inversion: 0 });
    if (e.key === 'ArrowLeft')
        setState({ rootNote: (state.rootNote + 11) % 12, inversion: 0 });
    // v: toggle view
    if (e.key === 'v')
        setState({ viewMode: state.viewMode === 'fretboard' ? 'formula' : 'fretboard' });
    // Tab: cycle inversion (chord mode only)
    if (e.key === 'Tab' && state.displayMode === 'chord') {
        e.preventDefault();
        const max = CHORDS[state.chordType].formula.length;
        setState({ inversion: (state.inversion + 1) % max });
    }
});
