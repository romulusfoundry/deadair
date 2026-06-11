import { formatLine, pickRotation } from './creatives.js';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const CLEAR_LINE = '\x1b[2K\r';

const ROTATE_MS = 4000;
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
  }

  get enabled() {
    return this.stream.isTTY;
  }

  start() {
    if (!this.enabled || this.timer) return;
    this.timer = setInterval(() => this.draw(), FRAME_MS);
    this.draw();
  }

  draw() {
    if (Date.now() - this.lastRotate > ROTATE_MS) {
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
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.clearForOutput();
  }
}
