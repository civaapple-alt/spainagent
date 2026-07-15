"use client";

import { useEffect, useState } from "react";
import { AnalysisPanel } from "./tactics/components/AnalysisPanel";
import { PhaseProgress } from "./tactics/components/PhaseProgress";
import { PitchStage } from "./tactics/components/PitchStage";
import { plannedResearchTeams, readyTeams, teamCatalog } from "./tactics/data/catalog";
import { spainTeam } from "./tactics/data/spain";
import type { SlotId } from "./tactics/types";

export function TacticsLab() {
  const [teamId, setTeamId] = useState("ESP");
  const team = teamCatalog.find((entry) => entry.id === teamId)?.definition ?? spainTeam;
  const sequence = team.sequences[0];
  const frames = sequence.frames;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<SlotId>("dm");
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showOpponents, setShowOpponents] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [showVision, setShowVision] = useState(true);
  const [showDefensiveZone, setShowDefensiveZone] = useState(true);
  const [showProgressRoute, setShowProgressRoute] = useState(true);
  const frame = frames[phaseIndex];
  const teamFrame = frame.teams[team.id];
  const selectedNode = teamFrame.nodes[selectedSlotId] ?? teamFrame.nodes[team.roleOrder[0]];
  const activeSlotId = selectedNode.slotId;
  const selectedRole = team.roles[selectedNode.roleId];
  const phaseDuration = 5600 / speed;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setPhaseIndex((current) => (current + 1) % frames.length),
      phaseDuration,
    );
    return () => window.clearInterval(timer);
  }, [playing, phaseDuration, frames.length]);

  const changePhase = (index: number) => {
    setPhaseIndex(index);
    setPlaying(false);
  };

  const changeTeam = (nextTeamId: string) => {
    const nextTeam = teamCatalog.find((entry) => entry.id === nextTeamId)?.definition;
    if (!nextTeam) return;
    setTeamId(nextTeamId);
    setPhaseIndex(0);
    setSelectedSlotId(nextTeam.roles.dm ? "dm" : nextTeam.roleOrder[0]);
    setPlaying(false);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="国家队战术板首页">
          <span className="brand-mark">T</span>
          <span><strong>TACTICA</strong><small>国家队战术板</small></span>
        </a>
        <nav className="main-nav" aria-label="主导航">
          <button className="nav-item active">战术演示</button>
          <button className="nav-item" onClick={() => document.getElementById("team-switcher")?.scrollIntoView({ behavior: "smooth" })}>世界杯球队 <span>{readyTeams.length} 已完成</span></button>
          <button className="nav-item" disabled>阵型资料库 <span>后续</span></button>
        </nav>
        <div className="edition"><i /> 2026 世界杯 · 阶段一</div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">{team.nameEn} · {team.styleLabel}</p>
          <h1>看见阵型，<em>如何真正移动。</em></h1>
          <p className="hero-description">从位置职责出发，拆解球队在持球、转换与防守中的整体移动。这里没有球星卡，只有教练想让每个位置完成的任务。</p>
        </div>
        <div className="team-controls" id="team-switcher">
          <div className="team-card">
            <div className="flag" style={{ background: team.flagBackground }} aria-hidden="true"><span /></div>
            <div><small>当前球队</small><strong>{team.name}</strong></div>
            <div className="team-meta"><span>{team.code}</span><span>{team.baseFormation}</span></div>
          </div>
          <div className="team-switcher" aria-label="切换已完成研究的球队">
            {readyTeams.map((entry) => (
              <button key={entry.id} className={entry.id === team.id ? "active" : ""} onClick={() => changeTeam(entry.id)} aria-pressed={entry.id === team.id}>
                {entry.code} · {entry.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="workspace" aria-label={`${team.name}动态战术演示`}>
        <div className="board-column">
          <PitchStage
            team={team}
            frames={frames}
            frame={frame}
            phaseIndex={phaseIndex}
            selectedSlotId={activeSlotId}
            playing={playing}
            speed={speed}
            phaseDuration={phaseDuration}
            showOpponents={showOpponents}
            showLines={showLines}
            showVision={showVision}
            showDefensiveZone={showDefensiveZone}
            showProgressRoute={showProgressRoute}
            onPhaseChange={changePhase}
            onSelectSlot={setSelectedSlotId}
            onTogglePlaying={() => setPlaying((value) => !value)}
            onCycleSpeed={() => setSpeed((value) => value === 1 ? 1.5 : value === 1.5 ? 0.75 : 1)}
            onToggleOpponents={() => setShowOpponents((value) => !value)}
            onToggleLines={() => setShowLines((value) => !value)}
            onToggleVision={() => setShowVision((value) => !value)}
            onToggleDefensiveZone={() => setShowDefensiveZone((value) => !value)}
            onToggleProgressRoute={() => setShowProgressRoute((value) => !value)}
          />
          <PhaseProgress frames={frames} frame={frame} phaseIndex={phaseIndex} onPhaseChange={changePhase} />
        </div>

        <AnalysisPanel team={team} frame={frame} phaseIndex={phaseIndex} role={selectedRole} roleFunction={selectedNode.function} />
      </section>

      {team.research && (
        <section className="research-summary" aria-label={`${team.name}研究样本`}>
          <div className="research-heading">
            <small>RESEARCH BASELINE · {team.research.asOf}</small>
            <h2>{team.research.tournament} · {team.research.matchSamples.length}场样本</h2>
            <p>{team.research.scope}。{team.research.methodology}</p>
          </div>
          <div className="research-matches">
            {team.research.matchSamples.map((sample) => (
              <a key={`${sample.date}-${sample.opponent}`} href={sample.sourceUrl} target="_blank" rel="noreferrer">
                <small>{sample.stage}</small><strong>{sample.opponent} <b>{sample.score}</b></strong><span>{sample.observedFormation}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="principles">
        <div className="section-lead">
          <span>{team.name} · 战术原则</span>
          <h2>阵型是起点，<br />职责决定变化。</h2>
        </div>
        {team.principles.map((principle, index) => (
          <article key={principle.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{principle.title}</h3><p>{principle.description}</p>
          </article>
        ))}
      </section>

      <footer>
        <div><strong>TACTICA</strong><span>可扩展战术引擎 · 当前 {team.name}</span></div>
        <p>已完成：{readyTeams.map((item) => item.name).join(" · ")} · 待研究：{plannedResearchTeams.map((item) => item.name).join(" · ")} · 对抗模拟下一阶段</p>
      </footer>
    </main>
  );
}
