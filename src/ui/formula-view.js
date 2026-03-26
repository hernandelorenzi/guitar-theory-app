import { noteName } from '../theory/notes';
import { getIntervalColor } from '../state';
export function renderFormulaView(container, formula, rootNote) {
    container.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'formula-row';
    for (const interval of formula) {
        const pill = document.createElement('div');
        pill.className = 'formula-pill';
        const color = getIntervalColor(interval.degree);
        pill.style.setProperty('--pill-color', color);
        const degreeEl = document.createElement('span');
        degreeEl.className = 'formula-degree';
        degreeEl.textContent = interval.degree;
        const noteEl = document.createElement('span');
        noteEl.className = 'formula-note';
        noteEl.textContent = noteName((rootNote + interval.semitones), rootNote);
        pill.appendChild(degreeEl);
        pill.appendChild(noteEl);
        row.appendChild(pill);
    }
    container.appendChild(row);
}
