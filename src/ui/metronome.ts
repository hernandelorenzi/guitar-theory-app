type TimeSig = '4/4' | '3/4' | '6/8' | '2/4'

const BEATS_PER_BAR: Record<TimeSig, number> = { '4/4': 4, '3/4': 3, '6/8': 6, '2/4': 2 }
const LOOKAHEAD_MS = 25.0
const SCHEDULE_AHEAD = 0.1

interface MetroState {
  audioCtx: AudioContext | null
  isPlaying: boolean
  bpm: number
  timeSig: TimeSig
  currentBeat: number
  nextBeatTime: number
  intervalId: ReturnType<typeof setInterval> | null
  tapTimes: number[]
}

const s: MetroState = {
  audioCtx: null,
  isPlaying: false,
  bpm: 120,
  timeSig: '4/4',
  currentBeat: 0,
  nextBeatTime: 0,
  intervalId: null,
  tapTimes: [],
}

let dotEls: HTMLElement[] = []
let bpmDisplay: HTMLElement
let bpmSlider: HTMLInputElement
let startBtn: HTMLButtonElement

export function buildMetronome(container: HTMLElement): void {
  const panel = document.createElement('div')
  panel.className = 'tool-panel'

  // Title
  const title = document.createElement('div')
  title.className = 'tool-panel-title'
  title.textContent = 'Metronome'
  panel.appendChild(title)

  // BPM display
  bpmDisplay = document.createElement('div')
  bpmDisplay.className = 'metro-bpm-display'
  bpmDisplay.textContent = String(s.bpm)
  panel.appendChild(bpmDisplay)

  const bpmUnit = document.createElement('div')
  bpmUnit.className = 'metro-bpm-unit'
  bpmUnit.textContent = 'BPM'
  panel.appendChild(bpmUnit)

  // BPM controls: − slider +
  const controls = document.createElement('div')
  controls.className = 'metro-controls'

  const btnMinus = document.createElement('button')
  btnMinus.className = 'btn btn-sm'
  btnMinus.textContent = '−'
  btnMinus.addEventListener('click', () => setBpm(s.bpm - 1))

  bpmSlider = document.createElement('input')
  bpmSlider.type = 'range'
  bpmSlider.min = '40'
  bpmSlider.max = '240'
  bpmSlider.value = String(s.bpm)
  bpmSlider.addEventListener('input', () => setBpm(Number(bpmSlider.value)))

  const btnPlus = document.createElement('button')
  btnPlus.className = 'btn btn-sm'
  btnPlus.textContent = '+'
  btnPlus.addEventListener('click', () => setBpm(s.bpm + 1))

  controls.appendChild(btnMinus)
  controls.appendChild(bpmSlider)
  controls.appendChild(btnPlus)
  panel.appendChild(controls)

  // Time signature
  const timeSigRow = document.createElement('div')
  timeSigRow.className = 'metro-timesig'
  for (const sig of ['4/4', '3/4', '6/8', '2/4'] as TimeSig[]) {
    const btn = document.createElement('button')
    btn.className = 'btn chord-btn' + (sig === s.timeSig ? ' active' : '')
    btn.textContent = sig
    btn.addEventListener('click', () => {
      s.timeSig = sig
      timeSigRow.querySelectorAll('button').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      rebuildDots(dotsRow)
      if (s.isPlaying) { stopMetronome(); startMetronome() }
    })
    timeSigRow.appendChild(btn)
  }
  panel.appendChild(timeSigRow)

  // Beat dots
  const dotsRow = document.createElement('div')
  dotsRow.className = 'metro-beats'
  panel.appendChild(dotsRow)
  rebuildDots(dotsRow)

  // Actions: Tap + Start/Stop
  const actions = document.createElement('div')
  actions.className = 'metro-actions'

  const tapBtn = document.createElement('button')
  tapBtn.className = 'btn'
  tapBtn.textContent = 'Tap'
  tapBtn.addEventListener('click', onTap)

  startBtn = document.createElement('button')
  startBtn.className = 'btn btn-start-stop'
  startBtn.textContent = 'Start'
  startBtn.addEventListener('click', () => s.isPlaying ? stopMetronome() : startMetronome())

  actions.appendChild(tapBtn)
  actions.appendChild(startBtn)
  panel.appendChild(actions)

  container.appendChild(panel)
}

function rebuildDots(row: HTMLElement): void {
  row.innerHTML = ''
  dotEls = []
  const n = BEATS_PER_BAR[s.timeSig]
  for (let i = 0; i < n; i++) {
    const dot = document.createElement('div')
    dot.className = 'metro-dot' + (i === 0 ? ' beat-accent' : '')
    row.appendChild(dot)
    dotEls.push(dot)
  }
}

function setBpm(val: number): void {
  s.bpm = Math.max(40, Math.min(240, val))
  bpmDisplay.textContent = String(s.bpm)
  bpmSlider.value = String(s.bpm)
}

function startMetronome(): void {
  if (!s.audioCtx) s.audioCtx = new AudioContext()
  if (s.audioCtx.state === 'suspended') s.audioCtx.resume()
  s.currentBeat = 0
  s.nextBeatTime = s.audioCtx.currentTime + 0.05
  s.isPlaying = true
  startBtn.textContent = 'Stop'
  startBtn.classList.add('playing')
  schedule()
  s.intervalId = setInterval(schedule, LOOKAHEAD_MS)
}

function stopMetronome(): void {
  if (s.intervalId !== null) clearInterval(s.intervalId)
  s.isPlaying = false
  startBtn.textContent = 'Start'
  startBtn.classList.remove('playing')
  dotEls.forEach(d => d.classList.remove('beat-active'))
}

function schedule(): void {
  if (!s.audioCtx) return
  while (s.nextBeatTime < s.audioCtx.currentTime + SCHEDULE_AHEAD) {
    playClick(s.currentBeat, s.nextBeatTime)
    flashDotAt(s.currentBeat, s.nextBeatTime)
    s.currentBeat = (s.currentBeat + 1) % BEATS_PER_BAR[s.timeSig]
    s.nextBeatTime += 60.0 / s.bpm
  }
}

function playClick(beat: number, time: number): void {
  if (!s.audioCtx) return
  const osc = s.audioCtx.createOscillator()
  const gain = s.audioCtx.createGain()
  osc.connect(gain)
  gain.connect(s.audioCtx.destination)
  osc.type = 'sine'
  osc.frequency.value = beat === 0 ? 1000 : 750
  gain.gain.setValueAtTime(beat === 0 ? 1.0 : 0.65, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
  osc.start(time)
  osc.stop(time + 0.06)
  osc.onended = () => osc.disconnect()
}

function flashDotAt(beat: number, beatTime: number): void {
  const ctx = s.audioCtx!
  const delay = Math.max(0, (beatTime - ctx.currentTime) * 1000)
  setTimeout(() => {
    dotEls.forEach(d => d.classList.remove('beat-active'))
    dotEls[beat % dotEls.length]?.classList.add('beat-active')
  }, delay)
}

function onTap(): void {
  const now = performance.now()
  s.tapTimes = [...s.tapTimes.filter(t => now - t < 3000), now].slice(-8)
  if (s.tapTimes.length > 1) {
    const gaps = s.tapTimes.slice(1).map((t, i) => t - s.tapTimes[i])
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length
    setBpm(Math.round(60000 / avg))
  }
}
