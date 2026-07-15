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

export const SPAIN_ID = "ESP";
export const GENERIC_OPPONENT_ID = "OPPONENT";

const roleOrder = ["gk", "lb", "lcb", "rcb", "rb", "dm", "lcm", "am", "lw", "st", "rw"];
const cap = (id: string, label: string, level: RoleCapability["level"]): RoleCapability => ({ id, label, level });

const roles: Record<string, RoleDefinition> = {
  gk: {
    id: "gk", label: "门将", short: "GK", group: "门将", headline: "第一出球点，也是防线身后的清道夫",
    positionFamily: "goalkeeper", defaultArchetypes: ["buildUpGoalkeeper", "sweeperKeeper"],
    capabilities: [cap("shortPass", "短传诱导逼抢", 4), cap("longDistribution", "长传转移", 4), cap("sweeping", "禁区外预判", 4)],
    responsibility: "观察对手第一线压迫，把球送到空出的中卫或后腰脚下。防线前压时主动保护身后空间。",
    connections: "优先连接两名中卫；对手封锁中路时直接寻找边后卫。",
  },
  lb: {
    id: "lb", label: "左后卫", short: "LB", group: "后卫", headline: "提供左路宽度，并负责攻防转换后的回追",
    positionFamily: "fullback", defaultArchetypes: ["invertedFullback", "supportingFullback"],
    capabilities: [cap("repeatRunning", "连续跑动", 4), cap("overlap", "套边传中", 3), cap("restDefense", "弱侧保护", 4)],
    responsibility: "左边锋内收时沿边线前插；另一侧大举进攻时不过度压上，保持三人防守底座。",
    connections: "与左中卫、左中场和左边锋形成边路三角。",
  },
  lcb: {
    id: "lcb", label: "左中卫", short: "LCB", group: "后卫", headline: "负责左侧出球和第一脚纵向传递",
    positionFamily: "centerBack", defaultArchetypes: ["ballPlayingCenterBack", "coveringCenterBack"],
    capabilities: [cap("lineBreakPass", "穿线传球", 4), cap("duel", "对抗保护", 4), cap("switchPlay", "大范围转移", 4)],
    responsibility: "吸引对手前锋后，把球穿过第一道压迫；左后卫前插时覆盖其身后。",
    connections: "主要寻找后腰与左中场，也可直接转移给右边锋。",
  },
  rcb: {
    id: "rcb", label: "右中卫", short: "RCB", group: "后卫", headline: "维持防线高度，主动处理右侧纵深",
    positionFamily: "centerBack", defaultArchetypes: ["aggressiveCenterBack", "coveringCenterBack"],
    capabilities: [cap("frontFootDefend", "向前防守", 4), cap("recovery", "速度回追", 4), cap("carry", "持球推进", 4)],
    responsibility: "当右后卫压上时向外侧移动；对手中锋回撤时判断是否跟出防区。",
    connections: "与后腰形成保护中轴，向右后卫和前腰输送直线球。",
  },
  rb: {
    id: "rb", label: "右后卫", short: "RB", group: "后卫", headline: "后排插上的第二进攻点",
    positionFamily: "fullback", defaultArchetypes: ["overlappingFullback", "underlappingFullback"],
    capabilities: [cap("offBallRun", "无球前插", 5), cap("halfSpaceCombination", "肋部配合", 4), cap("recovery", "高速回防", 4)],
    responsibility: "根据右边锋站位选择套边或内插；不提前占据同一通道，等待对手注意力被吸引。",
    connections: "与右边锋、前腰做撞墙配合，作为右侧后插上的第二攻击点。",
  },
  dm: {
    id: "dm", label: "后腰", short: "6", group: "中场", headline: "后撤拿球、抗压转身、调节全队节奏",
    positionFamily: "holdingMidfielder", defaultArchetypes: ["anchor", "deepLyingPlaymaker"],
    capabilities: [cap("pressResistance", "抗压接球", 5), cap("tempo", "节奏控制", 5), cap("lineBreakPass", "纵向穿线", 4), cap("counterPress", "丢球拦截", 4), cap("scanning", "攻防扫描", 5)],
    responsibility: "在两名中卫身前持续提供传球角度。判断何时慢下来重组、何时用一脚纵向球打穿中场。",
    connections: "连接后场与两名攻击中场；丢球时留在球后，封锁对手最直接的反击路线。",
  },
  lcm: {
    id: "lcm", label: "左中场", short: "8", group: "中场", headline: "把控球从安全区域带入进攻三区",
    positionFamily: "centralMidfielder", defaultArchetypes: ["ballCarryingEight", "mezzala"],
    capabilities: [cap("carry", "带球推进", 4), cap("diagonalRun", "斜向前插", 4), cap("secondBall", "二点球争夺", 4), cap("counterPress", "反抢覆盖", 4)],
    responsibility: "接应后腰并向左肋部移动，在中锋回撤后攻击其让出的空间。",
    connections: "为左边锋创造一对一，同时与后腰保持回传线路。",
  },
  am: {
    id: "am", label: "前腰", short: "10", group: "中场", headline: "在两线之间转身，制造最后一传",
    positionFamily: "attackingMidfielder", defaultArchetypes: ["advancedPlaymaker", "pressingTen"],
    capabilities: [cap("tightSpace", "狭小空间处理", 5), cap("rotation", "无球换位", 4), cap("finalPass", "最后一传", 5), cap("pressing", "压迫执行", 4)],
    responsibility: "游走在对手中场与后卫之间；无球时上提，与中锋组成第一道4-4-2压迫。",
    connections: "优先连接中锋和右边锋，也为右后卫的后插上做墙。",
  },
  lw: {
    id: "lw", label: "左边锋", short: "LW", group: "前锋", headline: "拉开或内收，改变左路通道分配",
    positionFamily: "winger", defaultArchetypes: ["insideForward", "wideMidfielder"],
    capabilities: [cap("insideRun", "无球内收", 4), cap("farPostRun", "弱侧冲刺", 4), cap("counterPress", "反抢覆盖", 4), cap("repeatRunning", "边路往返", 4)],
    responsibility: "左后卫套边时进入肋部；球在右侧时攻击远门柱。防守阶段回收到中场线。",
    connections: "与左后卫、左中场轮换位置，避免三人站在同一直线上。",
  },
  st: {
    id: "st", label: "中锋", short: "9", group: "前锋", headline: "移动型九号：回撤接应后再攻击禁区",
    positionFamily: "striker", defaultArchetypes: ["falseNine", "pressingForward"],
    capabilities: [cap("linkPlay", "背身做球", 4), cap("finishing", "禁区终结", 4), cap("dragCenterBack", "横向牵制", 5), cap("pressing", "第一线压迫", 4)],
    responsibility: "不固定站在两名中卫之间。适时回撤带走中卫，为边锋和攻击中场打开身后空间。",
    connections: "作为两侧进攻的支点，与前腰形成最短距离的撞墙组合。",
  },
  rw: {
    id: "rw", label: "右边锋", short: "RW", group: "前锋", headline: "一对一爆点，也是右侧战术的牵制核心",
    positionFamily: "winger", defaultArchetypes: ["touchlineWinger", "invertedWinger"],
    capabilities: [cap("oneVOne", "边线一对一", 5), cap("insideCreation", "内切创造", 5), cap("doubleTeamGravity", "吸引双人防守", 5)],
    responsibility: "先保持最大宽度拉开防线，再根据防守者重心选择内切、下底或回做。",
    connections: "吸引边后卫后为右后卫腾出纵向通道，与前腰形成局部人数优势。",
  },
};

