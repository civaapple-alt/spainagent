export type TeamId = string;
export type SlotId = string;
export type RoleGroup = "门将" | "后卫" | "中场" | "前锋";
export type PositionFamily =
  | "goalkeeper"
  | "centerBack"
  | "fullback"
  | "wingback"
  | "holdingMidfielder"
  | "centralMidfielder"
  | "attackingMidfielder"
  | "winger"
  | "secondStriker"
  | "striker";
export type RoleArchetype =
  | "sweeperKeeper"
  | "buildUpGoalkeeper"
  | "ballPlayingCenterBack"
  | "coveringCenterBack"
  | "aggressiveCenterBack"
  | "wideCenterBack"
  | "overlappingFullback"
  | "underlappingFullback"
  | "invertedFullback"
  | "supportingFullback"
  | "anchor"
  | "deepLyingPlaymaker"
  | "ballCarryingEight"
  | "boxToBoxMidfielder"
  | "mezzala"
  | "advancedPlaymaker"
  | "pressingTen"
  | "wideMidfielder"
  | "touchlineWinger"
  | "invertedWinger"
  | "insideForward"
  | "falseNine"
  | "targetForward"
  | "pressingForward"
  | "poacher"
  | "secondStriker";
export type TacticalDuty = "build" | "defend" | "cover" | "support" | "attack" | "press";
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
  positionFamily: PositionFamily;
  defaultArchetypes: RoleArchetype[];
  headline: string;
  capabilities: RoleCapability[];
  responsibility: string;
  connections: string;
};

export type RoleCapability = {
  id: string;
  label: string;
  level: 1 | 2 | 3 | 4 | 5;
};

export type TacticalFunction = {
  label: string;
  duty: TacticalDuty;
  archetypes: RoleArchetype[];
  behaviors: string[];
  emphasizedCapabilities: string[];
};

export type TacticalNodeState = {
  slotId: SlotId;
  roleId: string;
  position: Position;
  function?: TacticalFunction;
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

export type TacticalWatchTarget = NodeRef & {
  label: string;
};

export type PhaseViewingGuide = {
  question: string;
  watchTargets: TacticalWatchTarget[];
  homeGoal: string;
  awayGoal: string;
  successSignal: string;
  evidence?: string;
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
  attackDirections?: Record<TeamId, 1 | -1>;
  viewingGuide?: PhaseViewingGuide;
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

export type ResearchMatchSample = {
  date: string;
  stage: string;
  opponent: string;
  score: string;
  observedFormation: string;
  evidence: string[];
  sourceUrl: string;
};

export type TeamResearch = {
  tournament: string;
  coach: string;
  asOf: string;
  scope: string;
  methodology: string;
  squadSourceUrl: string;
  matchSamples: ResearchMatchSample[];
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
  research?: TeamResearch;
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
  title?: string;
  competition?: string;
  playedAt?: string;
  score?: { home: number; away: number };
  summary?: string;
  sources?: { label: string; url: string }[];
  sequence?: TacticalSequence;
};
