import type {
  NodeRef,
  Position,
  RoleCapability,
  RoleDefinition,
  SlotId,
  SourceMetadata,
  TacticalAnchor,
  TacticalAnnotation,
  TacticalFunction,
  TeamDefinition,
  TeamFrame,
} from "../types";

export const FRANCE_ID = "FRA";
const GENERIC_OPPONENT_ID = "OPPONENT";

const roleOrder = ["gk", "lb", "lcb", "rcb", "rb", "dm", "cm", "am", "lw", "st", "rw"];
const cap = (id: string, label: string, level: RoleCapability["level"]): RoleCapability => ({ id, label, level });

const roles: Record<string, RoleDefinition> = {
  gk: {
    id: "gk", label: "出球门将", short: "GK", group: "门将", positionFamily: "goalkeeper",
    defaultArchetypes: ["buildUpGoalkeeper", "sweeperKeeper"], headline: "先保证禁区控制，再寻找快速发动纵向转换的机会",
    capabilities: [cap("shortPass", "短距离出球", 4), cap("longDistribution", "快速长传发动", 4), cap("shotStopping", "门线扑救", 5), cap("sweeping", "防线身后控制", 4)],
    responsibility: "面对逼抢时与双中卫建立安全三角；抢到球后优先观察前场速度点，不强求每次都短传推进。",
    connections: "短传连接双中卫和双后腰，长传寻找边路纵深或中锋身侧。",
  },
  lb: {
    id: "lb", label: "左路进攻边后卫", short: "LB", group: "后卫", positionFamily: "fullback",
    defaultArchetypes: ["overlappingFullback", "supportingFullback"], headline: "承担左路宽度，让左边锋可以进入肋部和禁区",
    capabilities: [cap("overlap", "纵向套边", 5), cap("carry", "大步幅推进", 4), cap("cross", "高速传中", 4), cap("recovery", "冲刺回防", 4), cap("duel", "边路防守", 4)],
    responsibility: "持球时沿边线拉高，成为左侧主要宽度来源；丢球后必须立刻回到中卫外侧。",
    connections: "与左边锋轮换宽度，并接受左中卫和后腰的斜向转移。",
  },
  lcb: {
    id: "lcb", label: "左侧覆盖中卫", short: "LCB", group: "后卫", positionFamily: "centerBack",
    defaultArchetypes: ["ballPlayingCenterBack", "coveringCenterBack"], headline: "保护高位左后卫身后，也负责稳定第一脚向前传递",
    capabilities: [cap("lineBreakPass", "纵向穿线", 4), cap("duel", "正面对抗", 5), cap("recovery", "纵深回追", 4), cap("cover", "外侧补位", 5)],
    responsibility: "左后卫压上时向外扩张保护边路；持球时寻找左侧后腰或前腰，而不是无条件横传。",
    connections: "与门将、右中卫形成出球三角，并持续照顾左后卫身后的转换空间。",
  },
  rcb: {
    id: "rcb", label: "前顶型右中卫", short: "RCB", group: "后卫", positionFamily: "centerBack",
    defaultArchetypes: ["aggressiveCenterBack", "ballPlayingCenterBack"], headline: "敢于带球越过第一线，并主动跟出处理回撤接应点",
    capabilities: [cap("carry", "中路持球推进", 4), cap("frontFootDefend", "向前防守", 5), cap("aerial", "高空对抗", 5), cap("cover", "禁区保护", 4)],
    responsibility: "当对手前锋背身接球时主动前顶；出球受阻时可带球吸引，再把球交给右侧支点。",
    connections: "与右后卫和后腰形成保护链，反抢阶段负责压缩前后距离。",
  },
  rb: {
    id: "rb", label: "右侧保护边后卫", short: "RB", group: "后卫", positionFamily: "fullback",
    defaultArchetypes: ["supportingFullback", "invertedFullback"], headline: "进攻时保持克制，为右侧创造者提供身后保险",
    capabilities: [cap("restDefense", "转换保护", 5), cap("duel", "边路对抗", 5), cap("underlap", "内线接应", 3), cap("switchPlay", "弱侧转移", 4)],
    responsibility: "通常不与左后卫同时压到最高线；根据右边锋站位选择外侧接应或内收组成三人保护。",
    connections: "连接右中卫、右后腰与右边锋，是法国不对称结构的稳定器。",
  },
  dm: {
    id: "dm", label: "防守型后腰", short: "6", group: "中场", positionFamily: "holdingMidfielder",
    defaultArchetypes: ["anchor", "deepLyingPlaymaker"], headline: "守住双中卫身前，同时用中长距离传球改变进攻方向",
    capabilities: [cap("scanning", "身后扫描", 5), cap("interception", "中路拦截", 5), cap("switchPlay", "长距离转移", 4), cap("aerial", "二点球保护", 5), cap("restDefense", "阵型平衡", 5)],
    responsibility: "不轻易离开中轴；有球时控制第一节奏，无球时优先封锁对手向中锋和十号位的直传。",
    connections: "与双中卫构成防守核心，也为另一名中场的前插和反抢提供保险。",
  },
  cm: {
    id: "cm", label: "全能型中场", short: "8", group: "中场", positionFamily: "centralMidfielder",
    defaultArchetypes: ["boxToBoxMidfielder", "ballCarryingEight"], headline: "覆盖大范围，负责把夺回的球转化为向前推进",
    capabilities: [cap("carry", "持球摆脱推进", 4), cap("counterPress", "反抢覆盖", 5), cap("secondBall", "二点球争夺", 5), cap("lineBreakPass", "向前输送", 4), cap("repeatRunning", "连续往返", 5)],
    responsibility: "在后腰身侧提供接应；丢球时向球侧压迫，得球后优先用持球或直传越过对方中场。",
    connections: "连接左侧进攻组与前腰，防守时与后腰组成紧凑双轴。",
  },
  am: {
    id: "am", label: "右倾组织前腰", short: "10", group: "中场", positionFamily: "attackingMidfielder",
    defaultArchetypes: ["advancedPlaymaker", "pressingTen"], headline: "在右肋部串联、最后一传和定位球之外承担第一线压迫",
    capabilities: [cap("finalPass", "最后一传", 5), cap("halfSpaceCombination", "右肋配合", 5), cap("pressing", "压迫执行", 4), cap("shooting", "禁区前射门", 4)],
    responsibility: "不固定在中轴，更多向右侧靠拢与边锋、边后卫形成三角；无球时上提到中锋身边。",
    connections: "是双后腰与前场三人的主要连接点，也负责把右侧配合转化为中路机会。",
  },
  lw: {
    id: "lw", label: "左侧纵深内锋", short: "LW", group: "前锋", positionFamily: "winger",
    defaultArchetypes: ["insideForward", "invertedWinger"], headline: "从左侧起步，主要攻击中卫与边后卫之间的纵深",
    capabilities: [cap("acceleration", "纵深加速", 5), cap("insideRun", "内切跑位", 5), cap("oneVOne", "一对一突破", 5), cap("finishing", "进入禁区终结", 5), cap("counterPress", "就地反抢", 4)],
    responsibility: "左后卫拉开后进入肋部；转换阶段第一时间向对手防线身后冲刺，而不是停在边线等待。",
    connections: "与左后卫形成一宽一内，与中锋交叉跑位，并接受前腰的斜塞。",
  },
  st: {
    id: "st", label: "冲刺型中锋", short: "9", group: "前锋", positionFamily: "striker",
    defaultArchetypes: ["pressingForward", "secondStriker"], headline: "既牵制中卫，也不断攻击最后一线身后",
    capabilities: [cap("depthRun", "攻击纵深", 5), cap("finishing", "高速终结", 5), cap("linkPlay", "回撤做球", 4), cap("pressing", "弧线压迫", 4), cap("dragCenterBack", "拉扯中卫", 5)],
    responsibility: "根据左侧内锋的跑位选择留中或横向让位；第一道压迫用跑动方向迫使对手向边线出球。",
    connections: "与左内锋共享中路纵深，与前腰保持短距离做球关系。",
  },
  rw: {
    id: "rw", label: "右侧创造边锋", short: "RW", group: "前锋", positionFamily: "winger",
    defaultArchetypes: ["invertedWinger", "touchlineWinger"], headline: "先拉开接球，再通过内切或双向突破制造最后动作",
    capabilities: [cap("oneVOne", "双向一对一", 5), cap("insideCreation", "内切创造", 5), cap("combination", "连续小组配合", 5), cap("counterPress", "丢球反抢", 5), cap("finishing", "内切终结", 4)],
    responsibility: "与前腰共同掌控右侧强侧；可以保持宽度，也可以进入禁区让右后卫成为外侧接应。",
    connections: "与前腰、右后卫组成右侧三角，并在弱侧进攻时攻击远门柱。",
  },
};

