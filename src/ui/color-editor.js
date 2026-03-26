import { state, setState, DEFAULT_COLORS } from '../state';
const DEGREE_LABELS = {
    '1': 'Root (1)', 'b2': 'b2', '2': '2',
    'b3': 'b3', '3': '3', '4': '4',
    'b5': 'b5', '5': '5', 'b6': 'b6',
    '6': '6', 'b7': 'b7', '7': '7',
};
export function renderColorEditor(container, activeDegrees) {
    container.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'color-editor-title';
    title.textContent = 'Interval Colors';
    container.appendChild(title);
    const grid = document.createElement('div');
    grid.className = 'color-editor-grid';
    // Always show tonic + active degrees
    const degreesToShow = Array.from(new Set(['1', ...activeDegrees]));
    for (const degree of degreesToShow) {
        const item = document.createElement('label');
        item.className = 'color-item';
        const swatch = document.createElement('input');
        swatch.type = 'color';
        swatch.value = state.colors[degree];
        swatch.className = 'color-swatch';
        swatch.addEventListener('input', () => {
            setState({ colors: { ...state.colors, [degree]: swatch.value } });
        });
        const label = document.createElement('span');
        label.className = 'color-label';
        label.textContent = DEGREE_LABELS[degree];
        item.appendChild(swatch);
        item.appendChild(label);
        grid.appendChild(item);
    }
    container.appendChild(grid);
    // Reset button
    const reset = document.createElement('button');
    reset.className = 'btn btn-ghost btn-sm';
    reset.textContent = 'Reset colors';
    reset.addEventListener('click', () => {
        setState({ colors: { ...DEFAULT_COLORS } });
    });
    container.appendChild(reset);
}