const modelSource: SourceMetadata = {
  kind: "coach-model",
  label: "人工战术建模，非比赛追踪数据",
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
    gk: fn("诱导压迫的出球门将", "build", ["buildUpGoalkeeper", "sweeperKeeper"], ["拉开第一传角度", "必要时越过压迫"], ["shortPass", "longDistribution"]),
    lb: fn("内收组成三人底座", "build", ["invertedFullback", "wideCenterBack"], ["站进左侧半空间", "保护中卫外侧"], ["restDefense"]),
    rb: fn("高位宽度出口", "support", ["supportingFullback"], ["保持边线宽度", "等待弱侧转移"], ["offBallRun"]),
    dm: fn("第一线后的组织核心", "build", ["deepLyingPlaymaker", "anchor"], ["后撤接球", "半转身扫描前场"], ["pressResistance", "tempo", "scanning"]),
    st: fn("回撤牵制的流动支点", "support", ["falseNine"], ["离开中卫之间", "连接前腰与边锋"], ["linkPlay", "dragCenterBack"]),
  },
  progress: {
    lb: fn("外侧保护型第三中卫", "cover", ["wideCenterBack", "coveringCenterBack"], ["留在球后", "限制转换通道"], ["restDefense"]),
    dm: fn("推进主轴", "build", ["deepLyingPlaymaker"], ["吸引后转移", "选择纵向穿线"], ["tempo", "lineBreakPass", "scanning"]),
    rb: fn("右侧辅助支点", "support", ["invertedFullback", "supportingFullback"], ["在后腰侧后方接应", "转向强侧"], ["halfSpaceCombination"]),
    lcm: fn("左肋持球推进者", "attack", ["ballCarryingEight", "mezzala"], ["带球越过中场线", "在边锋内侧前插"], ["carry", "diagonalRun"]),
    am: fn("两线之间的自由人", "attack", ["advancedPlaymaker"], ["背离盯防接球", "接球后立即转身"], ["tightSpace", "finalPass"]),
  },
  attack: {
    lb: fn("留守的转换保护者", "cover", ["wideCenterBack", "coveringCenterBack"], ["不与前场同时压上", "保护左侧身后"], ["restDefense"]),
    rb: fn("延迟后插上的第六人", "attack", ["overlappingFullback", "underlappingFullback"], ["等边锋吸引后启动", "攻击禁区右侧"], ["offBallRun", "halfSpaceCombination"]),
    lcm: fn("攻击中锋身侧的肋部中场", "attack", ["mezzala"], ["进入左肋部", "冲击第二落点"], ["diagonalRun", "secondBall"]),
    st: fn("回撤做墙的伪九号", "support", ["falseNine"], ["带走中卫", "为两侧内切让出纵深"], ["linkPlay", "dragCenterBack"]),
    rw: fn("固定边线的一对一爆点", "attack", ["touchlineWinger", "invertedWinger"], ["先保持最大宽度", "获得单挑后内切或下底"], ["oneVOne", "insideCreation", "doubleTeamGravity"]),
  },
  press: {
    rcb: fn("保护反抢圈的前顶中卫", "cover", ["aggressiveCenterBack"], ["压缩纵向距离", "拦截脱离反抢的第一传"], ["frontFootDefend", "recovery"]),
    dm: fn("封口型后腰", "cover", ["anchor"], ["不盲目扑球", "封锁中路直传"], ["counterPress", "scanning"]),
    lcm: fn("第二落点反抢者", "press", ["boxToBoxMidfielder"], ["从侧后方夹击", "准备争夺弹出球"], ["secondBall", "counterPress"]),
    am: fn("夹击持球人的压迫十号", "press", ["pressingTen"], ["封回传角度", "从盲侧靠近"], ["pressing"]),
    st: fn("第一压迫触发者", "press", ["pressingForward"], ["直接压迫持球人", "把出球赶向边线"], ["pressing", "dragCenterBack"]),
  },
  defend: {
    dm: fn("禁区前沿锚点", "defend", ["anchor"], ["保持在双中卫身前", "随球横移不轻易离位"], ["scanning", "counterPress"]),
    lw: fn("左侧回收边前卫", "defend", ["wideMidfielder"], ["跟随对方边后卫", "协助左后卫形成二防一"], ["counterPress", "repeatRunning"]),
    rw: fn("弱侧收窄边前卫", "cover", ["wideMidfielder"], ["向中路收窄", "封闭弱侧肋部"], ["counterPress"]),
    am: fn("与中锋并列的影锋", "press", ["secondStriker", "pressingTen"], ["封锁对方后腰", "保持反击接应点"], ["rotation", "pressing"]),
    st: fn("封锁回传方向的前锋", "press", ["pressingForward"], ["弧线跑动封后腰", "不过度追进中场"], ["pressing", "dragCenterBack"]),
  },
};

