import type {
  NodeRef,
  Position,
  TacticalAnchor,
  TacticalAnnotation,
  TacticalFunction,
  TacticalSequence,
  TeamDefinition,
  TeamFrame,
  TeamId,
} from "../../types";
import { FRANCE_ID, franceTeam } from "../france";
import { SPAIN_ID, spainTeam } from "../spain";

const ref = (teamId: TeamId, slotId: string): NodeRef => ({ kind: "node", teamId, slotId });
const ball: TacticalAnchor = { kind: "ball" };
const line = (from: TacticalAnchor, to: TacticalAnchor, type: TacticalAnnotation["type"], label: string): TacticalAnnotation => ({ from, to, type, label });
const focus = (...nodes: NodeRef[]) => nodes;
const fn = (
  label: string,
  duty: TacticalFunction["duty"],
  archetypes: TacticalFunction["archetypes"],
  behaviors: string[],
  emphasizedCapabilities: string[],
): TacticalFunction => ({ label, duty, archetypes, behaviors, emphasizedCapabilities });

const sourceFunction = (team: TeamDefinition, phaseId: string, slotId: string) => (
  team.sequences[0].frames.find((frame) => frame.id === phaseId)?.teams[team.id]?.nodes[slotId]?.function
);

const matchupTeamFrame = (
  team: TeamDefinition,
  phaseId: string,
  shape: string,
  positions: Record<string, Position>,
  overrides: Record<string, TacticalFunction> = {},
): TeamFrame => ({
  teamId: team.id,
  shape,
  nodes: Object.fromEntries(Object.entries(positions).map(([slotId, position]) => [
    slotId,
    { slotId, roleId: slotId, position, function: overrides[slotId] ?? sourceFunction(team, phaseId, slotId) },
  ])),
});

const source = {
  kind: "coach-model" as const,
  label: "2026世界杯半决赛事件、比赛报告与Opta统计校准的人工对抗模型",
  matchId: "FWC26-SF-FRA-ESP",
  capturedAt: "2026-07-14",
  confidence: "medium" as const,
};

const directions = { [SPAIN_ID]: 1 as const, [FRANCE_ID]: -1 as const };