const modelSource: SourceMetadata = {
  kind: "coach-model",
  label: "基于法国足协世界杯名单与六场比赛报告的人工战术建模",
  capturedAt: "2026-07-15",
  confidence: "medium",
};

const fn = (
  label: string,
  duty: TacticalFunction["duty"],
  archetypes: TacticalFunction["archetypes"],
  behaviors: string[],
  emphasizedCapabilities: string[],
): TacticalFunction => ({ label, duty, archetypes, behaviors, emphasizedCapabilities });

const phaseFunctions: Record<string, Record<string, TacticalFunction>> = {
  build: {
    gk: fn("安全优先的发动者", "build", ["buildUpGoalkeeper"], ["耐心连接双中卫", "出现空间后快速发动"], ["shortPass", "longDistribution"]),
    lb: fn("左侧第一宽度出口", "support", ["supportingFullback"], ["保持边线接球角度", "等待左内锋内收"], ["carry", "overlap"]),
    lcb: fn("覆盖型左出球中卫", "build", ["ballPlayingCenterBack", "coveringCenterBack"], ["向外拉开第一线", "观察后腰身后压迫"], ["lineBreakPass", "cover"]),
    rcb: fn("带球吸引的右中卫", "build", ["ballPlayingCenterBack"], ["无压迫时主动带球", "把第一线吸向中路"], ["carry"]),
    rb: fn("低位第三出球点", "cover", ["supportingFullback", "wideCenterBack"], ["保持在球后", "提供右侧安全回传"], ["restDefense", "switchPlay"]),
    dm: fn("中卫身前的定盘星", "build", ["anchor", "deepLyingPlaymaker"], ["错开另一后腰站位", "接球前完成扫描"], ["scanning", "switchPlay"]),
    cm: fn("可转身的第二接应点", "support", ["ballCarryingEight"], ["向侧后方接应", "接球后优先向前"], ["carry", "lineBreakPass"]),
    am: fn("回到中场线间的连接者", "support", ["advancedPlaymaker"], ["在右肋部露出传球角度", "吸引对方后腰"], ["halfSpaceCombination", "finalPass"]),
    lw: fn("提前威胁身后的左内锋", "attack", ["insideForward"], ["站在边后卫内侧肩后", "准备接第一脚纵向球"], ["acceleration", "insideRun"]),
    st: fn("固定中卫的纵深支点", "attack", ["pressingForward"], ["保持最后一线高度", "适时回撤做墙"], ["depthRun", "linkPlay"]),
    rw: fn("右侧拉宽接应点", "support", ["touchlineWinger"], ["先扩大出球宽度", "接球后与前腰组合"], ["oneVOne", "combination"]),
  },
  progress: {
    gk: fn("高位保护门将", "cover", ["sweeperKeeper"], ["跟随防线前移", "准备处理直接长传"], ["sweeping"]),
    lb: fn("高速推进翼位", "attack", ["overlappingFullback"], ["沿左线越过中场", "把左内锋送入肋部"], ["carry", "overlap"]),
    lcb: fn("左侧转换保护者", "cover", ["coveringCenterBack"], ["向外保护左后卫身后", "不被球吸离纵深"], ["cover", "recovery"]),
    rcb: fn("中轴前顶出球者", "build", ["ballPlayingCenterBack"], ["带球越过第一线", "找到前腰脚下"], ["carry", "frontFootDefend"]),
    rb: fn("内收的第三后卫", "cover", ["wideCenterBack", "invertedFullback"], ["收窄形成三人底座", "保护右边锋身后"], ["restDefense"]),
    dm: fn("双支点中的平衡者", "cover", ["anchor"], ["始终留在球后", "控制被反击的中央通道"], ["restDefense", "scanning"]),
    cm: fn("夺线推进的全能八号", "attack", ["ballCarryingEight", "boxToBoxMidfielder"], ["持球穿越对手中场", "及时支援左侧"], ["carry", "repeatRunning"]),
    am: fn("右肋推进枢纽", "attack", ["advancedPlaymaker"], ["在边锋内侧接球", "转身寻找左侧纵深"], ["halfSpaceCombination", "finalPass"]),
    lw: fn("冲击肋部的速度点", "attack", ["insideForward"], ["从左侧斜向冲刺", "攻击中卫外侧"], ["acceleration", "insideRun"]),
    st: fn("牵制最后线的中锋", "attack", ["pressingForward"], ["保持中路深度", "与左内锋交叉跑动"], ["depthRun", "dragCenterBack"]),
    rw: fn("右侧强侧推进者", "attack", ["invertedWinger"], ["一对一后内切", "与前腰连续配合"], ["oneVOne", "combination"]),
  },
  attack: {
    gk: fn("远端转换保险", "cover", ["sweeperKeeper"], ["保持禁区外警戒", "准备回收二次进攻"], ["sweeping", "longDistribution"]),
    lb: fn("左侧高位宽度点", "attack", ["overlappingFullback"], ["贴边拉开低位防线", "传中后立即回收"], ["overlap", "cross"]),
    lcb: fn("左侧身后保护者", "cover", ["coveringCenterBack"], ["控制左后卫身后", "保持与后腰距离"], ["cover", "recovery"]),
    rcb: fn("中央反击终止者", "cover", ["aggressiveCenterBack"], ["预判对手第一支点", "允许向前拦截"], ["frontFootDefend", "aerial"]),
    rb: fn("右侧留守保护者", "cover", ["wideCenterBack", "supportingFullback"], ["与双中卫形成三人保护", "只在机会明确时前插"], ["restDefense", "duel"]),
    dm: fn("禁区外平衡轴", "cover", ["anchor"], ["控制第二落点", "保持弱侧转移能力"], ["aerial", "switchPlay", "restDefense"]),
    cm: fn("禁区弧顶第二波", "support", ["boxToBoxMidfielder"], ["支援肋部配合", "争夺解围后的二点球"], ["secondBall", "lineBreakPass"]),
    am: fn("右肋最后一传核心", "attack", ["advancedPlaymaker"], ["吸引后腰后送直塞", "寻找禁区前射门"], ["finalPass", "shooting"]),
    lw: fn("左肋第一终结点", "attack", ["insideForward"], ["攻击中卫身后", "进入禁区而非停留边线"], ["insideRun", "finishing"]),
    st: fn("中路牵制与冲刺点", "attack", ["pressingForward"], ["占住中卫之间", "突然横移为左内锋让路"], ["depthRun", "dragCenterBack", "finishing"]),
    rw: fn("右侧持球创造者", "attack", ["invertedWinger"], ["固定防守宽度", "内切后选择传射"], ["oneVOne", "insideCreation", "finishing"]),
  },
  press: {
    gk: fn("高位防线身后清道夫", "cover", ["sweeperKeeper"], ["前移压缩纵深", "准备直接出击"], ["sweeping"]),
    lb: fn("左侧前压封锁者", "press", ["supportingFullback"], ["跟进左内锋的压迫", "阻止边路脱身"], ["recovery"]),
    lcb: fn("反抢圈外侧保护者", "cover", ["coveringCenterBack"], ["防止直传左侧纵深", "控制对手前锋外拉"], ["cover", "recovery"]),
    rcb: fn("主动拦截第一支点", "press", ["aggressiveCenterBack"], ["前顶处理背身接球", "争夺直接长传"], ["frontFootDefend", "aerial"]),
    rb: fn("弱侧收窄保险", "cover", ["invertedFullback"], ["收进中路形成三后卫", "观察弱侧速度点"], ["restDefense", "duel"]),
    dm: fn("中路封口后腰", "cover", ["anchor"], ["不追到边线", "封住反击第一直传"], ["interception", "scanning"]),
    cm: fn("球侧反抢发动者", "press", ["boxToBoxMidfielder"], ["向球侧快速夹击", "争夺弹出的二点球"], ["counterPress", "secondBall"]),
    am: fn("盲侧压迫十号", "press", ["pressingTen"], ["切断回传后腰", "从持球人盲侧接近"], ["pressing"]),
    lw: fn("丢球点纵向围堵者", "press", ["insideForward"], ["先压球再判断回收", "封锁内线摆脱"], ["counterPress", "acceleration"]),
    st: fn("第一线弧线施压者", "press", ["pressingForward"], ["把出球赶向一侧", "屏蔽对方后腰"], ["pressing", "dragCenterBack"]),
    rw: fn("右侧就地反抢核心", "press", ["invertedWinger"], ["失球立即压迫", "与前腰形成夹击"], ["counterPress", "combination"]),
  },
  defend: {
    gk: fn("禁区控制门将", "defend", ["sweeperKeeper"], ["控制六码区", "指挥防线纵深"], ["shotStopping", "sweeping"]),
    lb: fn("四后卫左侧守门员", "defend", ["supportingFullback"], ["优先保护内线", "边锋回位后再向外压"], ["duel", "recovery"]),
    lcb: fn("禁区左侧覆盖中卫", "defend", ["coveringCenterBack"], ["保护前点与左肋", "避免被拉出中路"], ["duel", "cover"]),
    rcb: fn("禁区中央对抗核心", "defend", ["aggressiveCenterBack"], ["处理高球和中锋", "维持防线高度"], ["aerial", "frontFootDefend"]),
    rb: fn("弱侧收窄边后卫", "cover", ["supportingFullback"], ["随球向中路收缩", "保护远门柱"], ["restDefense", "duel"]),
    dm: fn("双中卫身前屏障", "defend", ["anchor"], ["保护禁区弧顶", "封锁中锋脚下"], ["interception", "aerial", "scanning"]),
    cm: fn("横移补位中场", "defend", ["boxToBoxMidfielder"], ["向球侧协防", "保持与后腰横向距离"], ["repeatRunning", "secondBall"]),
    am: fn("与中锋并列的前线屏障", "press", ["pressingTen", "secondStriker"], ["封锁对方后腰", "保留反击接应位置"], ["pressing"]),
    lw: fn("左侧回收边前卫", "defend", ["wideMidfielder"], ["落回中场线", "帮助左后卫形成二防一"], ["counterPress", "acceleration"]),
    st: fn("反击出口兼第一道防线", "press", ["pressingForward"], ["不追入本方中场", "准备向身后启动"], ["pressing", "depthRun"]),
    rw: fn("右侧回收边前卫", "defend", ["wideMidfielder"], ["保护右后卫外侧", "得球后承担第一推进"], ["counterPress", "oneVOne"]),
  },
};

