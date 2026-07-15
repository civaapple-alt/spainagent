import type { NodeRef, TacticalFrame } from "../types";

type PhaseProgressProps = {
  frames: TacticalFrame[];
  frame: TacticalFrame;
  phaseIndex: number;
  onPhaseChange: (index: number) => void;
  onSelectNode?: (node: NodeRef) => void;
};

export function PhaseProgress({ frames, frame, phaseIndex, onPhaseChange, onSelectNode }: PhaseProgressProps) {
  const guide = frame.viewingGuide;

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
      {guide && (
        <div className="viewing-guide" aria-label="本阶段观察指南">
          <div className="guide-question">
            <small>先看这个问题</small>
            <strong>{guide.question}</strong>
          </div>
          <div className="guide-watch">
            <small>再按顺序看位置</small>
            <div>
              {guide.watchTargets.map((target, index) => (
                <button key={`${target.teamId}-${target.slotId}`} onClick={() => onSelectNode?.(target)}>
                  <i>{index + 1}</i>{target.label}
                </button>
              ))}
            </div>
          </div>
          <div className="guide-goals">
            <p><b>西班牙要做到</b>{guide.homeGoal}</p>
            <p><b>法国要做到</b>{guide.awayGoal}</p>
          </div>
          <div className="guide-signal">
            <small>如何判断谁占优</small>
            <strong>{guide.successSignal}</strong>
            {guide.evidence && <span>{guide.evidence}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
