import { positionFamilyLabels, roleArchetypeLabels, tacticalDutyLabels } from "../taxonomy";
import type { RoleDefinition, TacticalFrame, TacticalFunction, TeamDefinition } from "../types";

type AnalysisPanelProps = {
  team: TeamDefinition;
  frame: TacticalFrame;
  phaseIndex: number;
  role: RoleDefinition;
  roleFunction?: TacticalFunction;
};

export function AnalysisPanel({ team, frame, phaseIndex, role, roleFunction }: AnalysisPanelProps) {
  const teamFrame = frame.teams[team.id];
  const identityLabel = roleFunction?.label ?? role.defaultArchetypes.map((item) => roleArchetypeLabels[item]).join(" · ");
  return (
    <aside className="analysis-panel">
      <div className="panel-heading"><span>COACH&apos;S BOARD</span><strong>教练战术安排</strong></div>
      <div className="shape-card">
        <div><small>基础阵型</small><strong>{team.baseFormation}</strong></div>
        <span className="shape-arrow">→</span>
        <div><small>当前形态</small><strong>{teamFrame.shape}</strong></div>
      </div>
      <div className="coach-note">
        <span className="note-index">0{phaseIndex + 1}</span>
        <div><small>本阶段核心指令</small><strong>{frame.instruction}</strong></div>
      </div>
      <div className="role-card">
        <div className="role-heading">
          <span className={`role-badge ${role.group}`}>{role.short}</span>
          <div><small>{role.group} · {positionFamilyLabels[role.positionFamily]}</small><h2>{role.label}</h2></div>
        </div>
        <div className="phase-role-profile">
          <small>{roleFunction ? `当前阶段身份 · ${tacticalDutyLabels[roleFunction.duty]}` : "默认角色原型"}</small>
          <strong>{identityLabel}</strong>
          {roleFunction && <p>{roleFunction.behaviors.join(" · ")}</p>}
        </div>
        <h3>{role.headline}</h3>
        <p>{role.responsibility}</p>
        <div className="ability-list">
          {role.capabilities.map((capability) => (
            <span key={capability.id} className={roleFunction?.emphasizedCapabilities.includes(capability.id) ? "emphasized" : ""}>
              {capability.label}<b>{capability.level}/5</b>
            </span>
          ))}
        </div>
        <div className="connection-note"><i /> <span><small>协作关系</small>{role.connections}</span></div>
      </div>
      <div className="formation-family">
        <div className="section-title"><span>阵型分类</span><small>FORMATION FAMILY</small></div>
        <div className="formation-grid">
          {team.formations.map((formation) => (
            <div key={formation.label} className={formation.active ? "formation-chip active" : "formation-chip"}>
              <strong>{formation.label}</strong><span>{formation.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