export const spainFranceSequence: TacticalSequence = {
  id: "spain-france-world-cup-semi-final",
  title: "西班牙 × 法国：控制如何压制纵深",
  description: "以西班牙2比0法国的世界杯半决赛为校准样本，展示两种体系在五个关键战术时刻的相互作用。",
  frames: [
    {
      id: "duel-build", short: "01", title: "出球诱压", eyebrow: "西班牙持球 · 法国4-4-2", stage: "buildUp",
      description: "法国以前腰和中锋组成第一线，试图封锁西班牙后腰。西班牙让后腰在两名前锋身后横移，两名中场保持不同高度，以三角形持续制造第三人出口。",
      instruction: "西班牙：吸引双前锋后穿线；法国：不让后腰正面转身",
      possessionTeamId: SPAIN_ID, opponentTeamId: FRANCE_ID, ball: { x: 27, y: 42 },
      focus: focus(ref(SPAIN_ID, "lcb"), ref(SPAIN_ID, "dm"), ref(SPAIN_ID, "lcm"), ref(FRANCE_ID, "am"), ref(FRANCE_ID, "st")),
      metrics: { widthMeters: 70, lengthMeters: 47, protection: "ESP 3+2 / FRA 4+4" },
      annotations: [
        line(ref(SPAIN_ID, "lcb"), ref(SPAIN_ID, "dm"), "pass", "双前锋身后的第三人"),
        line(ref(FRANCE_ID, "st"), ref(SPAIN_ID, "dm"), "press", "弧线封锁后腰"),
        line(ref(SPAIN_ID, "dm"), ref(SPAIN_ID, "am"), "pass", "找到两线之间"),
      ],
      teams: {
        [SPAIN_ID]: matchupTeamFrame(spainTeam, "build", "3-2 出球", { gk:{x:8,y:50},lb:{x:30,y:18},lcb:{x:25,y:40},rcb:{x:25,y:63},rb:{x:38,y:85},dm:{x:40,y:50},lcm:{x:48,y:30},am:{x:52,y:66},lw:{x:58,y:10},st:{x:60,y:48},rw:{x:58,y:90} }, {
          dm: fn("法国双前锋身后的自由后腰", "build", ["deepLyingPlaymaker"], ["在两名前锋之间横向露出", "接球前确认前腰位置"], ["pressResistance", "scanning", "lineBreakPass"]),
        }),
        [FRANCE_ID]: matchupTeamFrame(franceTeam, "defend", "4-4-2 中位封锁", { gk:{x:94,y:50},lb:{x:83,y:83},lcb:{x:82,y:61},rcb:{x:82,y:39},rb:{x:83,y:17},dm:{x:69,y:43},cm:{x:69,y:62},am:{x:67,y:58},lw:{x:69,y:82},st:{x:67,y:42},rw:{x:69,y:18} }, {
          am: fn("与中锋并列的封锁者", "press", ["pressingTen", "secondStriker"], ["盯住西班牙后腰正面", "不被中卫带球轻易吸走"], ["pressing"]),
          st: fn("弧线压迫的第一人", "press", ["pressingForward"], ["从中卫外侧向内压迫", "用跑动遮挡后腰"], ["pressing", "dragCenterBack"]),
        }),
      }, attackDirections: directions, source,
    },
    {
      id: "duel-right", short: "02", title: "右侧强攻", eyebrow: "西班牙进攻 · 法国左路承压", stage: "attack",
      description: "西班牙把右边锋固定在边线，前腰进入右肋，右后卫选择延迟套上。法国左后卫同时面对内切、撞墙和套边，左边锋若不回收就会形成持续二打一。",
      instruction: "西班牙：边锋固定、前腰接应、边后卫最后启动；法国：边锋必须回到球侧",
      possessionTeamId: SPAIN_ID, opponentTeamId: FRANCE_ID, ball: { x: 76, y: 86 },
      focus: focus(ref(SPAIN_ID, "rw"), ref(SPAIN_ID, "am"), ref(SPAIN_ID, "rb"), ref(FRANCE_ID, "lb"), ref(FRANCE_ID, "lw")),
      metrics: { widthMeters: 76, lengthMeters: 39, protection: "ESP 3+2 / FRA 左侧2v3" },
      annotations: [
        line(ref(SPAIN_ID, "rw"), ref(SPAIN_ID, "am"), "pass", "内切后的回做点"),
        line(ref(SPAIN_ID, "rb"), ball, "run", "延迟套边制造二打一"),
        line(ref(FRANCE_ID, "lw"), ref(FRANCE_ID, "lb"), "cover", "必须回收协防"),
      ],
      teams: {
        [SPAIN_ID]: matchupTeamFrame(spainTeam, "attack", "3-2-5 右侧三角", { gk:{x:17,y:50},lb:{x:40,y:18},lcb:{x:40,y:41},rcb:{x:41,y:63},rb:{x:70,y:78},dm:{x:56,y:48},lcm:{x:72,y:30},am:{x:77,y:68},lw:{x:80,y:9},st:{x:83,y:49},rw:{x:79,y:91} }, {
          rw: fn("固定法国左后卫的一对一爆点", "attack", ["touchlineWinger", "invertedWinger"], ["先在边线接球固定防守", "等待前腰和边后卫形成不同方向"], ["oneVOne", "insideCreation", "doubleTeamGravity"]),
          am: fn("右肋撞墙连接者", "attack", ["advancedPlaymaker"], ["站在左后卫内侧视野外", "为边锋和右后卫完成做墙"], ["tightSpace", "finalPass"]),
          rb: fn("第二波套上的终结边后卫", "attack", ["overlappingFullback"], ["不与边锋同时启动", "看到左边锋失位后再前插"], ["offBallRun", "halfSpaceCombination"]),
        }),
        [FRANCE_ID]: matchupTeamFrame(franceTeam, "defend", "4-4-2 左侧回收", { gk:{x:94,y:50},lb:{x:85,y:82},lcb:{x:83,y:61},rcb:{x:83,y:39},rb:{x:85,y:17},dm:{x:72,y:44},cm:{x:73,y:62},am:{x:65,y:56},lw:{x:73,y:78},st:{x:66,y:43},rw:{x:72,y:18} }, {
          lb: fn("被迫同时处理内外线的左后卫", "defend", ["supportingFullback"], ["不能过早扑向边锋", "等待左边锋回收后再分工"], ["duel", "recovery"]),
          lw: fn("回防与反击之间的选择点", "defend", ["wideMidfielder"], ["先落到右后卫推进线路", "抢回球后再攻击其身后"], ["counterPress", "acceleration"]),
        }),
      }, attackDirections: directions, source,
    },
    {
      id: "duel-counterpress", short: "03", title: "丢球绞杀", eyebrow: "西班牙反抢 · 切断法国前场", stage: "counterPress",
      description: "西班牙丢球后不是所有人扑向球，而是近端三人压迫、后腰封住纵向出口、中卫控制中锋。法国前腰被迫背身或回传，无法把球稳定送到左侧速度点。",
      instruction: "压球、封十号位、控制中锋：法国第一脚反击必须被切断",
      possessionTeamId: FRANCE_ID, opponentTeamId: FRANCE_ID, ball: { x: 68, y: 67 },
      focus: focus(ref(SPAIN_ID, "dm"), ref(SPAIN_ID, "lcm"), ref(SPAIN_ID, "am"), ref(FRANCE_ID, "am"), ref(FRANCE_ID, "st")),
      metrics: { widthMeters: 57, lengthMeters: 30, protection: "3人压球 + 2人封口" },
      annotations: [
        line(ref(SPAIN_ID, "am"), ball, "press", "近端立即压球"),
        line(ref(SPAIN_ID, "dm"), ref(FRANCE_ID, "am"), "cover", "切断法国创造核心"),
        line(ref(SPAIN_ID, "rcb"), ref(FRANCE_ID, "st"), "cover", "中卫控制纵深出口"),
      ],
      teams: {
        [SPAIN_ID]: matchupTeamFrame(spainTeam, "press", "3+2 反抢保护", { gk:{x:27,y:50},lb:{x:48,y:18},lcb:{x:47,y:40},rcb:{x:48,y:63},rb:{x:59,y:83},dm:{x:58,y:49},lcm:{x:65,y:35},am:{x:70,y:63},lw:{x:72,y:13},st:{x:74,y:48},rw:{x:74,y:87} }, {
          dm: fn("法国前腰身前的封口后腰", "cover", ["anchor"], ["优先切断前腰而非扑球", "准备拦截向左内锋的斜传"], ["counterPress", "scanning"]),
          rcb: fn("控制法国中锋的前顶中卫", "cover", ["aggressiveCenterBack"], ["保持可前顶距离", "不让中锋轻松转身"], ["frontFootDefend", "recovery"]),
        }),
        [FRANCE_ID]: matchupTeamFrame(franceTeam, "progress", "4-2-3-1 转换受阻", { gk:{x:93,y:50},lb:{x:81,y:82},lcb:{x:80,y:60},rcb:{x:80,y:40},rb:{x:82,y:17},dm:{x:72,y:43},cm:{x:69,y:58},am:{x:66,y:65},lw:{x:61,y:82},st:{x:62,y:49},rw:{x:67,y:19} }, {
          am: fn("被封锁的右肋创造者", "support", ["advancedPlaymaker"], ["需要先摆脱后腰遮挡", "无法转身时必须回做"], ["halfSpaceCombination", "finalPass"]),
          st: fn("被中卫隔离的纵深出口", "attack", ["pressingForward"], ["在中卫身侧寻找直传", "必要时回撤帮助出球"], ["depthRun", "linkPlay"]),
        }),
      }, attackDirections: directions, source,
    },
    {
      id: "duel-transition", short: "04", title: "法国反击", eyebrow: "法国持球 · 西班牙转换保护", stage: "progression",
      description: "法国最危险的路径是全能中场夺线后立即寻找左侧纵深。西班牙用右后卫延迟冲刺、后腰封住内线、中卫向外补位，把法国速度点逼向边线而不是禁区中央。",
      instruction: "法国：第一脚必须越线；西班牙：延迟速度点并把反击赶向边线",
      possessionTeamId: FRANCE_ID, opponentTeamId: FRANCE_ID, ball: { x: 58, y: 67 },
      focus: focus(ref(FRANCE_ID, "cm"), ref(FRANCE_ID, "lw"), ref(FRANCE_ID, "am"), ref(SPAIN_ID, "dm"), ref(SPAIN_ID, "rb")),
      metrics: { widthMeters: 62, lengthMeters: 44, protection: "ESP 3+2 / FRA 4人冲刺" },
      annotations: [
        line(ref(FRANCE_ID, "cm"), ref(FRANCE_ID, "lw"), "pass", "第一脚寻找左侧纵深"),
        line(ref(SPAIN_ID, "dm"), ref(FRANCE_ID, "lw"), "cover", "封住向内切入路线"),
        line(ref(SPAIN_ID, "rb"), ref(FRANCE_ID, "lw"), "press", "延迟并赶向边线"),
      ],
      teams: {
        [SPAIN_ID]: matchupTeamFrame(spainTeam, "defend", "3+2 转换保护", { gk:{x:12,y:50},lb:{x:39,y:18},lcb:{x:39,y:40},rcb:{x:40,y:62},rb:{x:46,y:83},dm:{x:47,y:52},lcm:{x:54,y:34},am:{x:57,y:62},lw:{x:63,y:13},st:{x:65,y:48},rw:{x:61,y:87} }, {
          dm: fn("反击内线的延迟者", "defend", ["anchor"], ["先封左内锋向中路的路线", "等待右后卫回到对抗位置"], ["scanning", "counterPress"]),
          rb: fn("面对速度点的延迟边后卫", "defend", ["supportingFullback"], ["不直接抢断", "身体朝向把进攻赶去边线"], ["recovery"]),
        }),
        [FRANCE_ID]: matchupTeamFrame(franceTeam, "progress", "4-2-3-1 垂直转换", { gk:{x:91,y:50},lb:{x:77,y:82},lcb:{x:76,y:61},rcb:{x:76,y:40},rb:{x:77,y:17},dm:{x:68,y:45},cm:{x:62,y:62},am:{x:57,y:33},lw:{x:51,y:79},st:{x:53,y:52},rw:{x:58,y:17} }, {
          cm: fn("反击第一脚的夺线中场", "attack", ["ballCarryingEight", "boxToBoxMidfielder"], ["接球后不横传", "用持球或斜传越过西班牙中场"], ["carry", "lineBreakPass", "repeatRunning"]),
          lw: fn("左侧第一纵深速度点", "attack", ["insideForward"], ["从右后卫外肩启动", "进入禁区前尝试切回中路"], ["acceleration", "insideRun", "finishing"]),
        }),
      }, attackDirections: directions, source,
    },
    {
      id: "duel-control", short: "05", title: "领先控制", eyebrow: "法国攻坚 · 西班牙封锁", stage: "defend",
      description: "领先后西班牙减少无谓前压，形成紧凑4-1-4-1。两名中场夹住法国前腰，边锋回收协助边后卫。法国虽然提高下半场控球，却难以让创造核心和中锋建立稳定联系。",
      instruction: "西班牙：封中轴、允许外线回传；法国：必须制造第三人而非依赖单点突破",
      possessionTeamId: FRANCE_ID, opponentTeamId: FRANCE_ID, ball: { x: 47, y: 65 },
      focus: focus(ref(SPAIN_ID, "dm"), ref(SPAIN_ID, "lcm"), ref(SPAIN_ID, "am"), ref(FRANCE_ID, "am"), ref(FRANCE_ID, "st")),
      metrics: { widthMeters: 43, lengthMeters: 26, protection: "ESP 4-1-4-1" },
      annotations: [
        line(ref(SPAIN_ID, "dm"), ref(FRANCE_ID, "am"), "cover", "后腰封前腰脚下"),
        line(ref(SPAIN_ID, "lcm"), ref(FRANCE_ID, "cm"), "press", "中场向球侧挤压"),
        line(ref(FRANCE_ID, "am"), ref(FRANCE_ID, "st"), "pass", "被切断的核心连接"),
      ],
      teams: {
        [SPAIN_ID]: matchupTeamFrame(spainTeam, "defend", "4-1-4-1 领先控制", { gk:{x:8,y:50},lb:{x:21,y:18},lcb:{x:20,y:40},rcb:{x:20,y:61},rb:{x:21,y:82},dm:{x:31,y:50},lcm:{x:38,y:32},am:{x:39,y:66},lw:{x:38,y:16},st:{x:47,y:50},rw:{x:38,y:84} }, {
          dm: fn("法国前腰身前的单后腰屏障", "defend", ["anchor"], ["不离开禁区前沿", "随球横移封住前腰"], ["scanning", "counterPress"]),
          lcm: fn("向球侧夹击的中场", "defend", ["boxToBoxMidfielder"], ["与后腰形成前后夹击", "保护边锋回收后的内侧"], ["counterPress", "secondBall"]),
          am: fn("右侧中场线的收窄者", "defend", ["wideMidfielder"], ["回到后腰侧前方", "封锁法国右肋部"], ["pressing", "rotation"]),
        }),
        [FRANCE_ID]: matchupTeamFrame(franceTeam, "attack", "3-2-5 阵地攻坚", { gk:{x:92,y:50},lb:{x:57,y:84},lcb:{x:64,y:62},rcb:{x:64,y:40},rb:{x:65,y:16},dm:{x:54,y:45},cm:{x:51,y:62},am:{x:45,y:66},lw:{x:42,y:82},st:{x:40,y:50},rw:{x:43,y:17} }, {
          am: fn("寻找中锋连接的右肋核心", "attack", ["advancedPlaymaker"], ["需要第三人拉开夹击", "避免在静止状态下强行转身"], ["finalPass", "halfSpaceCombination"]),
          st: fn("被隔离的禁区支点", "attack", ["pressingForward"], ["横移接近前腰", "为两侧内锋制造身后空间"], ["linkPlay", "dragCenterBack", "finishing"]),
        }),
      }, attackDirections: directions, source,
    },
  ],
};
