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

const matchupFrames: TacticalSequence["frames"] = [
    {
      id: "duel-build", short: "01", title: "后场组织", eyebrow: "阶段01 · 西班牙出球 vs 法国4-4-2", stage: "buildUp",
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
      viewingGuide: {
        question: "西班牙后腰能否在法国双前锋身后，面向前场接球？",
        watchTargets: [
          { ...ref(SPAIN_ID, "dm"), label: "ESP 后腰" },
          { ...ref(FRANCE_ID, "st"), label: "FRA 中锋" },
          { ...ref(FRANCE_ID, "am"), label: "FRA 前腰" },
        ],
        homeGoal: "吸引法国第一线后，通过后腰或第三人越线。",
        awayGoal: "用双前锋遮挡后腰，迫使西班牙回传或长传。",
        successSignal: "后腰正面接球＝西班牙占优；只能背身或回传＝法国占优。",
        evidence: "这一步先看连接是否成立，不必同时追踪22个位置。",
      },
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
      id: "duel-right", short: "03", title: "进攻落位", eyebrow: "阶段03 · 西班牙右侧三角 vs 法国左路", stage: "attack",
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
      viewingGuide: {
        question: "法国左后卫是否被迫同时处理边锋、前腰和右后卫？",
        watchTargets: [
          { ...ref(SPAIN_ID, "rw"), label: "ESP 右边锋" },
          { ...ref(SPAIN_ID, "am"), label: "ESP 前腰" },
          { ...ref(FRANCE_ID, "lb"), label: "FRA 左后卫" },
        ],
        homeGoal: "用宽度、肋部接应和延迟套上，制造不同方向的三打一。",
        awayGoal: "左边锋及时回收，让左后卫只处理一个方向。",
        successSignal: "左后卫被吸向边线后，肋部或套边通道打开＝西班牙占优。",
        evidence: "两个进球都由西班牙右侧互动产生；第二球来自右后卫与前腰的撞墙配合。",
      },
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
      id: "duel-counterpress", short: "04", title: "高位反抢", eyebrow: "阶段04 · 西班牙压球封口 vs 法国第一传", stage: "counterPress",
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
      viewingGuide: {
        question: "法国抢到球后的第一传，能否找到前腰或中锋？",
        watchTargets: [
          { ...ref(SPAIN_ID, "dm"), label: "ESP 后腰" },
          { ...ref(FRANCE_ID, "am"), label: "FRA 前腰" },
          { ...ref(FRANCE_ID, "st"), label: "FRA 中锋" },
        ],
        homeGoal: "近端压球、后腰封前腰、中卫控制中锋。",
        awayGoal: "第一脚绕过反抢，让前腰转身或直接连接中锋。",
        successSignal: "法国第一脚只能回传或背身接球＝西班牙反抢成功。",
        evidence: "法国前腰与中锋上半场0次互传；前腰在前70分钟丢失球权20次。",
      },
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
      id: "duel-transition", short: "02", title: "中场推进", eyebrow: "阶段02 · 西班牙越线 vs 法国中位封锁", stage: "progression",
      description: "越过法国第一线后，西班牙让后腰成为持球方向盘，左中场和前腰保持错层。法国中场线必须决定是前顶后腰，还是留在原位保护肋部；这个选择决定西班牙能否进入进攻三区。",
      instruction: "西班牙：先吸引再越线；法国：前顶必须有人补住身后",
      possessionTeamId: SPAIN_ID, opponentTeamId: FRANCE_ID, ball: { x: 50, y: 52 },
      focus: focus(ref(SPAIN_ID, "dm"), ref(SPAIN_ID, "lcm"), ref(SPAIN_ID, "am"), ref(FRANCE_ID, "dm"), ref(FRANCE_ID, "cm")),
      metrics: { widthMeters: 68, lengthMeters: 42, protection: "ESP 3+2 / FRA 4-4-2 中位" },
      annotations: [
        line(ref(SPAIN_ID, "rcb"), ref(SPAIN_ID, "dm"), "pass", "进入中轴方向盘"),
        line(ref(FRANCE_ID, "dm"), ref(SPAIN_ID, "dm"), "press", "前顶限制正面转身"),
        line(ref(SPAIN_ID, "dm"), ref(SPAIN_ID, "am"), "pass", "第三人越过中场线"),
      ],
      viewingGuide: {
        question: "西班牙能否让后腰或中场正面越过法国第一道中场线？",
        watchTargets: [
          { ...ref(SPAIN_ID, "dm"), label: "ESP 后腰" },
          { ...ref(SPAIN_ID, "am"), label: "ESP 前腰" },
          { ...ref(FRANCE_ID, "dm"), label: "FRA 后腰" },
        ],
        homeGoal: "通过错层接应和第三人，把球送到法国中场线身后。",
        awayGoal: "一人前顶持球点，另一人保护肋部接应点。",
        successSignal: "西班牙接球者能面向法国后卫线＝推进完成；只能横传＝法国守住。",
        evidence: "重点不是带球距离，而是谁在越线后获得向前视野。",
      },
      teams: {
        [SPAIN_ID]: matchupTeamFrame(spainTeam, "progress", "3-2-5 推进成形", { gk:{x:15,y:50},lb:{x:37,y:20},lcb:{x:34,y:43},rcb:{x:34,y:68},rb:{x:53,y:76},dm:{x:51,y:46},lcm:{x:67,y:30},am:{x:69,y:69},lw:{x:72,y:10},st:{x:76,y:50},rw:{x:73,y:90} }, {
          dm: fn("越过第一线的推进方向盘", "build", ["deepLyingPlaymaker"], ["接球前观察法国后腰前顶", "用第三人传递绕过压迫"], ["pressResistance", "scanning", "lineBreakPass"]),
          am: fn("法国中场线身后的接应点", "support", ["advancedPlaymaker"], ["与左中场保持错层", "在法国后腰转身时进入盲侧"], ["tightSpace", "halfSpaceCombination"]),
        }),
        [FRANCE_ID]: matchupTeamFrame(franceTeam, "defend", "4-4-2 中位压缩", { gk:{x:94,y:50},lb:{x:82,y:83},lcb:{x:82,y:61},rcb:{x:82,y:39},rb:{x:82,y:17},dm:{x:69,y:43},cm:{x:69,y:62},am:{x:58,y:58},lw:{x:69,y:82},st:{x:58,y:42},rw:{x:69,y:18} }, {
          dm: fn("向持球后腰前顶的第一中场", "press", ["anchor"], ["在传球到达时前顶", "身体遮挡西班牙前腰"], ["pressing", "scanning"]),
          cm: fn("保护前顶者身后的平衡中场", "cover", ["boxToBoxMidfielder"], ["横向收窄保护肋部", "保持对左中场的接触"], ["secondBall", "repeatRunning"]),
        }),
      }, attackDirections: directions, source,
    },
    {
      id: "duel-control", short: "05", title: "低位防守", eyebrow: "阶段05 · 西班牙4-1-4-1 vs 法国阵地攻坚", stage: "defend",
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
      viewingGuide: {
        question: "法国能否从外围控球进入西班牙4-1-4-1的中轴？",
        watchTargets: [
          { ...ref(SPAIN_ID, "dm"), label: "ESP 后腰" },
          { ...ref(FRANCE_ID, "am"), label: "FRA 前腰" },
          { ...ref(FRANCE_ID, "st"), label: "FRA 中锋" },
        ],
        homeGoal: "封住前腰与中锋连接，允许法国在无威胁的外围控球。",
        awayGoal: "用第三人跑动拆开夹击，而不是依赖单点强行转身。",
        successSignal: "法国只能横传或边路传中＝西班牙控制住；前腰正面连到中锋＝法国打穿。",
        evidence: "法国全场仅0.30 xG；西班牙控球只有50.9%，胜负来自无球控制而非占有率。",
      },
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
];

export const spainFranceSequence: TacticalSequence = {
  id: "spain-france-world-cup-semi-final",
  title: "西班牙 × 法国：控制如何压制纵深",
  description: "以西班牙2比0法国的世界杯半决赛为校准样本，按与单队页一致的五阶段顺序展示两种体系的相互作用。",
  frames: [...matchupFrames].sort((a, b) => Number(a.short) - Number(b.short)),
};