const ownRef = (slotId: SlotId): NodeRef => ({ kind: "node", teamId: SPAIN_ID, slotId });
const ballRef: TacticalAnchor = { kind: "ball" };
const anchor = (value: SlotId | "ball"): TacticalAnchor => value === "ball" ? ballRef : ownRef(value);
const line = (from: SlotId | "ball", to: SlotId | "ball", type: TacticalAnnotation["type"], label: string): TacticalAnnotation => ({
  from: anchor(from), to: anchor(to), type, label,
});
const focus = (...slotIds: SlotId[]) => slotIds.map(ownRef);

const primaryFrame = (shape: string, positions: Record<string, Position>, functions: Record<string, TacticalFunction>): TeamFrame => ({
  teamId: SPAIN_ID,
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
    description: "左后卫内收形成三人底座，右后卫保持较高宽度。后腰在第一压迫线身后移动接应，建立不对称出球。",
    instruction: "一侧稳住结构，另一侧拉开出口", possessionTeamId: SPAIN_ID, opponentTeamId: GENERIC_OPPONENT_ID,
    ball: { x: 22, y: 43 }, focus: focus("gk", "lb", "lcb", "rcb", "dm"),
    metrics: { widthMeters: 72, lengthMeters: 56, protection: "3+2" },
    annotations: [line("gk", "lcb", "pass", "引出第一压迫"), line("lcb", "dm", "pass", "穿过第一线"), line("dm", "am", "pass", "向前找到自由人")],
    teams: {
      [SPAIN_ID]: primaryFrame("3-2 非对称出球", {
        gk:{x:8,y:50},lb:{x:28,y:20},lcb:{x:26,y:41},rcb:{x:26,y:67},rb:{x:41,y:86},dm:{x:41,y:51},lcm:{x:50,y:32},am:{x:55,y:68},lw:{x:61,y:11},st:{x:62,y:50},rw:{x:62,y:90},
      }, phaseFunctions.build),
      [GENERIC_OPPONENT_ID]: opponentFrame("4-3-3 中高位压迫", [{x:92,y:50},{x:82,y:15},{x:81,y:38},{x:81,y:62},{x:82,y:85},{x:65,y:24},{x:63,y:50},{x:65,y:76},{x:50,y:27},{x:48,y:50},{x:50,y:73}]),
    }, source: modelSource,
  },
  {
    id: "progress", short: "02", title: "中场推进", eyebrow: "持球 · 第二阶段", stage: "progression" as const,
    description: "左后卫留在三后卫底座，右后卫与后腰组成推进双支点；前方五人分别占据边路、肋部与中央通道。",
    instruction: "三人保护身后，双支点选择推进方向", possessionTeamId: SPAIN_ID, opponentTeamId: GENERIC_OPPONENT_ID,
    ball:{x:50,y:52}, focus:focus("dm","rb","lcm","am"), metrics:{widthMeters:76,lengthMeters:48,protection:"3+2"},
    annotations:[line("rcb","dm","pass","进入中轴"),line("dm","rb","pass","转向强侧"),line("lcm","lw","run","左肋前插")],
    teams:{
      [SPAIN_ID]:primaryFrame("3-2-5 动态站位",{gk:{x:15,y:50},lb:{x:37,y:20},lcb:{x:34,y:43},rcb:{x:34,y:68},rb:{x:53,y:76},dm:{x:51,y:46},lcm:{x:67,y:30},am:{x:69,y:69},lw:{x:72,y:10},st:{x:76,y:50},rw:{x:73,y:90}},phaseFunctions.progress),
      [GENERIC_OPPONENT_ID]:opponentFrame("4-3-3 中位块",[{x:93,y:50},{x:81,y:15},{x:79,y:38},{x:79,y:62},{x:81,y:85},{x:65,y:22},{x:64,y:50},{x:65,y:78},{x:57,y:25},{x:55,y:50},{x:57,y:75}]),
    },source:modelSource,
  },
  {
    id:"attack",short:"03",title:"进攻落位",eyebrow:"持球 · 终结阶段",stage:"attack" as const,
    description:"前场五人严格占据五条纵向通道。右后卫从双支点位置延后前插，左后卫继续留在三人保护底座。",
    instruction:"先固定五通道，再允许右后卫成为第六人",possessionTeamId:SPAIN_ID,opponentTeamId:GENERIC_OPPONENT_ID,
    ball:{x:78,y:84},focus:focus("rw","rb","am","st"),metrics:{widthMeters:78,lengthMeters:43,protection:"3+2"},
    annotations:[line("rw","am","pass","边锋回做"),line("am","rb","run","右后卫后插上"),line("lcm","st","run","攻击中锋身侧")],
    teams:{
      [SPAIN_ID]:primaryFrame("3-2-5 五通道",{gk:{x:18,y:50},lb:{x:40,y:19},lcb:{x:40,y:43},rcb:{x:40,y:68},rb:{x:62,y:78},dm:{x:55,y:49},lcm:{x:76,y:30},am:{x:77,y:69},lw:{x:80,y:9},st:{x:83,y:50},rw:{x:80,y:91}},phaseFunctions.attack),
      [GENERIC_OPPONENT_ID]:opponentFrame("4-3-3 低位块",[{x:94,y:50},{x:85,y:14},{x:83,y:38},{x:83,y:62},{x:85,y:86},{x:72,y:22},{x:71,y:50},{x:72,y:78},{x:65,y:28},{x:64,y:50},{x:65,y:72}]),
    },source:modelSource,
  },
  {
    id:"press",short:"04",title:"高位反抢",eyebrow:"转换 · 丢球瞬间",stage:"counterPress" as const,
    description:"丢球点附近三人立即围堵，后腰封锁向中锋的直传，右中卫向前保护反抢圈；门将同步前移清理身后。",
    instruction:"三人压球、两人封口；五秒失败立即回收",possessionTeamId:GENERIC_OPPONENT_ID,opponentTeamId:GENERIC_OPPONENT_ID,
    ball:{x:70,y:55},focus:focus("dm","lcm","am","st","rcb"),metrics:{widthMeters:62,lengthMeters:32,protection:"3+2"},
    annotations:[line("st","ball","press","直接压迫"),line("am","ball","press","夹击持球人"),line("dm","ball","cover","封锁中路出口")],
    teams:{
      [SPAIN_ID]:primaryFrame("五秒反抢圈",{gk:{x:29,y:50},lb:{x:48,y:18},lcb:{x:46,y:40},rcb:{x:48,y:64},rb:{x:57,y:82},dm:{x:58,y:50},lcm:{x:66,y:35},am:{x:69,y:62},lw:{x:72,y:14},st:{x:75,y:49},rw:{x:74,y:87}},phaseFunctions.press),
      [GENERIC_OPPONENT_ID]:opponentFrame("4-3-3 转换",[{x:93,y:50},{x:82,y:14},{x:80,y:37},{x:80,y:63},{x:82,y:86},{x:70,y:24},{x:70,y:55},{x:69,y:78},{x:58,y:26},{x:57,y:50},{x:58,y:74}]),
    },source:modelSource,
  },
  {
    id:"defend",short:"05",title:"低位防守",eyebrow:"无球 · 阵地防守",stage:"defend" as const,
    description:"反抢失败后，两侧边锋回到中场线，前腰上提到中锋身边，阵型退入紧凑4-4-2中低位防守块。",
    instruction:"前锋封后腰，四中场横移保护禁区中央",possessionTeamId:GENERIC_OPPONENT_ID,opponentTeamId:GENERIC_OPPONENT_ID,
    ball:{x:58,y:18},focus:focus("lb","lcb","rcb","rb","dm","lw","rw"),metrics:{widthMeters:44,lengthMeters:28,protection:"4+4"},
    annotations:[line("lw","lb","cover","边锋回收到位"),line("rw","rb","cover","封闭弱侧"),line("dm","ball","cover","保护禁区中央")],
    teams:{
      [SPAIN_ID]:primaryFrame("4-4-2 中低位块",{gk:{x:8,y:50},lb:{x:21,y:18},lcb:{x:20,y:40},rcb:{x:20,y:61},rb:{x:21,y:82},dm:{x:34,y:42},lcm:{x:34,y:64},am:{x:45,y:58},lw:{x:34,y:18},st:{x:46,y:42},rw:{x:34,y:83}},phaseFunctions.defend),
      [GENERIC_OPPONENT_ID]:opponentFrame("4-3-3 阵地进攻",[{x:92,y:50},{x:78,y:14},{x:77,y:38},{x:77,y:62},{x:78,y:86},{x:60,y:18},{x:58,y:48},{x:60,y:82},{x:44,y:25},{x:43,y:50},{x:44,y:75}]),
    },source:modelSource,
  },
];

