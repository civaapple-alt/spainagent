"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAnnotationStyle,
  getProgressRouteStyle,
  getVisionStyle,
  isFocusedNode,
} from "../geometry";
import type { NodeRef, TacticalFrame, TeamDefinition } from "../types";

type PitchStageProps = {
  team: TeamDefinition;
  opponentTeam?: TeamDefinition;
  frames: TacticalFrame[];
  frame: TacticalFrame;
  phaseIndex: number;
  selectedNodeRef: NodeRef;
  playing: boolean;
  speed: number;
  phaseDuration: number;
  showOpponents: boolean;
  showLines: boolean;
  showVision: boolean;
  showDefensiveZone: boolean;
  showProgressRoute: boolean;
  onPhaseChange: (index: number) => void;
  onSelectNode: (node: NodeRef) => void;
  onTogglePlaying: () => void;
  onCycleSpeed: () => void;
  onToggleOpponents: () => void;
  onToggleLines: () => void;
  onToggleVision: () => void;
  onToggleDefensiveZone: () => void;
  onToggleProgressRoute: () => void;
};

export function PitchStage({
  team, opponentTeam, frames, frame, phaseIndex, selectedNodeRef, playing, speed, phaseDuration,
  showOpponents, showLines, showVision, showDefensiveZone, showProgressRoute,
  onPhaseChange, onSelectNode, onTogglePlaying, onCycleSpeed, onToggleOpponents, onToggleLines,
  onToggleVision, onToggleDefensiveZone, onToggleProgressRoute,
}: PitchStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const teamFrame = frame.teams[team.id];
  const opponentFrame = frame.teams[opponentTeam?.id ?? frame.opponentTeamId];
  const selectedTeam = selectedNodeRef.teamId === opponentTeam?.id ? opponentTeam : team;
  const selectedTeamFrame = frame.teams[selectedTeam.id] ?? teamFrame;
  const selectedNode = selectedTeamFrame.nodes[selectedNodeRef.slotId] ?? selectedTeamFrame.nodes[selectedTeam.roleOrder[0]];
  const activeNodeRef: NodeRef = { kind: "node", teamId: selectedTeam.id, slotId: selectedNode.slotId };
  const selectedRole = selectedTeam.roles[selectedNode.roleId];
  const selectedHasPossession = frame.possessionTeamId === selectedTeam.id;
  const defensive = !selectedHasPossession;
  const possession = selectedHasPossession;
  const visionStyle = getVisionStyle(frame, selectedTeam.id, selectedNode.slotId, selectedRole, defensive);

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
    <div className={`pitch-stage ${opponentTeam ? "matchup-mode" : ""}`} ref={stageRef}>
      <div className="board-toolbar">
        {opponentTeam && <span className="phase-order-note">与单队页同序</span>}
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

      {frame.viewingGuide && (
        <div className="matchup-observation" aria-label="当前阶段观察重点">
          <div className="observation-question">
            <small>先看这个问题</small>
            <strong>{frame.viewingGuide.question}</strong>
          </div>
          <div className="observation-targets">
            <small>按顺序查看关键位置</small>
            <div>
              {frame.viewingGuide.watchTargets.map((target, index) => (
                <button key={`${target.teamId}-${target.slotId}`} onClick={() => onSelectNode(target)}>
                  <i>{index + 1}</i>{target.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
          <span>{selectedTeam.code} 指导模型 · {selectedNode.function?.label ?? selectedRole.label}</span>
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
        <div className="attack-direction">{opponentTeam ? <><b>{team.code} →</b> · <b>← {opponentTeam.code}</b></> : <>进攻方向 <b>→</b></>}</div>
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
          <div className="progress-corridor" style={getProgressRouteStyle(frame, selectedTeam.id, selectedNode.slotId, selectedRole)} aria-hidden="true">
            <i /><span>首选推进走廊</span>
          </div>
        )}

        {showOpponents && opponentFrame && (opponentTeam ? opponentTeam.roleOrder.map((slotId) => {
          const node = opponentFrame.nodes[slotId];
          if (!node) return null;
          const role = opponentTeam.roles[node.roleId];
          const focused = isFocusedNode(frame, opponentTeam.id, slotId);
          const selected = activeNodeRef.teamId === opponentTeam.id && activeNodeRef.slotId === slotId;
          return (
            <button
              key={`${opponentTeam.id}-${slotId}`}
              className={`player-node away ${role.group} ${focused ? "focused" : ""} ${selected ? "selected" : ""}`}
              style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
              onClick={() => onSelectNode({ kind: "node", teamId: opponentTeam.id, slotId })}
              aria-label={`查看${opponentTeam.name}${role.label}的职责`}
              aria-pressed={selected}
            >
              <span className="player-disc">{role.short}</span><span className="player-label">{opponentTeam.code} · {role.label}</span>
            </button>
          );
        }) : Object.values(opponentFrame.nodes).map((node, index) => (
          <div key={`${opponentFrame.teamId}-${node.slotId}`} className="opponent-node" style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }} aria-hidden="true">
            <span>{index === 0 ? "GK" : index}</span>
          </div>
        )))}

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
              className={`player-node home ${role.group} ${focused ? "focused" : ""} ${activeNodeRef.teamId === team.id && activeNodeRef.slotId === slotId ? "selected" : ""}`}
              style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
              onClick={() => onSelectNode({ kind: "node", teamId: team.id, slotId })}
              aria-label={`查看${team.name}${role.label}的职责`}
              aria-pressed={activeNodeRef.teamId === team.id && activeNodeRef.slotId === slotId}
            >
              <span className="player-disc">{role.short}</span><span className="player-label">{opponentTeam ? `${team.code} · ` : ""}{role.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
