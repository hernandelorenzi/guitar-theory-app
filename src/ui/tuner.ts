const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

const GUITAR_STRINGS = [
  { name: 'E2', freq: 82.41 },
  { name: 'A2', freq: 110.00 },
  { name: 'D3', freq: 146.83 },
  { name: 'G3', freq: 196.00 },
  { name: 'B3', freq: 246.94 },
  { name: 'E4', freq: 329.63 },
]

const SVG_NS = 'http://www.w3.org/2000/svg'
const CX = 100, CY = 115, R = 88  // needle arc center and radius

interface TunerState {
  audioCtx: AudioContext | null
  analyser: AnalyserNode | null
  mediaStream: MediaStream | null
  rafId: number
  isRunning: boolean
  buffer: Float32Array<ArrayBufferLike>
  smoothedCents: number
}

const s: TunerState = {
  audioCtx: null,
  analyser: null,
  mediaStream: null,
  rafId: 0,
  isRunning: false,
  buffer: new Float32Array(2048),
  smoothedCents: 0,
}

// SVG elements updated each frame
let needleEl: SVGLineElement
let noteNameEl: HTMLElement
let octaveEl: HTMLElement
let centsEl: HTMLElement
let startBtn: HTMLButtonElement
let errorEl: HTMLElement

export function buildTuner(container: HTMLElement): void {
  const panel = document.createElement('div')
  panel.className = 'tool-panel'

  const title = document.createElement('div')
  title.className = 'tool-panel-title'
  title.textContent = 'Tuner'
  panel.appendChild(title)

  // SVG needle display
  panel.appendChild(buildNeedleSVG())

  // Note name + octave
  const noteDisplay = document.createElement('div')
  noteDisplay.className = 'tuner-note-display'
  noteNameEl = document.createElement('span')
  noteNameEl.className = 'tuner-note-name'
  noteNameEl.textContent = '—'
  octaveEl = document.createElement('span')
  octaveEl.className = 'tuner-octave'
  octaveEl.textContent = ''
  noteDisplay.appendChild(noteNameEl)
  noteDisplay.appendChild(octaveEl)
  panel.appendChild(noteDisplay)

  // Cents
  centsEl = document.createElement('div')
  centsEl.className = 'tuner-cents'
  centsEl.textContent = ''
  panel.appendChild(centsEl)

  // Error message
  errorEl = document.createElement('div')
  errorEl.className = 'tuner-error'
  panel.appendChild(errorEl)

  // String reference
  const stringsRow = document.createElement('div')
  stringsRow.className = 'tuner-strings'
  for (const gs of GUITAR_STRINGS) {
    const span = document.createElement('span')
    span.textContent = gs.name
    stringsRow.appendChild(span)
  }
  panel.appendChild(stringsRow)

  // Start button
  startBtn = document.createElement('button')
  startBtn.className = 'btn btn-start-stop'
  startBtn.textContent = 'Start Tuner'
  startBtn.addEventListener('click', () => s.isRunning ? stopTuner() : startTuner())
  panel.appendChild(startBtn)

  container.appendChild(panel)
}

