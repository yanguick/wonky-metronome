import { useEffect, useRef, useState } from "react";
import { Controls } from "./components/Controls";
import { BeatTimeline } from "./components/BeatTimeline";
import { Scheduler } from "./audio/scheduler";
import { evenPattern, type Pattern, type ScheduledNote, type Settings } from "./types";

export default function App() {
  const [bpm, setBpm] = useState(90);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [pattern, setPattern] = useState<Pattern>(evenPattern(3));
  const [isPlaying, setIsPlaying] = useState(false);

  const [activeBeat, setActiveBeat] = useState<number | null>(null);
  const [activeSub, setActiveSub] = useState<number | null>(null);
  const [playhead, setPlayhead] = useState<number | null>(null);

  const settingsRef = useRef<Settings>({ bpm, beatsPerMeasure, pattern });
  settingsRef.current = { bpm, beatsPerMeasure, pattern };

  const queueRef = useRef<ScheduledNote[]>([]);
  const lastNoteRef = useRef<ScheduledNote | null>(null);
  const schedulerRef = useRef<Scheduler | null>(null);
  const rafRef = useRef<number | null>(null);

  if (!schedulerRef.current) {
    schedulerRef.current = new Scheduler(
      () => settingsRef.current,
      (note) => queueRef.current.push(note)
    );
  }

  useEffect(() => {
    if (!isPlaying) return;
    const scheduler = schedulerRef.current!;
    const loop = () => {
      const now = scheduler.currentTime;
      const q = queueRef.current;
      while (q.length && q[0].time <= now) lastNoteRef.current = q.shift()!;
      const last = lastNoteRef.current;
      if (last) {
        setActiveBeat(last.beatIndex);
        setActiveSub(last.subIndex);
        const frac = (now - last.beatStartTime) / last.beatDuration;
        setPlayhead(Math.min(1, Math.max(0, frac)));
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const toggle = async () => {
    const scheduler = schedulerRef.current!;
    if (isPlaying) {
      scheduler.stop();
      queueRef.current = [];
      lastNoteRef.current = null;
      setIsPlaying(false);
      setActiveBeat(null);
      setActiveSub(null);
      setPlayhead(null);
    } else {
      await scheduler.start();
      setIsPlaying(true);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>킹받는 메트로놈</h1>
        <p className="sub">지멋대로 움직이는놈</p>
      </header>

      <div className="measure-dots">
        {Array.from({ length: beatsPerMeasure }, (_, i) => (
          <span
            key={i}
            className={"beat-dot" + (i === 0 ? " accent" : "") + (activeBeat === i ? " on" : "")}
          />
        ))}
      </div>

      <BeatTimeline pattern={pattern} onChange={setPattern} playhead={playhead} activeSub={activeSub} />

      <Controls
        bpm={bpm}
        setBpm={setBpm}
        beatsPerMeasure={beatsPerMeasure}
        setBeatsPerMeasure={setBeatsPerMeasure}
        subdivisions={pattern.length}
        setSubdivisions={(n) => setPattern(evenPattern(n))}
        isPlaying={isPlaying}
        onToggle={toggle}
        onResetEven={() => setPattern(evenPattern(pattern.length))}
      />
    </div>
  );
}
