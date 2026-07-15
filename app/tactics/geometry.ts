import type { CSSProperties } from "react";
import type {
  Position,
  RoleDefinition,
  SlotId,
  TacticalAnchor,
  TacticalAnnotation,
  TacticalFrame,
  TacticalStage,
  TeamId,
} from "./types";

const PITCH_ASPECT_RATIO = 1.78;
const stableNumber = (value: number) => Math.round(value * 1000) / 1000;

export const isDefensiveStage = (stage: TacticalStage) => stage === "counterPress" || stage === "defend";
export const isPossessionStage = (stage: TacticalStage) => stage === "buildUp" || stage === "progression" || stage === "attack";

export const angleBetween = (from: Position, to: Position) => {
  const dx = to.x - from.x;
  const dy = (to.y - from.y) / PITCH_ASPECT_RATIO;
  return Math.atan2(dy, dx) * 180 / Math.PI;
};

export const getNodePosition = (frame: TacticalFrame, teamId: TeamId, slotId: SlotId) => {
  const node = frame.teams[teamId]?.nodes[slotId];
  if (!node) throw new Error(`Missing tactical node ${teamId}:${slotId} in frame ${frame.id}`);
  return node.position;
};

export const getAnchorPosition = (frame: TacticalFrame, anchor: TacticalAnchor) => {
  if (anchor.kind === "ball") return frame.ball;
  return getNodePosition(frame, anchor.teamId, anchor.slotId);
};

export const getVisionStyle = (
  frame: TacticalFrame,
  teamId: TeamId,
  slotId: SlotId,
  role: RoleDefinition,
) => {
  const position = getNodePosition(frame, teamId, slotId);
  let angle: number;
  if (isDefensiveStage(frame.stage)) {
    angle = angleBetween(position, frame.ball);
  } else {
    const ballDx = frame.ball.x - position.x;
    const ballDy = (frame.ball.y - position.y) / PITCH_ASPECT_RATIO;
    const distance = Math.sqrt(ballDx * ballDx + ballDy * ballDy) || 1;
    const scanBias = role.group === "中场" ? 1.15 : role.group === "后卫" || role.group === "门将" ? 1.35 : 1;
    angle = Math.atan2(ballDy / distance, ballDx / distance + scanBias) * 180 / Math.PI;
  }
  return {
    left: `${position.x}%`,
    top: `${position.y}%`,
    "--vision-angle": `${stableNumber(angle)}deg`,
    "--vision-counter-angle": `${stableNumber(-angle)}deg`,
  } as CSSProperties;
};

export const getProgressRouteStyle = (
  frame: TacticalFrame,
  teamId: TeamId,
  slotId: SlotId,
  role: RoleDefinition,
) => {
  const position = getNodePosition(frame, teamId, slotId);
  const advance = role.group === "门将" ? 15 : role.group === "后卫" ? 23 : role.group === "中场" ? 20 : 13;
  const target = {
    x: Math.min(95, position.x + advance),
    y: position.y + (50 - position.y) * (role.group === "前锋" ? 0.08 : 0.2),
  };
  const dx = target.x - position.x;
  const dy = (target.y - position.y) / PITCH_ASPECT_RATIO;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return {
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: `${stableNumber(Math.sqrt(dx * dx + dy * dy))}%`,
    "--route-angle": `${stableNumber(angle)}deg`,
    "--route-counter-angle": `${stableNumber(-angle)}deg`,
  } as CSSProperties;
};

export const getAnnotationStyle = (frame: TacticalFrame, annotation: TacticalAnnotation) => {
  const from = getAnchorPosition(frame, annotation.from);
  const to = getAnchorPosition(frame, annotation.to);
  const dx = to.x - from.x;
  const dy = (to.y - from.y) / PITCH_ASPECT_RATIO;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return {
    left: `${from.x}%`,
    top: `${from.y}%`,
    width: `${stableNumber(Math.sqrt(dx * dx + dy * dy))}%`,
    "--line-angle": `${stableNumber(angle)}deg`,
    "--line-counter-angle": `${stableNumber(-angle)}deg`,
    "--line-start": annotation.from.kind === "ball" ? "12px" : "clamp(17px, 2vw, 22px)",
    "--line-end": annotation.to.kind === "ball" ? "12px" : "clamp(17px, 2vw, 22px)",
  } as CSSProperties;
};

export const isFocusedNode = (frame: TacticalFrame, teamId: TeamId, slotId: SlotId) => (
  frame.focus.some((reference) => reference.teamId === teamId && reference.slotId === slotId)
);