export const spainTeam: TeamDefinition = {
  id: SPAIN_ID,
  slug: "spain",
  name: "西班牙",
  nameEn: "SPAIN",
  code: "ESP",
  baseFormation: "4-1-2-3",
  styleLabel: "POSITIONAL PLAY",
  flagBackground: "linear-gradient(to bottom, #aa151b 0 26%, #f1bf00 26% 74%, #aa151b 74%)",
  roleOrder,
  roles,
  formations: [
    { label: "4-1-2-3", detail: "当前 · 单后腰", active: true },
    { label: "4-3-3", detail: "同阵型家族" },
    { label: "4-2-3-1", detail: "双后腰" },
    { label: "4-4-2", detail: "无球形态" },
  ],
  principles: [
    { title: "控球不是目的", description: "通过安全传递引导对手移动，在空隙出现的瞬间加速进入下一条线。" },
    { title: "占满五条通道", description: "边锋、边后卫与中场不站在同一条线，让防守者不断面对交接选择。" },
    { title: "丢球后的五秒", description: "离球最近的人围堵，后腰封住中路，中卫前压缩短反抢距离。" },
  ],
  sequences: [{
    id: "spain-positional-play",
    title: "西班牙五阶段位置进攻",
    description: "从后场组织到低位防守的连续教练模型。",
    frames,
  }],
};
