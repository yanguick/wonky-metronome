import { playClick } from "./click";
import type { ClickType, ScheduledNote, Settings } from "../types";

const LOOKAHEAD_MS = 25; // 타이머 주기
const SCHEDULE_AHEAD = 0.1; // 미리 예약하는 윈도우(초)

/**
 * Lookahead 스케줄러 (Chris Wilson "A Tale of Two Clocks").
 * 큰 박 시작 시각은 beatDuration 만큼만 누적 → 템포에 락.
 * subdivision 은 pattern[sub].t * beatDuration 으로 박 안에서만 위치 결정,
 * 볼륨은 pattern[sub].v.
 */
export class Scheduler {
  private ctx: AudioContext | null = null;
  private timer: number | null = null;

  private currentBeat = 0;
  private currentSub = 0;
  private beatStartTime = 0;

  constructor(
    private getSettings: () => Settings,
    private onNote: (note: ScheduledNote) => void
  ) {}

  get currentTime(): number {
    return this.ctx?.currentTime ?? 0;
  }

  async start(): Promise<void> {
    if (this.timer !== null) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    await this.ctx.resume();

    this.currentBeat = 0;
    this.currentSub = 0;
    this.beatStartTime = this.ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.tick(), LOOKAHEAD_MS);
    this.tick();
  }

  stop(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  private tick(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    while (true) {
      const s = this.getSettings();
      const beatDuration = 60 / s.bpm;
      const pattern = s.pattern.length > 0 ? s.pattern : [{ t: 0, v: 1 }];
      if (this.currentSub >= pattern.length) this.currentSub = 0;

      const dot = pattern[this.currentSub] ?? { t: 0, v: 1 };
      const noteTime = this.beatStartTime + dot.t * beatDuration;
      if (noteTime >= ctx.currentTime + SCHEDULE_AHEAD) break;

      const type = this.classify(this.currentBeat, this.currentSub);
      playClick(ctx, noteTime, type, dot.v);
      this.onNote({
        beatIndex: this.currentBeat,
        subIndex: this.currentSub,
        type,
        time: noteTime,
        beatStartTime: this.beatStartTime,
        beatDuration
      });

      this.advance(pattern.length, s.beatsPerMeasure, beatDuration);
    }
  }

  private classify(beat: number, sub: number): ClickType {
    if (sub !== 0) return "sub";
    return beat === 0 ? "accent" : "beat";
  }

  private advance(patternLen: number, beatsPerMeasure: number, beatDuration: number): void {
    this.currentSub++;
    if (this.currentSub >= patternLen) {
      this.currentSub = 0;
      this.beatStartTime += beatDuration;
      this.currentBeat = (this.currentBeat + 1) % Math.max(1, beatsPerMeasure);
    }
  }
}
