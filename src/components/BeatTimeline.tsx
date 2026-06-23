import { useRef } from "react";
import type { Pattern } from "../types";

interface Props {
  pattern: Pattern;
  onChange: (next: Pattern) => void;
  playhead: number | null;
  activeSub: number | null;
}

const EDGE = 0.004; // 이웃과 겹치지 않도록 아주 작은 여유
const TOP = 0.1; // 볼륨 1.0 일 때 세로 위치(위)
const BOT = 0.9; // 볼륨 0.0 일 때 세로 위치(아래)

// 볼륨(0~1) → 세로 위치 비율(0~1)
const vToY = (v: number) => TOP + (1 - v) * (BOT - TOP);
// 세로 위치 비율 → 볼륨
const yToV = (y: number) => Math.min(1, Math.max(0, 1 - (y - TOP) / (BOT - TOP)));

export function BeatTimeline({ pattern, onChange, playhead, activeSub }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragIndex = useRef<number | null>(null);
  const n = pattern.length;

  const fromClient = (clientX: number, clientY: number) => {
    const el = trackRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    };
  };

  const onDown = (e: React.PointerEvent, index: number) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragIndex.current = index;
  };

  const onMove = (e: React.PointerEvent) => {
    const index = dragIndex.current;
    if (index === null) return;
    const { x, y } = fromClient(e.clientX, e.clientY);
    const next = pattern.slice();
    const dot = { ...next[index] };

    // 세로 = 볼륨 (모든 점)
    dot.v = yToV(y);

    // 가로 = 시간 (박 머리 index 0 은 락)
    if (index > 0) {
      const lane = 1 / n;
      const lowerLane = (index - 1) * lane;
      const upperLane = (index + 1) * lane;
      const prev = next[index - 1].t;
      const nextT = index + 1 < n ? next[index + 1].t : 1;
      const lower = Math.max(lowerLane, prev + EDGE);
      const upper = Math.min(upperLane, nextT - EDGE);
      dot.t = Math.min(upper, Math.max(lower, x));
    }

    next[index] = dot;
    onChange(next);
  };

  const onUp = (e: React.PointerEvent) => {
    if (dragIndex.current !== null) {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      dragIndex.current = null;
    }
  };

  const gridLines = Array.from({ length: n - 1 }, (_, k) => (k + 1) / n);

  return (
    <div
      className="track"
      ref={trackRef}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {gridLines.map((x, k) => (
        <div key={`grid-${k}`} className="grid-line" style={{ left: `${x * 100}%` }} />
      ))}

      {playhead !== null && (
        <div className="playhead" style={{ left: `${playhead * 100}%` }} />
      )}

      {pattern.map((dot, i) => (
        <div
          key={i}
          className={"handle" + (i === 0 ? " locked" : "") + (activeSub === i ? " active" : "")}
          style={{ left: `${dot.t * 100}%`, top: `${vToY(dot.v) * 100}%` }}
          onPointerDown={(e) => onDown(e, i)}
        >
          <span className="handle-dot" style={{ transform: `scale(${0.6 + dot.v * 0.9})` }} />
          <span className="handle-label">{i === 0 ? "♩" : i + 1}</span>
        </div>
      ))}
    </div>
  );
}
