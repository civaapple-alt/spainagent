"use client";

import { useEffect, useState } from "react";
import { AnalysisPanel } from "./tactics/components/AnalysisPanel";
import { PhaseProgress } from "./tactics/components/PhaseProgress";
import { PitchStage } from "./tactics/components/PitchStage";
import { matchupCatalog, plannedResearchTeams, readyTeams, teamCatalog } from "./tactics/data/catalog";
import { spainTeam } from "./tactics/data/spain";
import type { NodeRef } from "./tactics/types";

export function TacticsLab() {
  const [viewMode, setViewMode] = useState<"team" | "matchup">("team");
  const [teamId, setTeamId] = useState("ESP");
  const matchup = matchupCatalog.find((entry) => entry.id === "esp-fra");
  const isMatchup = viewMode === "matchup" && matchup?.status === "ready" && Boolean(matchup.sequence);
  const selectedCatalogTeam = teamCatalog.find((entry) => entry.id === teamId)?.definition ?? spainTeam;
  const team = isMatchup ? teamCatalog.find((entry) => entry.id === matchup?.homeTeamId)?.definition ?? spainTeam : selectedCatalogTeam;
  const opponentTeam = isMatchup ? teamCatalog.find((entry) => entry.id === matchup?.awayTeamId)?.definition : undefined;
  const sequence = isMatchup ? matchup?.sequence ?? team.sequences[0] : team.sequences[0];
  const frames = sequence.frames;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [selectedNodeRef, setSelectedNodeRef] = useState<NodeRef>({ kind: "node", teamId: "ESP", slotId: "dm" });
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showOpponents, setShowOpponents] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [showVision, setShowVision] = useState(true);
  const [showDefensiveZone, setShowDefensiveZone] = useState(true);
  const [showProgressRoute, setShowProgressRoute] = useState(true);
  const frame = frames[phaseIndex];
  const selectedTeam = selectedNodeRef.teamId === opponentTeam?.id ? opponentTeam : team;
  const selectedTeamFrame = frame.teams[selectedTeam.id] ?? frame.teams[team.id];
  const selectedNode = selectedTeamFrame.nodes[selectedNodeRef.slotId] ?? selectedTeamFrame.nodes[selectedTeam.roleOrder[0]];
  const activeNodeRef: NodeRef = { kind: "node", teamId: selectedTeam.id, slotId: selectedNode.slotId };
  const selectedRole = selectedTeam.roles[selectedNode.roleId];
  const phaseDuration = 5600 / speed;
  const principles = isMatchup ? [
    { title: "中场连接决定上限", description: "西班牙持续给后腰和两名中场提供第三人出口；法国前腰与中锋的直接连接被切断，前场四人因此变成彼此孤立的单点。" },
    { title: "右侧三角制造决定性优势", description: "边锋固定宽度、前腰进入肋部、右后卫延迟套上，让法国左路反复面对内外两条路线，两个进球都从这一侧的互动产生。" },
    { title: "无球强度保护控球", description: "西班牙的优势不只来自传球。丢球后的近端围堵、后腰封口和中卫前顶，让法国最擅长的纵深转换无法连续启动。" },
  ] : team.principles;

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
    setViewMode("team");
    setTeamId(nextTeamId);
    setPhaseIndex(0);
    setSelectedNodeRef({ kind: "node", teamId: nextTeam.id, slotId: nextTeam.roles.dm ? "dm" : nextTeam.roleOrder[0] });
    setPlaying(false);
  };

  const showMatchup = () => {
    if (!matchup?.sequence) return;
    setViewMode("matchup");
    setPhaseIndex(0);
    setSelectedNodeRef({ kind: "node", teamId: matchup.homeTeamId, slotId: "dm" });
    setPlaying(false);
    setShowOpponents(true);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="国家队战术板首页">
          <span className="brand-mark">T</span>
          <span><strong>TACTICA</strong><small>国家队战术板</small></span>
        </a>
        <nav className="main-nav" aria-label="主导航">
          <button className={isMatchup ? "nav-item" : "nav-item active"} onClick={() => changeTeam(teamId)}>战术演示</button>
          <button className={isMatchup ? "nav-item active" : "nav-item"} onClick={showMatchup}>西法对抗 <span>2–0</span></button>
          <button className="nav-item" onClick={() => document.getElementById("team-switcher")?.scrollIntoView({ behavior: "smooth" })}>世界杯球队 <span>{readyTeams.length} 已完成</span></button>
          <button className="nav-item" disabled>阵型资料库 <span>后续</span></button>
        </nav>
        <div className="edition"><i /> 2026 世界杯 · 阶段一</div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">{isMatchup ? "SPAIN × FRANCE · MATCHUP LAB" : `${team.nameEn} · ${team.styleLabel}`}</p>
          <h1>{isMatchup ? <>两种体系，<em>如何彼此拆解。</em></> : <>看见阵型，<em>如何真正移动。</em></>}</h1>
          <p className="hero-description">{isMatchup ? matchup?.summary : "从位置职责出发，拆解球队在持球、转换与防守中的整体移动。这里没有球星卡，只有教练想让每个位置完成的任务。"}</p>
        </div>
        <div className="team-controls" id="team-switcher">
          {isMatchup && opponentTeam ? (
            <div className="matchup-card">
              <div><span className="flag" style={{ background: team.flagBackground }} aria-hidden="true" /><small>{team.code}</small><strong>{team.name}</strong></div>
              <b>{matchup?.score?.home}<i>:</i>{matchup?.score?.away}</b>
              <div><span className="flag" style={{ background: opponentTeam.flagBackground }} aria-hidden="true" /><small>{opponentTeam.code}</small><strong>{opponentTeam.name}</strong></div>
              <p>{matchup?.competition}</p>
            </div>
          ) : (
            <div className="team-card">
              <div className="flag" style={{ background: team.flagBackground }} aria-hidden="true"><span /></div>
              <div><small>当前球队</small><strong>{team.name}</strong></div>
              <div className="team-meta"><span>{team.code}</span><span>{team.baseFormation}</span></div>
            </div>
          )}
          <div className="team-switcher" aria-label="切换已完成研究的球队">
            {readyTeams.map((entry) => (
              <button key={entry.id} className={entry.id === team.id ? "active" : ""} onClick={() => changeTeam(entry.id)} aria-pressed={entry.id === team.id}>
                {entry.code} · {entry.name}
              </button>
            ))}
            <button className={isMatchup ? "active matchup-entry" : "matchup-entry"} onClick={showMatchup} aria-pressed={isMatchup}>ESP × FRA · 对抗</button>
          </div>
        </div>
      </section>

      {isMatchup && (
        <nav className="matchup-stage-map" aria-label="统一的五阶段观察顺序">
          <span><small>与单队页保持一致</small><strong>统一观察顺序</strong></span>
          {frames.map((item, index) => (
            <button key={item.id} className={index === phaseIndex ? "active" : ""} onClick={() => changePhase(index)}>
              <i>{item.short}</i>{item.title}
            </button>
          ))}
        </nav>
      )}

      <section className="workspace" aria-label={isMatchup ? "西班牙与法国动态对抗演示" : `${team.name}动态战术演示`}>
        <div className="board-column">
          <PitchStage
            team={team}
            opponentTeam={opponentTeam}
            frames={frames}
            frame={frame}
            phaseIndex={phaseIndex}
            selectedNodeRef={activeNodeRef}
            playing={playing}
            speed={speed}
            phaseDuration={phaseDuration}
            showOpponents={showOpponents}
            showLines={showLines}
            showVision={showVision}
            showDefensiveZone={showDefensiveZone}
            showProgressRoute={showProgressRoute}
            onPhaseChange={changePhase}
            onSelectNode={setSelectedNodeRef}
            onTogglePlaying={() => setPlaying((value) => !value)}
            onCycleSpeed={() => setSpeed((value) => value === 1 ? 1.5 : value === 1.5 ? 0.75 : 1)}
            onToggleOpponents={() => setShowOpponents((value) => !value)}
            onToggleLines={() => setShowLines((value) => !value)}
            onToggleVision={() => setShowVision((value) => !value)}
            onToggleDefensiveZone={() => setShowDefensiveZone((value) => !value)}
            onToggleProgressRoute={() => setShowProgressRoute((value) => !value)}
          />
          <PhaseProgress frames={frames} frame={frame} phaseIndex={phaseIndex} onPhaseChange={changePhase} onSelectNode={isMatchup ? setSelectedNodeRef : undefined} />
        </div>

        <AnalysisPanel team={selectedTeam} frame={frame} phaseIndex={phaseIndex} role={selectedRole} roleFunction={selectedNode.function} />
      </section>

      {isMatchup && (
        <section className="matchup-evidence" aria-label="西班牙法国对抗证据">
          <div><small>最终比分</small><strong>ESP 2–0 FRA</strong><span>右侧压迫制造点球 · 右后卫撞墙得分</span></div>
          <div><small>法国全场预期进球</small><strong>0.30 xG</strong><span>前场核心连接被系统性切断</span></div>
          <div><small>西班牙对抗成功率</small><strong>55.9%</strong><span>22次铲抢，成功14次</span></div>
          <div className="evidence-sources"><small>校准来源</small>{matchup?.sources?.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.label} ↗</a>)}</div>
        </section>
      )}

      {!isMatchup && team.research && (
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
          <span>{isMatchup ? "西班牙 × 法国 · 对抗结论" : `${team.name} · 战术原则`}</span>
          <h2>{isMatchup ? <>胜负不只在球权，<br />更在连接质量。</> : <>阵型是起点，<br />职责决定变化。</>}</h2>
        </div>
        {principles.map((principle, index) => (
          <article key={principle.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{principle.title}</h3><p>{principle.description}</p>
          </article>
        ))}
      </section>

      <footer>
        <div><strong>TACTICA</strong><span>可扩展战术引擎 · 当前 {isMatchup ? "西班牙 × 法国对抗" : team.name}</span></div>
        <p>已完成：{readyTeams.map((item) => item.name).join(" · ")} · 待研究：{plannedResearchTeams.map((item) => item.name).join(" · ")} · 西法对抗已接入</p>
      </footer>
    </main>
  );
}
