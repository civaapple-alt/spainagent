import type { PositionFamily, RoleArchetype, TacticalDuty } from "./types";

export const positionFamilyLabels: Record<PositionFamily, string> = {
  goalkeeper: "门将",
  centerBack: "中卫",
  fullback: "边后卫",
  wingback: "翼卫",
  holdingMidfielder: "防守型中场",
  centralMidfielder: "中前卫",
  attackingMidfielder: "攻击型中场",
  winger: "边锋",
  secondStriker: "影锋",
  striker: "中锋",
};

export const roleArchetypeLabels: Record<RoleArchetype, string> = {
  sweeperKeeper: "清道夫门将",
  buildUpGoalkeeper: "出球门将",
  ballPlayingCenterBack: "出球中卫",
  coveringCenterBack: "保护型中卫",
  aggressiveCenterBack: "前顶中卫",
  wideCenterBack: "边中卫",
  overlappingFullback: "套边后卫",
  underlappingFullback: "内插后卫",
  invertedFullback: "内收边后卫",
  supportingFullback: "支援型边后卫",
  anchor: "单后腰锚点",
  deepLyingPlaymaker: "拖后组织者",
  ballCarryingEight: "持球推进型八号",
  boxToBoxMidfielder: "全能中场",
  mezzala: "肋部中场",
  advancedPlaymaker: "前场组织者",
  pressingTen: "压迫型十号",
  wideMidfielder: "边前卫",
  touchlineWinger: "边线型边锋",
  invertedWinger: "逆足边锋",
  insideForward: "内锋",
  falseNine: "伪九号",
  targetForward: "支点中锋",
  pressingForward: "压迫型中锋",
  poacher: "抢点前锋",
  secondStriker: "影锋",
};

export const tacticalDutyLabels: Record<TacticalDuty, string> = {
  build: "组织",
  defend: "防守",
  cover: "保护",
  support: "支援",
  attack: "进攻",
  press: "压迫",
};
