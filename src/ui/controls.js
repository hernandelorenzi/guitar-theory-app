import { state, setState } from '../state';
import { CHORDS, CHORD_GROUPS, getChordsByGroup } from '../theory/chords';
import { SCALE_GROUPS, getScalesByGroup } from '../theory/scales';
import { ALL_NOTES } from '../theory/notes';
export function buildControls(container) {
    container.innerHTML = '';
    // ── Root note ─────────────────────────────────────────────────────────────
    const rootSection = section('Root Note');
    const rootGrid = document.createElement('div');
    rootGrid.className = 'note-grid';
    for (const note of ALL_NOTES) {
        const btn = document.createElement('button');
        btn.className = 'btn note-btn';
        btn.textContent = note.name.includes('/') ? note.name.split('/')[0] : note.name;
        btn.title = note.name;
        if (note.index === state.rootNote)
            btn.classList.add('active');
        btn.addEventListener('click', () => {
            setState({ rootNote: note.index, inversion: 0 });
        });
        rootGrid.appendChild(btn);
    }
    rootSection.appendChild(rootGrid);
    container.appendChild(rootSection);
    // ── Display mode toggle ───────────────────────────────────────────────────
    const modeSection = section('Display');
    const modeToggle = document.createElement('div');
    modeToggle.className = 'toggle-group';
    const chordBtn = toggleBtn('Chord', state.displayMode === 'chord', () => {
        setState({ displayMode: 'chord', inversion: 0 });
    });
    const scaleBtn = toggleBtn('Scale', state.displayMode === 'scale', () => {
        setState({ displayMode: 'scale', inversion: 0 });
    });
    modeToggle.appendChild(chordBtn);
    modeToggle.appendChild(scaleBtn);
    modeSection.appendChild(modeToggle);
    container.appendChild(modeSection);
    // ── Chord selector ────────────────────────────────────────────────────────
    const chordSection = section('Chord');
    chordSection.id = 'chord-section';
    chordSection.style.display = state.displayMode === 'chord' ? '' : 'none';
    for (const { label, group } of CHORD_GROUPS) {
        const groupEl = document.createElement('div');
        groupEl.className = 'chord-group';
        const groupLabel = document.createElement('div');
        groupLabel.className = 'group-label';
        groupLabel.textContent = label;
        groupEl.appendChild(groupLabel);
        const btnRow = document.createElement('div');
        btnRow.className = 'chord-btn-row';
        for (const chord of getChordsByGroup(group)) {
            const btn = document.createElement('button');
            btn.className = 'btn chord-btn';
            btn.textContent = chord.shortName;
            btn.title = chord.name;
            if (chord.type === state.chordType)
                btn.classList.add('active');
            btn.addEventListener('click', () => {
                setState({ chordType: chord.type, inversion: 0 });
            });
            btnRow.appendChild(btn);
        }
        groupEl.appendChild(btnRow);
        chordSection.appendChild(groupEl);
    }
    container.appendChild(chordSection);
    // ── Inversion selector ────────────────────────────────────────────────────
    const invSection = section('Inversion');
    invSection.id = 'inversion-section';
    invSection.style.display = state.displayMode === 'chord' ? '' : 'none';
    const chordDef = CHORDS[state.chordType];
    const invCount = chordDef.formula.length;
    const invLabels = ['Root position', '1st inversion', '2nd inversion', '3rd inversion'];
    const invToggle = document.createElement('div');
    invToggle.className = 'toggle-group wrap';
    for (let i = 0; i < invCount; i++) {
        const btn = toggleBtn(invLabels[i] ?? `Inv ${i}`, state.inversion === i, () => {
            setState({ inversion: i });
        });
        invToggle.appendChild(btn);
    }
    invSection.appendChild(invToggle);
    container.appendChild(invSection);
    // ── Scale selector ────────────────────────────────────────────────────────
    const scaleSection = section('Scale');
    scaleSection.id = 'scale-section';
    scaleSection.style.display = state.displayMode === 'scale' ? '' : 'none';
    for (const { label, group } of SCALE_GROUPS) {
        const groupEl = document.createElement('div');
        groupEl.className = 'chord-group';
        const groupLabel = document.createElement('div');
        groupLabel.className = 'group-label';
        groupLabel.textContent = label;
        groupEl.appendChild(groupLabel);
        const btnRow = document.createElement('div');
        btnRow.className = 'chord-btn-row';
        for (const scale of getScalesByGroup(group)) {
            const btn = document.createElement('button');
            btn.className = 'btn chord-btn';
            btn.textContent = scale.name;
            btn.title = scale.name;
            if (scale.type === state.scaleType)
                btn.classList.add('active');
            btn.addEventListener('click', () => {
                setState({ scaleType: scale.type });
            });
            btnRow.appendChild(btn);
        }
        groupEl.appendChild(btnRow);
        scaleSection.appendChild(groupEl);
    }
    container.appendChild(scaleSection);
    // ── View toggle ───────────────────────────────────────────────────────────
    const viewSection = section('View');
    const viewToggle = document.createElement('div');
    viewToggle.className = 'toggle-group';
    viewToggle.appendChild(toggleBtn('Fretboard', state.viewMode === 'fretboard', () => {
        setState({ viewMode: 'fretboard' });
    }));
    viewToggle.appendChild(toggleBtn('Formula', state.viewMode === 'formula', () => {
        setState({ viewMode: 'formula' });
    }));
    viewSection.appendChild(viewToggle);
    container.appendChild(viewSection);
}
function section(title) {
    const el = document.createElement('div');
    el.className = 'ctrl-section';
    const h = document.createElement('div');
    h.className = 'ctrl-section-title';
    h.textContent = title;
    el.appendChild(h);
    return el;
}
function toggleBtn(label, active, onClick) {
    const btn = document.createElement('button');
    btn.className = 'btn toggle-btn' + (active ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
}
export function buildOptions(container) {
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'options-row';
    wrap.appendChild(checkOption('Show open strings', state.showOpenStrings, (v) => {
        setState({ showOpenStrings: v });
    }));
    wrap.appendChild(checkOption('Show interval labels', state.showLabels, (v) => {
        setState({ showLabels: v });
    }));
    container.appendChild(wrap);
}
function checkOption(label, checked, onChange) {
    const wrap = document.createElement('label');
    wrap.className = 'check-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('change', () => onChange(input.checked));
    const span = document.createElement('span');
    span.textContent = label;
    wrap.appendChild(input);
    wrap.appendChild(span);
    return wrap;
}
