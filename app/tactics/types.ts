export type TeamId = string;
export type SlotId = string;
export type RoleGroup = "门将" | "后卫" | "中场" | "前锋";
export type TacticalStage = "buildUp" | "progression" | "attack" | "counterPress" | "defend";
export type AnnotationType = "pass" | "run" | "press" | "cover";

export type Position = { x: number; y: number };

export type NodeRef = {
  kind: "node";
  teamId: TeamId;
  slotId: SlotId;
};

export type TacticalAnchor = NodeRef | { kind: "ball" };

export type TacticalAnnotation = {
  from: TacticalAnchor;
  to: TacticalAnchor;
  type: AnnotationType;
  label: string;
};

export type RoleDefinition = {
  id: string;
  label: string;
  short: string;
  group: RoleGroup;
  headline: string;
  abilities: string[];
  responsibility: string;
  connections: string;
};

export type TacticalNodeState = {
  slotId: SlotId;
  roleId: string;
  position: Position;
};

export type TeamFrame = {
  teamId: TeamId;
  shape: string;
  nodes: Record<SlotId, TacticalNodeState>;
};

export type TacticalMetrics = {
  widthMeters: number;
  lengthMeters: number;
  protection: string;
};

export type SourceMetadata = {
  kind: "coach-model" | "match-event" | "tracking";
  label: string;
  matchId?: string;
  capturedAt?: string;
  confidence?: "low" | "medium" | "high";
};

export type TacticalFrame = {
  id: string;
  short: string;
  title: string;
  eyebrow: string;
  stage: TacticalStage;
  description: string;
  instruction: string;
  possessionTeamId: TeamId;
  opponentTeamId: TeamId;
  ball: Position;
  focus: NodeRef[];
  metrics: TacticalMetrics;
  annotations: TacticalAnnotation[];
  teams: Record<TeamId, TeamFrame>;
  source: SourceMetadata;
};

export type TacticalSequence = {
  id: string;
  title: string;
  description: string;
  frames: TacticalFrame[];
};

export type FormationDefinition = {
  label: string;
  detail: string;
  active?: boolean;
};

export type TacticalPrinciple = {
  title: string;
  description: string;
};

export type TeamDefinition = {
  id: TeamId;
  slug: string;
  name: string;
  nameEn: string;
  code: string;
  baseFormation: string;
  styleLabel: string;
  flagBackground: string;
  roleOrder: SlotId[];
  roles: Record<string, RoleDefinition>;
  formations: FormationDefinition[];
  principles: TacticalPrinciple[];
  sequences: TacticalSequence[];
};

export type TeamCatalogEntry = {
  id: TeamId;
  slug: string;
  name: string;
  nameEn: string;
  code: string;
  status: "ready" | "research-planned" | "researching";
  definition?: TeamDefinition;
};

export type MatchupCatalogEntry = {
  id: string;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  status: "planned" | "researching" | "ready";
  sequence?: TacticalSequence;
};
