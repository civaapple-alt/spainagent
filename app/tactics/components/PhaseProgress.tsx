import type { TacticalFrame } from "../types";

type PhaseProgressProps = {
  frames: TacticalFrame[];
  frame: TacticalFrame;
  phaseIndex: number;
  onPhaseChange: (index: number) => void;
};

export function PhaseProgress({ frames, frame, phaseIndex, onPhaseChange }: PhaseProgressProps) {
  return (
    <div className="phase-progress" aria-label="当前战术阶段">
      <div className="progress-copy">
        <span>{frame.eyebrow}</span>
        <strong>{frame.title}</strong>
        <p>{frame.description}</p>
      </div>
      <div className="progress-track">
        {frames.map((item, index) => (
          <button
            key={item.id}
            className={index === phaseIndex ? "active" : index < phaseIndex ? "passed" : ""}
            onClick={() => onPhaseChange(index)}
            aria-label={`切换到${item.title}`}
          ><i /></button>
        ))}
      </div>
      <div className="pitch-legend" aria-label="战术线路图例">
        <span><i className="pass" />传球</span>
        <span><i className="run" />跑动</span>
        <span><i className="press" />压迫</span>
        <span><i className="cover" />保护</span>
      </div>
    </div>
  );
}