function buildNeedleSVG(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement
  svg.setAttribute('id', 'tuner-svg')
  svg.setAttribute('viewBox', '0 0 200 130')

  function arcPath(startCents: number, endCents: number): string {
    const p1 = centsToPoint(startCents)
    const p2 = centsToPoint(endCents)
    return `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} A ${R},${R} 0 0,1 ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }

  // Arc segments: red / yellow / green / yellow / red
  const segments: [number, number, string][] = [
    [-60, -30, '#cc4455'],
    [-30, -10, '#e8c440'],
    [-10,  10, '#22cc66'],
    [ 10,  30, '#e8c440'],
    [ 30,  60, '#cc4455'],
  ]
  for (const [from, to, color] of segments) {
    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', arcPath(from, to))
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', color)
    path.setAttribute('stroke-width', '5')
    path.setAttribute('opacity', '0.35')
    svg.appendChild(path)
  }

  // Tick marks at 0 cents (center)
  const centerPt = centsToPoint(0)
  const innerPt = centsToPoint(0, R - 12)
  const tick = document.createElementNS(SVG_NS, 'line')
  tick.setAttribute('x1', String(innerPt.x.toFixed(1)))
  tick.setAttribute('y1', String(innerPt.y.toFixed(1)))
  tick.setAttribute('x2', String(centerPt.x.toFixed(1)))
  tick.setAttribute('y2', String(centerPt.y.toFixed(1)))
  tick.setAttribute('stroke', '#22cc66')
  tick.setAttribute('stroke-width', '2')
  svg.appendChild(tick)

  // Needle
  needleEl = document.createElementNS(SVG_NS, 'line') as SVGLineElement
  needleEl.setAttribute('x1', String(CX))
  needleEl.setAttribute('y1', String(CY))
  const tip = centsToPoint(0, R - 10)
  needleEl.setAttribute('x2', tip.x.toFixed(1))
  needleEl.setAttribute('y2', tip.y.toFixed(1))
  needleEl.setAttribute('stroke', '#888899')
  needleEl.setAttribute('stroke-width', '2')
  needleEl.setAttribute('stroke-linecap', 'round')
  svg.appendChild(needleEl)

  // Pivot dot
  const pivot = document.createElementNS(SVG_NS, 'circle')
  pivot.setAttribute('cx', String(CX))
  pivot.setAttribute('cy', String(CY))
  pivot.setAttribute('r', '4')
  pivot.setAttribute('fill', '#b0b0cc')
  svg.appendChild(pivot)

  return svg
}

function centsToPoint(cents: number, radius: number = R): { x: number; y: number } {
  // 0 cents = straight up, -60 = left, +60 = right
  const angleDeg = 90 - cents  // standard math angle: 90° = up
  const rad = angleDeg * Math.PI / 180
  return {
    x: CX + radius * Math.cos(rad),
    y: CY - radius * Math.sin(rad),  // SVG y-axis is flipped
  }
}

async function startTuner(): Promise<void> {
  errorEl.textContent = ''
  try {
    if (!s.audioCtx) s.audioCtx = new AudioContext()
    if (s.audioCtx.state === 'suspended') await s.audioCtx.resume()

    s.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    s.analyser = s.audioCtx.createAnalyser()
    s.analyser.fftSize = 2048
    s.analyser.smoothingTimeConstant = 0
    s.buffer = new Float32Array(s.analyser.fftSize)

    const source = s.audioCtx.createMediaStreamSource(s.mediaStream)
    source.connect(s.analyser)
    // NOT connected to destination — no feedback

    s.isRunning = true
    s.smoothedCents = 0
    startBtn.textContent = 'Stop Tuner'
    startBtn.classList.add('playing')
    tunerLoop()
  } catch {
    errorEl.textContent = 'Microphone access denied.'
  }
}

function stopTuner(): void {
  s.isRunning = false
  cancelAnimationFrame(s.rafId)
  s.mediaStream?.getTracks().forEach(t => t.stop())
  s.mediaStream = null
  startBtn.textContent = 'Start Tuner'
  startBtn.classList.remove('playing')
  resetDisplay()
}

function tunerLoop(): void {
  if (!s.isRunning || !s.analyser) return
  const buf = s.buffer as Float32Array<ArrayBuffer>
  s.analyser.getFloatTimeDomainData(buf)
  const freq = autoCorrelate(buf, s.audioCtx!.sampleRate)
  if (freq > 0) updateDisplay(freq)
  s.rafId = requestAnimationFrame(tunerLoop)
}

function updateDisplay(freq: number): void {
  const midi = 12 * Math.log2(freq / 440) + 69
  const rounded = Math.round(midi)
  const cents = Math.round((midi - rounded) * 100)
  const octave = Math.floor(rounded / 12) - 1
  const note = NOTE_NAMES[((rounded % 12) + 12) % 12]

  // Smooth needle
  s.smoothedCents = s.smoothedCents * 0.96 + cents * 0.04
  const clamped = Math.max(-60, Math.min(60, s.smoothedCents))
  const tip = centsToPoint(clamped, R - 10)
  needleEl.setAttribute('x2', tip.x.toFixed(1))
  needleEl.setAttribute('y2', tip.y.toFixed(1))

  // Needle color based on accuracy
  const abs = Math.abs(cents)
  const color = abs < 10 ? '#22cc66' : abs < 30 ? '#e8c440' : '#cc4455'
  needleEl.setAttribute('stroke', color)

  noteNameEl.textContent = note
  octaveEl.textContent = String(octave)

  const sign = cents > 0 ? '+' : ''
  centsEl.textContent = `${sign}${cents} cents`
  centsEl.className = 'tuner-cents ' + (abs < 10 ? 'in-tune' : abs < 30 ? 'close' : 'out')
}

function resetDisplay(): void {
  noteNameEl.textContent = '—'
  octaveEl.textContent = ''
  centsEl.textContent = ''
  centsEl.className = 'tuner-cents'
  const tip = centsToPoint(0, R - 10)
  needleEl.setAttribute('x2', tip.x.toFixed(1))
  needleEl.setAttribute('y2', tip.y.toFixed(1))
  needleEl.setAttribute('stroke', '#888899')
}

// Autocorrelation pitch detection
// Reuse buffer to avoid allocations at 60fps
const correlations = new Float32Array(1024)

function autoCorrelate(buf: Float32Array<ArrayBuffer>, sampleRate: number): number {
  const SIZE = buf.length

  // RMS silence check
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01) return -1

  // Find first zero crossing (going positive)
  let start = 0
  for (let i = 0; i < SIZE / 2; i++) {
    if (buf[i] < 0 && buf[i + 1] >= 0) { start = i; break }
  }

  const MAX_LAG = SIZE / 2
  for (let lag = 0; lag < MAX_LAG; lag++) {
    let sum = 0
    const len = SIZE - lag - start
    for (let i = 0; i < len; i++) sum += buf[start + i] * buf[start + i + lag]
    correlations[lag] = sum
  }

  // Skip initial decay, find first dip
  let d = 0
  while (d < MAX_LAG - 1 && correlations[d] > correlations[d + 1]) d++

  // Find peak after dip
  let maxVal = -Infinity, maxLag = -1
  for (let i = d; i < MAX_LAG - 1; i++) {
    if (correlations[i] > maxVal) { maxVal = correlations[i]; maxLag = i }
  }

  if (maxLag < 2 || maxVal < 0.01) return -1

  // Parabolic interpolation for sub-sample accuracy
  const y1 = correlations[maxLag - 1]
  const y2 = correlations[maxLag]
  const y3 = correlations[maxLag + 1]
  const refined = maxLag + (y3 - y1) / (2 * (2 * y2 - y1 - y3))

  const freq = sampleRate / refined
  // Sanity check: guitar range E2 (82Hz) to E6 (1318Hz)
  if (freq < 60 || freq > 1400) return -1

  return freq
}
