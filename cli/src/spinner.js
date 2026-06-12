import { formatLine, pickRotation } from './creatives.js';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const CLEAR_LINE = '\x1b[2K\r';

// 5s per creative = one "impression" in the unit of account kickbacks taught
// the market ($/1k five-second impressions) — keeps our inventory comparable
const ROTATE_MS = 5000;
const FRAME_MS = 80;

// Renders our ad-carrying spinner on the parent terminal while a child
// process streams output through us (codex exec mode).
export class AdSpinner {
  constructor(creatives, stream = process.stderr) {
    this.rotation = pickRotation(creatives);
    this.stream = stream;
    this.frame = 0;
    this.creativeIndex = 0;
    this.lastRotate = Date.now();
    this.timer = null;
    this.visible = false;
    // verified serve ledger: creative id -> rendered ms. Only accumulates
    // while the spinner is actually drawing (TTY), so reported time is
    // honest "on screen" time, not wall time.
    this.served = new Map();
    this.servedSince = null;
  }

  get enabled() {
    return this.stream.isTTY;
  }

  accumulate() {
    const current = this.rotation[this.creativeIndex];
    if (this.servedSince && current?.id) {
      const ms = Date.now() - this.servedSince;
      this.served.set(current.id, (this.served.get(current.id) || 0) + ms);
    }
    this.servedSince = Date.now();
  }

  getServeEvents(surface) {
    return [...this.served.entries()]
      .filter(([, ms]) => ms >= 250)
      .map(([creative_id, ms]) => ({ creative_id, surface, ms: Math.round(ms) }));
  }

  start() {
    if (!this.enabled || this.timer) return;
    this.servedSince = Date.now();
    this.timer = setInterval(() => this.draw(), FRAME_MS);
    this.draw();
  }

  draw() {
    if (Date.now() - this.lastRotate > ROTATE_MS) {
      this.accumulate();
      this.creativeIndex = (this.creativeIndex + 1) % this.rotation.length;
      this.lastRotate = Date.now();
    }
    const frame = FRAMES[this.frame = (this.frame + 1) % FRAMES.length];
    const line = formatLine(this.rotation[this.creativeIndex]);
    const width = this.stream.columns || 80;
    const text = `${CYAN}${frame}${RESET} ${DIM}${line}${RESET}`;
    // Truncate to terminal width to avoid wrap artifacts (ANSI codes excluded
    // from the budget loosely; 12 covers the escapes above).
    this.stream.write(CLEAR_LINE + text.slice(0, width + 12));
    this.visible = true;
  }

  // Call before writing child output so the spinner line doesn't interleave.
  clearForOutput() {
    if (this.visible && this.enabled) {
      this.stream.write(CLEAR_LINE);
      this.visible = false;
    }
  }

  stop() {
    if (this.timer) {
      this.accumulate();
      clearInterval(this.timer);
    }
    this.timer = null;
    this.servedSince = null;
    this.clearForOutput();
  }
}
