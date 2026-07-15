"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAnnotationStyle,
  getProgressRouteStyle,
  getVisionStyle,
  isDefensiveStage,
  isFocusedNode,
  isPossessionStage,
} from "../geometry";
import type { SlotId, TacticalFrame, TeamDefinition } from "../types";

type PitchStageProps = {
  team: TeamDefinition;
  opponentTeam?: TeamDefinition;
  frames: TacticalFrame[];
  frame: TacticalFrame;
  phaseIndex: number;
  selectedSlotId: SlotId;
  playing: boolean;
  speed: number;
  phaseDuration: number;
  showOpponents: boolean;
  showLines: boolean;
  showVision: boolean;
  showDefensiveZone: boolean;
  showProgressRoute: boolean;
  onPhaseChange: (index: number) => void;
  onSelectSlot: (slotId: SlotId) => void;
  onTogglePlaying: () => void;
  onCycleSpeed: () => void;
  onToggleOpponents: () => void;
  onToggleLines: () => void;
  onToggleVision: () => void;
  onToggleDefensiveZone: () => void;
  onToggleProgressRoute: () => void;
};

export function PitchStage({
  team, opponentTeam, frames, frame, phaseIndex, selectedSlotId, playing, speed, phaseDuration,
  showOpponents, showLines, showVision, showDefensiveZone, showProgressRoute,
  onPhaseChange, onSelectSlot, onTogglePlaying, onCycleSpeed, onToggleOpponents, onToggleLines,
  onToggleVision, onToggleDefensiveZone, onToggleProgressRoute,
}: PitchStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const teamFrame = frame.teams[team.id];
  const opponentFrame = frame.teams[frame.opponentTeamId];
  const selectedNode = teamFrame.nodes[selectedSlotId];
  const selectedRole = team.roles[selectedNode.roleId];
  const defensive = isDefensiveStage(frame.stage);
  const possession = isPossessionStage(frame.stage);
  const visionStyle = getVisionStyle(frame, team.id, selectedSlotId, selectedRole);

  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current?.requestFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  };

  return (
    <div className="pitch-stage" ref={stageRef}>
      <div className="board-toolbar">
        <div className="phase-tabs" role="tablist" aria-label="攻防阶段">
          {frames.map((item, index) => (
            <button
              key={item.id}
              className={index === phaseIndex ? "phase-tab active" : "phase-tab"}
              onClick={() => onPhaseChange(index)}
              role="tab"
              aria-selected={index === phaseIndex}
            >
              <span>{item.short}</span>{item.title}
            </button>
          ))}
        </div>
        <div className="playback">
          <button className="layer-button" onClick={onToggleOpponents} aria-pressed={showOpponents} aria-label="显示或隐藏对手站位">
            对手 <b>{showOpponents ? "开" : "关"}</b>
          </button>
          <button className="layer-button" onClick={onToggleLines} aria-pressed={showLines} aria-label="显示或隐藏战术线路">
            线路 <b>{showLines ? "开" : "关"}</b>
          </button>
          <button className="play-button" onClick={onTogglePlaying} aria-label={playing ? "暂停战术演示" : "播放战术演示"}>
            {playing ? "Ⅱ" : "▶"}
          </button>
          <button className="speed-button" onClick={onCycleSpeed} aria-label="切换播放速度">{speed}×</button>
          <button className="fullscreen-button" onClick={toggleFullscreen} aria-label={isFullscreen ? "退出球场全屏" : "球场全屏显示"} title={isFullscreen ? "退出全屏" : "全屏显示"}>
            <b>{isFullscreen ? "×" : "⛶"}</b><span>{isFullscreen ? "退出" : "全屏"}</span>
          </button>
        </div>
        <div
          key={`${frame.id}-${playing}-${speed}`}
          className={`auto-timer ${playing ? "running" : ""}`}
          style={{ animationDuration: `${phaseDuration}ms` }}
        />
      </div>

      <div className="coach-strip">
        <div className="live-coach">
          <span>LIVE COACH · 0{phaseIndex + 1}</span>
          <strong>{teamFrame.shape}</strong>
          <small>{frame.instruction}</small>
        </div>
        <div className="pitch-metrics" aria-label="当前阵型战术指标">
          <span><small>宽度</small><b>{frame.metrics.widthMeters}m</b></span>
          <span><small>纵深</small><b>{frame.metrics.lengthMeters}m</b></span>
          <span><small>身后保护</small><b>{frame.metrics.protection}</b></span>
        </div>
        <div className="guidance-controls" aria-label="球员指导图层">
          <span>指导模型 · {selectedRole.label}</span>
          <div>
            <button onClick={onToggleVision} aria-pressed={showVision}>视角</button>
            <button onClick={onToggleDefensiveZone} aria-pressed={showDefensiveZone} disabled={!defensive}>防区</button>
            <button onClick={onToggleProgressRoute} aria-pressed={showProgressRoute} disabled={!possession}>推进</button>
          </div>
        </div>
      </div>

      <div className={`pitch phase-${frame.id}`}>
        <div className="pitch-grain" />
        <div className="pitch-boundary" />
        <div className="halfway-line" />
        <div className="center-circle" />
        <div className="center-dot" />
        <div className="penalty-area left"><span /></div>
        <div className="penalty-area right"><span /></div>
        <div className="goal left" />
        <div className="goal right" />
        <div className="attack-direction">进攻方向 <b>→</b></div>
        <div className="zone-label own">组织区</div>
        <div className="zone-label middle">推进区</div>
        <div className="zone-label final">终结区</div>

        {showVision && (
          <div className={`vision-cone ${selectedRole.group}`} style={visionStyle} aria-hidden="true"><span>主要视角</span></div>
        )}
        {showDefensiveZone && defensive && (
          <div className={`defensive-zone ${selectedRole.group}`} style={visionStyle} aria-hidden="true"><span>防守责任区</span></div>
        )}
        {showProgressRoute && possession && (
          <div className="progress-corridor" style={getProgressRouteStyle(frame, team.id, selectedSlotId, selectedRole)} aria-hidden="true">
            <i /><span>首选推进走廊</span>
          </div>
        )}

        {showOpponents && opponentFrame && Object.values(opponentFrame.nodes).map((node, index) => {
          const opponentRole = opponentTeam?.roles[node.roleId];
          return (
            <div key={`${opponentFrame.teamId}-${node.slotId}`} className="opponent-node" style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }} aria-hidden="true">
              <span>{opponentRole?.short ?? (index === 0 ? "GK" : index)}</span>
            </div>
          );
        })}

        {showLines && frame.annotations.map((annotation, index) => (
          <div key={`${frame.id}-${annotation.type}-${index}`} className={`tactical-line ${annotation.type}`} style={getAnnotationStyle(frame, annotation)} aria-hidden="true">
            <i className="tactical-stroke" /><span>{annotation.label}</span>
          </div>
        ))}

        <div className="focus-halo" style={{ left: `${frame.ball.x}%`, top: `${frame.ball.y}%` }} />
        <div className="ball" style={{ left: `${frame.ball.x}%`, top: `${frame.ball.y}%` }} aria-label="足球位置"><span /></div>

        {team.roleOrder.map((slotId) => {
          const node = teamFrame.nodes[slotId];
          if (!node) return null;
          const role = team.roles[node.roleId];
          const focused = isFocusedNode(frame, team.id, slotId);
          return (
            <button
              key={slotId}
              className={`player-node ${role.group} ${focused ? "focused" : ""} ${selectedSlotId === slotId ? "selected" : ""}`}
              style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
              onClick={() => onSelectSlot(slotId)}
              aria-label={`查看${role.label}的职责`}
              aria-pressed={selectedSlotId === slotId}
            >
              <span className="player-disc">{role.short}</span><span className="player-label">{role.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