const ownRef = (slotId: SlotId): NodeRef => ({ kind: "node", teamId: FRANCE_ID, slotId });
const ballRef: TacticalAnchor = { kind: "ball" };
const anchor = (value: SlotId | "ball"): TacticalAnchor => value === "ball" ? ballRef : ownRef(value);
const line = (from: SlotId | "ball", to: SlotId | "ball", type: TacticalAnnotation["type"], label: string): TacticalAnnotation => ({
  from: anchor(from), to: anchor(to), type, label,
});
const focus = (...slotIds: SlotId[]) => slotIds.map(ownRef);
const primaryFrame = (shape: string, positions: Record<string, Position>, functions: Record<string, TacticalFunction>): TeamFrame => ({
  teamId: FRANCE_ID,
  shape,
  nodes: Object.fromEntries(Object.entries(positions).map(([slotId, position]) => [slotId, { slotId, roleId: slotId, position, function: functions[slotId] }])),
});
const opponentFrame = (shape: string, positions: Position[]): TeamFrame => ({
  teamId: GENERIC_OPPONENT_ID,
  shape,
  nodes: Object.fromEntries(positions.map((position, index) => {
    const slotId = `opp_${index}`;
    return [slotId, { slotId, roleId: slotId, position }];
  })),
});

const frames = [
  {
    id: "build", short: "01", title: "后场组织", eyebrow: "持球 · 第一阶段", stage: "buildUp" as const,
    description: "法国以双中卫和双后腰建立安全出口，右后卫相对克制，左后卫逐步拉高。目标不是维持无风险控球，而是诱发第一线移动后尽快寻找前场四人。",
    instruction: "双后腰错层接应，第一道压迫移动后立即纵向", possessionTeamId: FRANCE_ID, opponentTeamId: GENERIC_OPPONENT_ID,
    ball: { x: 24, y: 61 }, focus: focus("gk", "lcb", "rcb", "dm", "cm"), metrics: { widthMeters: 68, lengthMeters: 58, protection: "4+2" },
    annotations: [line("gk", "rcb", "pass", "建立安全第一传"), line("rcb", "cm", "pass", "吸引后穿线"), line("dm", "lw", "pass", "斜向寻找纵深")],
    teams: {
      [FRANCE_ID]: primaryFrame("4-2-3-1 双后腰出球", { gk:{x:8,y:50},lb:{x:31,y:14},lcb:{x:25,y:38},rcb:{x:25,y:62},rb:{x:29,y:86},dm:{x:41,y:44},cm:{x:43,y:65},am:{x:54,y:67},lw:{x:55,y:19},st:{x:60,y:48},rw:{x:56,y:87} }, phaseFunctions.build),
      [GENERIC_OPPONENT_ID]: opponentFrame("4-3-3 中高位压迫", [{x:93,y:50},{x:82,y:15},{x:81,y:38},{x:81,y:62},{x:82,y:85},{x:66,y:24},{x:64,y:50},{x:66,y:76},{x:51,y:25},{x:49,y:50},{x:51,y:75}]),
    }, source: modelSource,
  },
  {
    id: "progress", short: "02", title: "中场推进", eyebrow: "持球 · 第二阶段", stage: "progression" as const,
    description: "右后卫内收形成三人保护，左后卫成为高位宽度点。双后腰一人留守、一人向前，右侧前腰与边锋组合，左侧内锋持续攻击防线身后。",
    instruction: "右侧组合吸引，左侧纵深完成致命加速", possessionTeamId: FRANCE_ID, opponentTeamId: GENERIC_OPPONENT_ID,
    ball: { x: 57, y: 72 }, focus: focus("lb", "dm", "cm", "am", "rw"), metrics: { widthMeters: 75, lengthMeters: 51, protection: "3+2" },
    annotations: [line("rcb", "cm", "pass", "中路夺线"), line("cm", "am", "pass", "进入右肋"), line("am", "lw", "pass", "反向攻击身后")],
    teams: {
      [FRANCE_ID]: primaryFrame("3-2-5 不对称推进", { gk:{x:15,y:50},lb:{x:65,y:10},lcb:{x:36,y:34},rcb:{x:36,y:57},rb:{x:38,y:79},dm:{x:50,y:44},cm:{x:55,y:61},am:{x:68,y:69},lw:{x:69,y:30},st:{x:73,y:50},rw:{x:69,y:90} }, phaseFunctions.progress),
      [GENERIC_OPPONENT_ID]: opponentFrame("4-4-2 中位块", [{x:93,y:50},{x:82,y:16},{x:80,y:39},{x:80,y:61},{x:82,y:84},{x:66,y:18},{x:64,y:42},{x:64,y:59},{x:66,y:82},{x:55,y:42},{x:55,y:60}]),
    }, source: modelSource,
  },
  {
    id: "attack", short: "03", title: "进攻落位", eyebrow: "持球 · 终结阶段", stage: "attack" as const,
    description: "左后卫负责宽度，左内锋和中锋双重攻击纵深；前腰与右边锋在右侧创造强侧配合。右后卫、双中卫与后腰维持稳定的转换保护。",
    instruction: "左路一宽一内，右路连续配合，中路保持双重纵深", possessionTeamId: FRANCE_ID, opponentTeamId: GENERIC_OPPONENT_ID,
    ball: { x: 77, y: 78 }, focus: focus("lb", "lw", "st", "am", "rw"), metrics: { widthMeters: 77, lengthMeters: 45, protection: "3+2" },
    annotations: [line("rw", "am", "pass", "右侧连续组合"), line("am", "st", "pass", "穿入禁区"), line("lw", "ball", "run", "左内锋攻击身后")],
    teams: {
      [FRANCE_ID]: primaryFrame("3-2-5 强侧创造", { gk:{x:18,y:50},lb:{x:79,y:9},lcb:{x:42,y:34},rcb:{x:41,y:57},rb:{x:43,y:80},dm:{x:57,y:47},cm:{x:66,y:62},am:{x:78,y:69},lw:{x:80,y:31},st:{x:84,y:50},rw:{x:80,y:91} }, phaseFunctions.attack),
      [GENERIC_OPPONENT_ID]: opponentFrame("5-4-1 低位块", [{x:95,y:50},{x:86,y:12},{x:84,y:31},{x:83,y:50},{x:84,y:69},{x:86,y:88},{x:72,y:18},{x:70,y:41},{x:70,y:59},{x:72,y:82},{x:62,y:50}]),
    }, source: modelSource,
  },
  {
    id: "press", short: "04", title: "高位反抢", eyebrow: "转换 · 丢球瞬间", stage: "counterPress" as const,
    description: "法国首先依靠前腰、右边锋和全能中场在球侧围堵，防守型后腰留在中路封口。若第一轮围抢没有形成明显优势，就迅速停止追逐并回到4-4-2。",
    instruction: "球侧三人压迫，中路后腰封口；抢不到立即停止冒险", possessionTeamId: GENERIC_OPPONENT_ID, opponentTeamId: GENERIC_OPPONENT_ID,
    ball: { x: 70, y: 73 }, focus: focus("cm", "am", "rw", "dm", "rcb"), metrics: { widthMeters: 60, lengthMeters: 34, protection: "3+1" },
    annotations: [line("rw", "ball", "press", "失球立即压迫"), line("am", "ball", "press", "从盲侧夹击"), line("dm", "ball", "cover", "封锁中路出口")],
    teams: {
      [FRANCE_ID]: primaryFrame("选择性四人反抢", { gk:{x:27,y:50},lb:{x:53,y:14},lcb:{x:48,y:37},rcb:{x:49,y:60},rb:{x:52,y:84},dm:{x:57,y:47},cm:{x:65,y:61},am:{x:70,y:69},lw:{x:70,y:24},st:{x:74,y:49},rw:{x:73,y:87} }, phaseFunctions.press),
      [GENERIC_OPPONENT_ID]: opponentFrame("4-3-3 转换", [{x:93,y:50},{x:83,y:15},{x:81,y:38},{x:81,y:62},{x:83,y:85},{x:70,y:23},{x:68,y:50},{x:70,y:77},{x:58,y:25},{x:57,y:50},{x:58,y:75}]),
    }, source: modelSource,
  },
  {
    id: "defend", short: "05", title: "低位防守", eyebrow: "无球 · 阵地防守", stage: "defend" as const,
    description: "前腰上提到中锋身边，两侧边锋回收到中场线，形成4-4-2。双后腰保护禁区前沿，保留一名速度前锋作为反击出口，整体强调紧凑和对第二落点的控制。",
    instruction: "两条四人线守中路，前场双人保留反击纵深", possessionTeamId: GENERIC_OPPONENT_ID, opponentTeamId: GENERIC_OPPONENT_ID,
    ball: { x: 59, y: 18 }, focus: focus("lb", "lcb", "rcb", "rb", "dm", "cm", "lw", "rw"), metrics: { widthMeters: 45, lengthMeters: 29, protection: "4+4" },
    annotations: [line("lw", "lb", "cover", "左侧形成二防一"), line("cm", "ball", "cover", "球侧横移补位"), line("st", "ball", "run", "保留反击出口")],
    teams: {
      [FRANCE_ID]: primaryFrame("4-4-2 紧凑防守块", { gk:{x:8,y:50},lb:{x:21,y:17},lcb:{x:20,y:39},rcb:{x:20,y:61},rb:{x:21,y:83},dm:{x:34,y:43},cm:{x:34,y:62},am:{x:46,y:59},lw:{x:34,y:18},st:{x:47,y:41},rw:{x:34,y:82} }, phaseFunctions.defend),
      [GENERIC_OPPONENT_ID]: opponentFrame("4-2-3-1 阵地进攻", [{x:93,y:50},{x:80,y:14},{x:78,y:38},{x:78,y:62},{x:80,y:86},{x:62,y:42},{x:62,y:59},{x:47,y:20},{x:46,y:50},{x:47,y:80},{x:39,y:50}]),
    }, source: modelSource,
  },
];

