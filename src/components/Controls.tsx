import { useRef } from "react";

interface Props {
  bpm: number;
  setBpm: (v: number) => void;
  beatsPerMeasure: number;
  setBeatsPerMeasure: (v: number) => void;
  subdivisions: number;
  setSubdivisions: (v: number) => void;
  isPlaying: boolean;
  onToggle: () => void;
  onResetEven: () => void;
}

const BPM_MIN = 20;
const BPM_MAX = 400;

/** 숫자 없는 회전 노브. 위/아래로 드래그하면 값이 바뀐다(피드백은 회전각뿐). */
function Knob({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const start = useRef<{ y: number; val: number } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, val: value };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dy = start.current.y - e.clientY; // 위로 = 증가
    const step = (max - min) / 240; // 픽셀당 변화량
    const next = Math.round(start.current.val + dy * step);
    onChange(Math.min(max, Math.max(min, next)));
  };
  const onUp = (e: React.PointerEvent) => {
    start.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const angle = -135 + ((value - min) / (max - min)) * 270;

  return (
    <div className="knob" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <div className="knob-dial" style={{ transform: `rotate(${angle}deg)` }}>
        <span className="knob-indicator" />
      </div>
    </div>
  );
}

export function Controls({
  bpm,
  setBpm,
  beatsPerMeasure,
  setBeatsPerMeasure,
  subdivisions,
  setSubdivisions,
  isPlaying,
  onToggle,
  onResetEven
}: Props) {
  return (
    <div className="controls">
      <div className="knob-row">
        <Knob value={bpm} min={BPM_MIN} max={BPM_MAX} onChange={setBpm} />
      </div>

      <div className="stepper-row">
        <div className="stepper">
          <span className="lbl">박</span>
          <div className="stepper-ctrl">
            <button onClick={() => setBeatsPerMeasure(Math.max(1, beatsPerMeasure - 1))}>−</button>
            <span className="num">{beatsPerMeasure}</span>
            <button onClick={() => setBeatsPerMeasure(Math.min(12, beatsPerMeasure + 1))}>+</button>
          </div>
        </div>

        <div className="stepper">
          <span className="lbl">분할</span>
          <div className="stepper-ctrl">
            <button onClick={() => setSubdivisions(Math.max(1, subdivisions - 1))}>−</button>
            <span className="num">{subdivisions}</span>
            <button onClick={() => setSubdivisions(Math.min(9, subdivisions + 1))}>+</button>
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button className={"play" + (isPlaying ? " on" : "")} onClick={onToggle}>
          {isPlaying ? "■" : "▶"}
        </button>
        <button className="reset" onClick={onResetEven}>리셋</button>
      </div>
    </div>
  );
}
