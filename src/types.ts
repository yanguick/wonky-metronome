export type ClickType = "accent" | "beat" | "sub";

/** 한 박 안의 점 하나. t = 시간 위치(0~1), v = 볼륨(0~1). */
export interface Dot {
  t: number;
  v: number;
}

/**
 * 한 박 안의 점 배열.
 * pattern[0].t === 0 은 박 머리 = 템포에 락. 가로 드래그 불가(세로=볼륨은 가능).
 * 점 i 는 가로로 자기 양옆 두 칸 안에서, 세로로 볼륨을 조절한다.
 */
export type Pattern = Dot[];

export interface Settings {
  bpm: number;
  beatsPerMeasure: number;
  pattern: Pattern;
}

export interface ScheduledNote {
  beatIndex: number;
  subIndex: number;
  type: ClickType;
  /** AudioContext 시간(초) 기준 울리는 시각 */
  time: number;
  /** 이 박이 시작한 AudioContext 시각 (playhead 계산용) */
  beatStartTime: number;
  /** 한 박 길이(초) */
  beatDuration: number;
}

/** N등분 균등 패턴 생성. 박 머리는 볼륨 1.0, 나머지는 0.7. */
export function evenPattern(count: number): Pattern {
  const n = Math.max(1, Math.floor(count));
  return Array.from({ length: n }, (_, i) => ({
    t: i / n,
    v: i === 0 ? 1.0 : 0.7
  }));
}