export const franceTeam: TeamDefinition = {
  id: FRANCE_ID,
  slug: "france",
  name: "法国",
  nameEn: "FRANCE",
  code: "FRA",
  baseFormation: "4-2-3-1",
  styleLabel: "ADAPTIVE VERTICALITY",
  flagBackground: "linear-gradient(to right, #002395 0 33.33%, #ffffff 33.33% 66.66%, #ed2939 66.66%)",
  roleOrder,
  roles,
  formations: [
    { label: "4-2-3-1", detail: "当前 · 双后腰", active: true },
    { label: "3-2-5", detail: "持球进攻形态" },
    { label: "4-4-2", detail: "无球防守形态" },
    { label: "4-3-3", detail: "比赛内调整" },
  ],
  principles: [
    { title: "不对称制造空间", description: "左后卫拉高提供宽度，右后卫更多留守；左侧攻击纵深，右侧依靠前腰和边锋连续创造。" },
    { title: "先稳定，再垂直", description: "后场不排斥耐心传递，但一旦第一线被吸引，就迅速寻找前场速度点或右肋组织者。" },
    { title: "反抢可以随时刹车", description: "球侧有局部人数优势时立即围堵；第一轮没有抢回机会，就回到紧凑4-4-2，避免持续无效追逐。" },
  ],
  sequences: [{
    id: "france-adaptive-verticality",
    title: "法国五阶段垂直进攻",
    description: "由六场世界杯比赛样本归纳的不对称4-2-3-1教练模型。",
    frames,
  }],
  research: {
    tournament: "2026 世界杯",
    coach: "Didier Deschamps",
    asOf: "2026-07-09",
    scope: "26人正式名单 + 小组赛至四分之一决赛6场比赛",
    methodology: "以法国足协官方名单、首发与比赛报告为事实层；站位坐标、角色能力和五阶段移动属于教练模型推断，不冒充追踪数据。西班牙半决赛留作下一步对抗验证样本。",
    squadSourceUrl: "https://www.fff.fr/article/16790-les-26-bleus-pour-le-mondial-2026.html",
    matchSamples: [
      { date: "2026-06-16", stage: "小组赛", opponent: "塞内加尔", score: "3–1", observedFormation: "4-2-3-1", evidence: ["前场四人组结构", "右侧组织者向中锋输送", "下半场提升纵向速度"], sourceUrl: "https://www.fff.fr/article/16981-les-bleus-au-rendez-vous.html" },
      { date: "2026-06-22", stage: "小组赛", opponent: "伊拉克", score: "3–0", observedFormation: "4-2-3-1", evidence: ["双后腰轮换不改变结构", "长期压在对方半场", "右侧创造者连续制造最后一传"], sourceUrl: "https://www.fff.fr/article/17006-l-orage-et-la-foudre-bleue-3-0-.html" },
      { date: "2026-06-26", stage: "小组赛", opponent: "挪威", score: "4–1", observedFormation: "4-2-3-1", evidence: ["四处轮换仍保持骨架", "右边锋内切连续终结", "反抢后快速找到弱侧"], sourceUrl: "https://www.fff.fr/article/17028-dembele-fait-fondre-la-glace-4-1-.html" },
      { date: "2026-06-30", stage: "三十二强", opponent: "瑞典", score: "3–0", observedFormation: "4-2-3-1", evidence: ["首发明确呈4-2-3-1", "双后腰维持平衡", "前腰两次助攻体现右肋连接"], sourceUrl: "https://www.fff.fr/article/17046-les-bleus-sur-leur-lancee.html" },
      { date: "2026-07-04", stage: "十六强", opponent: "巴拉圭", score: "1–0", observedFormation: "4-2-3-1", evidence: ["面对5-4-1取得76%控球", "需要加快传递与突破", "替补一对一能力打开低位块"], sourceUrl: "https://www.fff.fr/article/17063-l-art-de-la-patience.html" },
      { date: "2026-07-09", stage: "四分之一决赛", opponent: "摩洛哥", score: "2–0", observedFormation: "4-2-3-1", evidence: ["上半场射门13比1", "双后腰与后防保持紧凑", "左内锋与右边锋连续终结"], sourceUrl: "https://www.fff.fr/article/17090-la-meme-belle-histoire.html" },
    ],
  },
};
