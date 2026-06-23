import type { ClickType } from "../types";

const FREQ: Record<ClickType, number> = {
  accent: 1500,
  beat: 1000,
  sub: 700
};

/**
 * 짧은 클릭음을 정확한 시각에 예약한다.
 * vol(0~1)이 그대로 게인 피크가 된다. 너무 작으면 소리 없이 건너뜀.
 */
export function playClick(ctx: AudioContext, time: number, type: ClickType, vol: number): void {
  const peak = Math.min(0.95, vol);
  if (peak < 0.0015) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(FREQ[type], time);

  const dur = 0.045;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc.connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}
