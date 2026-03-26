import { fretX, fretMidX, STRING_NAMES, FRET_COUNT } from '../fretboard/model';
import { getIntervalColor } from '../state';
const SVG_NS = 'http://www.w3.org/2000/svg';
// Layout constants
const NUT_X = 72;
const SCALE_W = 920;
const STRING_Y_START = 36;
const STRING_SPACING = 38;
const CIRCLE_R = 10;
const TONIC_R = 10;
const OPEN_STRING_X = NUT_X - 30;
const DOT_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21];
const DOUBLE_DOT_FRETS = [12];
// Perspective: strings converge from nut toward body
const STRING_Y_CENTER = STRING_Y_START + 2.5 * STRING_SPACING; // fixed center axis
const NUT_HALF = 2.5 * STRING_SPACING; // half-spread at nut
const BODY_RATIO = 0.78; // 78% spread at fret 22
function svgEl(tag) {
    return document.createElementNS(SVG_NS, tag);
}
// Y position of string s at a given x, with perspective
// s=5 (high e) → top, s=0 (low E) → bottom
function syAt(s, x, boardEndX) {
    const t = x <= NUT_X ? 0 : Math.min(1, (x - NUT_X) / (boardEndX - NUT_X));
    const half = NUT_HALF * (1 - t * (1 - BODY_RATIO));
    const frac = (5 - s) / 5; // 0 = top (s=5), 1 = bottom (s=0)
    return STRING_Y_CENTER + (frac - 0.5) * 2 * half;
}
// Y of the top/bottom boundary of the board at a given x
function boardTopY(x, boardEndX) { return syAt(5, x, boardEndX) - 11; }
function boardBotY(x, boardEndX) { return syAt(0, x, boardEndX) + 11; }
export function createFretboardSVG() {
    const totalH = STRING_Y_START * 2 + 5 * STRING_SPACING;
    const boardEndX = fretX(FRET_COUNT, NUT_X, SCALE_W);
    const svg = svgEl('svg');
    svg.setAttribute('viewBox', `0 0 ${Math.ceil(boardEndX + 24)} ${totalH}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMinYMid meet');
    svg.id = 'fretboard-svg';
    // Defs: wood filter + alpaca gradient + string gradients
    const defs = svgEl('defs');
    addWoodFilter(defs);
    addAlpacaGradient(defs);
    addStringGradients(defs);
    svg.appendChild(defs);
    const grid = svgEl('g');
    grid.id = 'grid-layer';
    drawGrid(grid, boardEndX, totalH);
    svg.appendChild(grid);
    const notes = svgEl('g');
    notes.id = 'note-layer';
    svg.appendChild(notes);
    return svg;
}
function addWoodFilter(defs) {
    const filter = svgEl('filter');
    filter.setAttribute('id', 'wood-texture');
    filter.setAttribute('x', '0%');
    filter.setAttribute('y', '0%');
    filter.setAttribute('width', '100%');
    filter.setAttribute('height', '100%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    // Fractal noise: low x-freq (long grain) + high y-freq (tight grain lines)
    const turb = svgEl('feTurbulence');
    turb.setAttribute('type', 'fractalNoise');
    turb.setAttribute('baseFrequency', '0.012 0.28');
    turb.setAttribute('numOctaves', '5');
    turb.setAttribute('seed', '9');
    turb.setAttribute('result', 'noise');
    filter.appendChild(turb);
    // Map noise values to warm rosewood tones (dark grain ↔ lighter wood)
    const ct = svgEl('feComponentTransfer');
    ct.setAttribute('in', 'noise');
    ct.setAttribute('result', 'woodColor');
    const fr = svgEl('feFuncR');
    fr.setAttribute('type', 'table');
    fr.setAttribute('tableValues', '0.38 0.72 0.48 0.68 0.40 0.65');
    const fg = svgEl('feFuncG');
    fg.setAttribute('type', 'table');
    fg.setAttribute('tableValues', '0.20 0.42 0.26 0.38 0.22 0.36');
    const fb = svgEl('feFuncB');
    fb.setAttribute('type', 'table');
    fb.setAttribute('tableValues', '0.07 0.16 0.09 0.14 0.07 0.13');
    ct.appendChild(fr);
    ct.appendChild(fg);
    ct.appendChild(fb);
    filter.appendChild(ct);
    // Clip texture to polygon shape (SourceGraphic provides the alpha mask)
    const comp = svgEl('feComposite');
    comp.setAttribute('in', 'woodColor');
    comp.setAttribute('in2', 'SourceGraphic');
    comp.setAttribute('operator', 'in');
    filter.appendChild(comp);
    defs.appendChild(filter);
}
function addAlpacaGradient(defs) {
    const grad = svgEl('linearGradient');
    grad.setAttribute('id', 'alpaca');
    grad.setAttribute('x1', '0.5');
    grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '0.5');
    grad.setAttribute('y2', '1');
    const stops = [
        [0, '#404048'],
        [0.18, '#c8c8d8'],
        [0.42, '#f0f0f8'],
        [0.58, '#f0f0f8'],
        [0.82, '#b0b0c0'],
        [1, '#383840'],
    ];
    for (const [offset, color] of stops) {
        const s = svgEl('stop');
        s.setAttribute('offset', String(offset));
        s.setAttribute('stop-color', color);
        grad.appendChild(s);
    }
    defs.appendChild(grad);
}
function addStringGradients(defs) {
    // wound strings: warm bronze (low E, A, D)
    const woundColors = [
        ['#3a2e18', '#c8a050', '#3a2e18'], // s=0 low E
        ['#3d3020', '#c4a04a', '#3d3020'], // s=1 A
        ['#3a3022', '#bca048', '#3a3022'], // s=2 D
    ];
    // plain strings: cool steel (G, B, high e)
    const plainColors = [
        ['#303035', '#c8c8d8', '#303035'], // s=3 G
        ['#2e2e34', '#d4d4e4', '#2e2e34'], // s=4 B
        ['#2a2a30', '#e0e0f0', '#2a2a30'], // s=5 e
    ];
    const allColors = [...woundColors, ...plainColors];
    for (let s = 0; s < 6; s++) {
        const grad = svgEl('linearGradient');
        grad.setAttribute('id', `sg-${s}`);
        grad.setAttribute('x1', '0');
        grad.setAttribute('y1', '0');
        grad.setAttribute('x2', '0');
        grad.setAttribute('y2', '1');
        const [dark, light, dark2] = allColors[s];
        const stops = [[0, dark], [0.35, light], [0.65, light], [1, dark2]];
        for (const [offset, color] of stops) {
            const stop = svgEl('stop');
            stop.setAttribute('offset', String(offset));
            stop.setAttribute('stop-color', color);
            grad.appendChild(stop);
        }
        defs.appendChild(grad);
    }
}
// Diamond inlay centered at (cx, midStr), sized to fit within string spacing
function inlayDiamond(cx, midStr, boardEndX, fretWidth) {
    const hw = fretWidth * 0.11; // half-width along neck
    const hh = STRING_SPACING * 0.15; // half-height across strings (< 1 string gap)
    const cy = syAt(midStr, cx, boardEndX);
    const points = [
        `${cx},${cy - hh}`, // top
        `${cx + hw},${cy}`, // right
        `${cx},${cy + hh}`, // bottom
        `${cx - hw},${cy}`, // left
    ].join(' ');
    const poly = svgEl('polygon');
    poly.setAttribute('points', points);
    poly.setAttribute('fill', 'url(#alpaca)');
    poly.setAttribute('stroke', '#50505a');
    poly.setAttribute('stroke-width', '0.5');
    return poly;
}
function drawGrid(g, boardEndX, totalH) {
    // ── Fretboard background (trapezoid) ──────────────────────────────────────
    const poly = svgEl('polygon');
    const tlx = NUT_X, tly = boardTopY(NUT_X, boardEndX);
    const trx = boardEndX, try_ = boardTopY(boardEndX, boardEndX);
    const brx = boardEndX, bry = boardBotY(boardEndX, boardEndX);
    const blx = NUT_X, bly = boardBotY(NUT_X, boardEndX);
    // Fretboard background: white fill so the wood-texture filter renders correctly
    poly.setAttribute('points', `${tlx},${tly} ${trx},${try_} ${brx},${bry} ${blx},${bly}`);
    poly.setAttribute('fill', 'white');
    poly.setAttribute('filter', 'url(#wood-texture)');
    g.appendChild(poly);
    // ── Fret inlays: diamonds simil alpaca ───────────────────────────────────
    for (const fret of DOT_FRETS) {
        const x0 = fretX(fret - 1, NUT_X, SCALE_W);
        const x1 = fretX(fret, NUT_X, SCALE_W);
        const cx = (x0 + x1) / 2;
        const fw = x1 - x0;
        const isDouble = DOUBLE_DOT_FRETS.includes(fret);
        if (isDouble) {
            g.appendChild(inlayDiamond(cx, 1.5, boardEndX, fw));
            g.appendChild(inlayDiamond(cx, 3.5, boardEndX, fw));
        }
        else {
            g.appendChild(inlayDiamond(cx, 2.5, boardEndX, fw));
        }
    }
    // ── Fret lines (angled to follow perspective) ─────────────────────────────
    for (let f = 1; f <= FRET_COUNT; f++) {
        const x = fretX(f, NUT_X, SCALE_W);
        const line = svgEl('line');
        line.setAttribute('x1', String(x));
        line.setAttribute('y1', String(boardTopY(x, boardEndX)));
        line.setAttribute('x2', String(x));
        line.setAttribute('y2', String(boardBotY(x, boardEndX)));
        if (f === 12) {
            line.setAttribute('stroke', '#c8a84b');
            line.setAttribute('stroke-width', '3');
        }
        else {
            line.setAttribute('stroke', '#8a7040');
            line.setAttribute('stroke-width', '1.5');
        }
        g.appendChild(line);
    }
    // ── Nut ───────────────────────────────────────────────────────────────────
    const nutPoly = svgEl('polygon');
    const nutX = NUT_X - 6;
    nutPoly.setAttribute('points', [
        `${nutX},${boardTopY(NUT_X, boardEndX)}`,
        `${NUT_X},${boardTopY(NUT_X, boardEndX)}`,
        `${NUT_X},${boardBotY(NUT_X, boardEndX)}`,
        `${nutX},${boardBotY(NUT_X, boardEndX)}`,
    ].join(' '));
    nutPoly.setAttribute('fill', '#e8e0c8');
    nutPoly.setAttribute('rx', '2');
    g.appendChild(nutPoly);
    // ── Strings ───────────────────────────────────────────────────────────────
    const stringWidths = [3.2, 2.6, 2.0, 1.4, 1.1, 0.8];
    for (let s = 0; s < 6; s++) {
        const yBody = syAt(s, boardEndX, boardEndX);
        const yOpen = syAt(s, NUT_X, boardEndX); // before nut: constant
        // Shadow line (gives depth)
        const shadow = svgEl('line');
        shadow.setAttribute('x1', String(OPEN_STRING_X - 20));
        shadow.setAttribute('y1', String(yOpen + stringWidths[s] * 0.5));
        shadow.setAttribute('x2', String(boardEndX));
        shadow.setAttribute('y2', String(yBody + stringWidths[s] * 0.5));
        shadow.setAttribute('stroke', 'rgba(0,0,0,0.5)');
        shadow.setAttribute('stroke-width', String(stringWidths[s] + 1));
        shadow.setAttribute('stroke-linecap', 'round');
        g.appendChild(shadow);
        // Main string with gradient (simulated via layered lines)
        // Base (dark)
        const base = svgEl('line');
        base.setAttribute('x1', String(OPEN_STRING_X - 20));
        base.setAttribute('y1', String(yOpen));
        base.setAttribute('x2', String(boardEndX));
        base.setAttribute('y2', String(yBody));
        base.setAttribute('stroke', `url(#sg-${s})`);
        base.setAttribute('stroke-width', String(stringWidths[s] * 2.2));
        base.setAttribute('stroke-linecap', 'round');
        g.appendChild(base);
        // Highlight line on top (lighter stripe)
        const highlight = svgEl('line');
        const hOffset = -stringWidths[s] * 0.3;
        highlight.setAttribute('x1', String(OPEN_STRING_X - 20));
        highlight.setAttribute('y1', String(yOpen + hOffset));
        highlight.setAttribute('x2', String(boardEndX));
        highlight.setAttribute('y2', String(yBody + hOffset));
        highlight.setAttribute('stroke', s < 3 ? 'rgba(220,180,80,0.35)' : 'rgba(240,240,255,0.40)');
        highlight.setAttribute('stroke-width', String(stringWidths[s] * 0.7));
        highlight.setAttribute('stroke-linecap', 'round');
        g.appendChild(highlight);
        // String name label
        const label = svgEl('text');
        label.setAttribute('x', String(OPEN_STRING_X - 28));
        label.setAttribute('y', String(yOpen + 4.5));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '11');
        label.setAttribute('fill', '#777788');
        label.setAttribute('font-family', 'DM Sans, sans-serif');
        label.textContent = STRING_NAMES[s];
        g.appendChild(label);
    }
    // ── Fret numbers ─────────────────────────────────────────────────────────
    for (let f = 1; f <= FRET_COUNT; f++) {
        const x = (fretX(f - 1, NUT_X, SCALE_W) + fretX(f, NUT_X, SCALE_W)) / 2;
        const label = svgEl('text');
        label.setAttribute('x', String(x));
        label.setAttribute('y', String(totalH - 4));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '10');
        label.setAttribute('fill', '#b0b0cc');
        label.setAttribute('font-family', 'DM Sans, sans-serif');
        label.textContent = String(f);
        g.appendChild(label);
    }
}
export function renderNotes(svg, board, showOpenStrings, showDegrees) {
    const layer = svg.querySelector('#note-layer');
    layer.innerHTML = '';
    const boardEndX = fretX(FRET_COUNT, NUT_X, SCALE_W);
    for (const string of board) {
        for (const pos of string) {
            if (!pos.isActive)
                continue;
            if (pos.fret === 0 && !showOpenStrings)
                continue;
            const x = pos.fret === 0 ? OPEN_STRING_X : fretMidX(pos.fret, NUT_X, SCALE_W);
            const y = syAt(pos.string, x, boardEndX);
            const r = pos.degree === '1' ? TONIC_R : CIRCLE_R;
            const color = pos.degree ? getIntervalColor(pos.degree) : '#4A9EBF';
            const grp = svgEl('g');
            grp.classList.add('note-dot');
            if (pos.isBass && pos.degree !== '1') {
                const ring = svgEl('circle');
                ring.setAttribute('cx', String(x));
                ring.setAttribute('cy', String(y));
                ring.setAttribute('r', String(r + 5));
                ring.setAttribute('fill', 'none');
                ring.setAttribute('stroke', 'rgba(255,255,255,0.6)');
                ring.setAttribute('stroke-width', '1.5');
                ring.setAttribute('stroke-dasharray', '3 2');
                grp.appendChild(ring);
            }
            const circle = svgEl('circle');
            circle.setAttribute('cx', String(x));
            circle.setAttribute('cy', String(y));
            circle.setAttribute('r', String(r));
            circle.setAttribute('fill', color);
            circle.setAttribute('stroke', lighten(color, 40));
            circle.setAttribute('stroke-width', '1.5');
            grp.appendChild(circle);
            if (showDegrees && pos.degree) {
                const text = svgEl('text');
                text.setAttribute('x', String(x));
                text.setAttribute('y', String(y + 4.5));
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', pos.degree.length > 1 ? '9' : '11');
                text.setAttribute('font-weight', 'bold');
                text.setAttribute('fill', pos.degree === '1' ? '#1a1008' : '#ffffff');
                text.setAttribute('font-family', 'JetBrains Mono, monospace');
                text.setAttribute('pointer-events', 'none');
                text.textContent = pos.degree;
                grp.appendChild(text);
            }
            layer.appendChild(grp);
        }
    }
}
function lighten(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (n >> 16) + amount);
    const gv = Math.min(255, ((n >> 8) & 0xff) + amount);
    const b = Math.min(255, (n & 0xff) + amount);
    return `#${[r, gv, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}
