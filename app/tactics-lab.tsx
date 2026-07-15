"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type RoleId =
  | "gk"
  | "lb"
  | "lcb"
  | "rcb"
  | "rb"
  | "dm"
  | "lcm"
  | "am"
  | "lw"
  | "st"
  | "rw";

type Position = { x: number; y: number };

type LineAnchor = RoleId | "ball";
type TacticalLine = {
  from: LineAnchor;
  to: LineAnchor;
  type: "pass" | "run" | "press" | "cover";
  label: string;
};

type Phase = {
  id: string;
  short: string;
  title: string;
  eyebrow: string;
  description: string;
  shape: string;
  instruction: string;
  ball: Position;
  focus: RoleId[];
  metrics: { width: string; length: string; protection: string };
  lines: TacticalLine[];
  opponents: Position[];
  positions: Record<RoleId, Position>;
};

const roles: Record<
  RoleId,
  {
    label: string;
    short: string;
    group: "门将" | "后卫" | "中场" | "前锋";
    headline: string;
    abilities: string[];
    responsibility: string;
    connections: string;
  }
> = {
  gk: {
    label: "门将",
    short: "GK",
    group: "门将",
    headline: "第一出球点，也是防线身后的清道夫",
    abilities: ["短传诱导逼抢", "长传转移", "禁区外预判"],
    responsibility: "观察对手第一线压迫，把球送到空出的中卫或后腰脚下。防线前压时主动保护身后空间。",
    connections: "优先连接两名中卫；对手封锁中路时直接寻找边后卫。",
  },
  lb: {
    label: "左后卫",
    short: "LB",
    group: "后卫",
    headline: "提供左路宽度，并负责攻防转换后的回追",
    abilities: ["连续跑动", "套边传中", "弱侧保护"],
    responsibility: "左边锋内收时沿边线前插；另一侧大举进攻时不过度压上，保持三人防守底座。",
    connections: "与左中卫、左中场和左边锋形成边路三角。",
  },
  lcb: {
    label: "左中卫",
    short: "LCB",
    group: "后卫",
    headline: "负责左侧出球和第一脚纵向传递",
    abilities: ["穿线传球", "对抗保护", "大范围转移"],
    responsibility: "吸引对手前锋后，把球穿过第一道压迫；左后卫前插时覆盖其身后。",
    connections: "主要寻找后腰与左中场，也可直接转移给右边锋。",
  },
  rcb: {
    label: "右中卫",
    short: "RCB",
    group: "后卫",
    headline: "维持防线高度，主动处理右侧纵深",
    abilities: ["向前防守", "速度回追", "持球推进"],
    responsibility: "当右后卫压上时向外侧移动；对手中锋回撤时判断是否跟出防区。",
    connections: "与后腰形成保护中轴，向右后卫和前腰输送直线球。",
  },
  rb: {
    label: "右后卫",
    short: "RB",
    group: "后卫",
    headline: "后排插上的第二进攻点",
    abilities: ["无球前插", "肋部配合", "高速回防"],
    responsibility: "根据右边锋站位选择套边或内插；不提前占据同一通道，等待对手注意力被吸引。",
    connections: "与右边锋、前腰做撞墙配合，正如波罗式后插上。",
  },
  dm: {
    label: "后腰",
    short: "6",
    group: "中场",
    headline: "后撤拿球、抗压转身、调节全队节奏",
    abilities: ["抗压接球", "节奏控制", "丢球拦截", "攻防扫描"],
    responsibility: "在两名中卫身前持续提供传球角度。判断何时慢下来重组、何时用一脚纵向球打穿中场。",
    connections: "连接后场与两名攻击中场；丢球时留在球后，封锁对手最直接的反击路线。",
  },
  lcm: {
    label: "左中场",
    short: "8",
    group: "中场",
    headline: "把控球从安全区域带入进攻三区",
    abilities: ["带球推进", "斜向前插", "二点球争夺"],
    responsibility: "接应后腰并向左肋部移动，在中锋回撤后攻击其让出的空间。",
    connections: "为左边锋创造一对一，同时与后腰保持回传线路。",
  },
  am: {
    label: "前腰",
    short: "10",
    group: "中场",
    headline: "在两线之间转身，制造最后一传",
    abilities: ["狭小空间处理", "无球换位", "最后一传"],
    responsibility: "游走在对手中场与后卫之间；无球时上提，与中锋组成第一道4-4-2压迫。",
    connections: "优先连接中锋和右边锋，也为右后卫的后插上做墙。",
  },
  lw: {
    label: "左边锋",
    short: "LW",
    group: "前锋",
    headline: "拉开或内收，改变左路通道分配",
    abilities: ["无球内收", "弱侧冲刺", "反抢覆盖"],
    responsibility: "左后卫套边时进入肋部；球在右侧时攻击远门柱。防守阶段回收到中场线。",
    connections: "与左后卫、左中场轮换位置，避免三人站在同一直线上。",
  },
  st: {
    label: "中锋",
    short: "9",
    group: "前锋",
    headline: "移动型九号：回撤接应后再攻击禁区",
    abilities: ["背身做球", "禁区终结", "横向牵制"],
    responsibility: "不固定站在两名中卫之间。适时回撤带走中卫，为边锋和攻击中场打开身后空间。",
    connections: "作为两侧进攻的支点，与前腰形成最短距离的撞墙组合。",
  },
  rw: {
    label: "右边锋",
    short: "RW",
    group: "前锋",
    headline: "一对一爆点，也是右侧战术的牵制核心",
    abilities: ["边线一对一", "内切创造", "吸引双人防守"],
    responsibility: "先保持最大宽度拉开防线，再根据防守者重心选择内切、下底或回做。",
    connections: "吸引边后卫后为右后卫腾出纵向通道，与前腰形成局部人数优势。",
  },
};

const phases: Phase[] = [
  {
    id: "build",
    short: "01",
    title: "后场组织",
    eyebrow: "持球 · 第一阶段",
    description: "左后卫内收形成三人底座，右后卫保持较高宽度。后腰在第一压迫线身后移动接应，建立不对称出球。",
    shape: "3-2 非对称出球",
    instruction: "一侧稳住结构，另一侧拉开出口",
    ball: { x: 22, y: 43 },
    focus: ["gk", "lb", "lcb", "rcb", "dm"],
    metrics: { width: "72m", length: "56m", protection: "3+2" },
    lines: [
      { from: "gk", to: "lcb", type: "pass", label: "引出第一压迫" },
      { from: "lcb", to: "dm", type: "pass", label: "穿过第一线" },
      { from: "dm", to: "am", type: "pass", label: "向前找到自由人" },
    ],
    opponents: [
      { x: 92, y: 50 }, { x: 82, y: 15 }, { x: 81, y: 38 }, { x: 81, y: 62 }, { x: 82, y: 85 },
      { x: 65, y: 24 }, { x: 63, y: 50 }, { x: 65, y: 76 }, { x: 50, y: 27 }, { x: 48, y: 50 }, { x: 50, y: 73 },
    ],
    positions: {
      gk: { x: 8, y: 50 }, lb: { x: 28, y: 20 }, lcb: { x: 26, y: 41 }, rcb: { x: 26, y: 67 }, rb: { x: 41, y: 86 },
      dm: { x: 41, y: 51 }, lcm: { x: 50, y: 32 }, am: { x: 55, y: 68 }, lw: { x: 61, y: 11 }, st: { x: 62, y: 50 }, rw: { x: 62, y: 90 },
    },
  },
  {
    id: "progress",
    short: "02",
    title: "中场推进",
    eyebrow: "持球 · 第二阶段",
    description: "左后卫留在三后卫底座，右后卫与后腰组成推进双支点；前方五人分别占据边路、肋部与中央通道。",
    shape: "3-2-5 动态站位",
    instruction: "三人保护身后，双支点选择推进方向",
    ball: { x: 50, y: 52 },
    focus: ["dm", "rb", "lcm", "am"],
    metrics: { width: "76m", length: "48m", protection: "3+2" },
    lines: [
      { from: "rcb", to: "dm", type: "pass", label: "进入中轴" },
      { from: "dm", to: "rb", type: "pass", label: "转向强侧" },
      { from: "lcm", to: "lw", type: "run", label: "左肋前插" },
    ],
    opponents: [
      { x: 93, y: 50 }, { x: 81, y: 15 }, { x: 79, y: 38 }, { x: 79, y: 62 }, { x: 81, y: 85 },
      { x: 65, y: 22 }, { x: 64, y: 50 }, { x: 65, y: 78 }, { x: 57, y: 25 }, { x: 55, y: 50 }, { x: 57, y: 75 },
    ],
    positions: {
      gk: { x: 15, y: 50 }, lb: { x: 37, y: 20 }, lcb: { x: 34, y: 43 }, rcb: { x: 34, y: 68 }, rb: { x: 53, y: 76 },
      dm: { x: 51, y: 46 }, lcm: { x: 67, y: 30 }, am: { x: 69, y: 69 }, lw: { x: 72, y: 10 }, st: { x: 76, y: 50 }, rw: { x: 73, y: 90 },
    },
  },
  {
    id: "attack",
    short: "03",
    title: "进攻落位",
    eyebrow: "持球 · 终结阶段",
    description: "前场五人严格占据五条纵向通道。右后卫从双支点位置延后前插，左后卫继续留在三人保护底座。",
    shape: "3-2-5 五通道",
    instruction: "先固定五通道，再允许右后卫成为第六人",
    ball: { x: 78, y: 84 },
    focus: ["rw", "rb", "am", "st"],
    metrics: { width: "78m", length: "43m", protection: "3+2" },
    lines: [
      { from: "rw", to: "am", type: "pass", label: "边锋回做" },
      { from: "am", to: "rb", type: "run", label: "右后卫后插上" },
      { from: "lcm", to: "st", type: "run", label: "攻击中锋身侧" },
    ],
    opponents: [
      { x: 94, y: 50 }, { x: 85, y: 14 }, { x: 83, y: 38 }, { x: 83, y: 62 }, { x: 85, y: 86 },
      { x: 72, y: 22 }, { x: 71, y: 50 }, { x: 72, y: 78 }, { x: 65, y: 28 }, { x: 64, y: 50 }, { x: 65, y: 72 },
    ],
    positions: {
      gk: { x: 18, y: 50 }, lb: { x: 40, y: 19 }, lcb: { x: 40, y: 43 }, rcb: { x: 40, y: 68 }, rb: { x: 62, y: 78 },
      dm: { x: 55, y: 49 }, lcm: { x: 76, y: 30 }, am: { x: 77, y: 69 }, lw: { x: 80, y: 9 }, st: { x: 83, y: 50 }, rw: { x: 80, y: 91 },
    },
  },
  {
    id: "press",
    short: "04",
    title: "高位反抢",
    eyebrow: "转换 · 丢球瞬间",
    description: "丢球点附近三人立即围堵，后腰封锁向中锋的直传，右中卫向前保护反抢圈；门将同步前移清理身后。",
    shape: "五秒反抢圈",
    instruction: "三人压球、两人封口；五秒失败立即回收",
    ball: { x: 70, y: 55 },
    focus: ["dm", "lcm", "am", "st", "rcb"],
    metrics: { width: "62m", length: "32m", protection: "3+2" },
    lines: [
      { from: "st", to: "ball", type: "press", label: "直接压迫" },
      { from: "am", to: "ball", type: "press", label: "夹击持球人" },
      { from: "dm", to: "ball", type: "cover", label: "封锁中路出口" },
    ],
    opponents: [
      { x: 93, y: 50 }, { x: 82, y: 14 }, { x: 80, y: 37 }, { x: 80, y: 63 }, { x: 82, y: 86 },
      { x: 70, y: 24 }, { x: 70, y: 55 }, { x: 69, y: 78 }, { x: 58, y: 26 }, { x: 57, y: 50 }, { x: 58, y: 74 },
    ],
    positions: {
      gk: { x: 29, y: 50 }, lb: { x: 48, y: 18 }, lcb: { x: 46, y: 40 }, rcb: { x: 48, y: 64 }, rb: { x: 57, y: 82 },
      dm: { x: 58, y: 50 }, lcm: { x: 66, y: 35 }, am: { x: 69, y: 62 }, lw: { x: 72, y: 14 }, st: { x: 75, y: 49 }, rw: { x: 74, y: 87 },
    },
  },
  {
    id: "defend",
    short: "05",
    title: "低位防守",
    eyebrow: "无球 · 阵地防守",
    description: "反抢失败后，两侧边锋回到中场线，前腰上提到中锋身边，阵型退入紧凑4-4-2中低位防守块。",
    shape: "4-4-2 中低位块",
    instruction: "前锋封后腰，四中场横移保护禁区中央",
    ball: { x: 58, y: 18 },
    focus: ["lb", "lcb", "rcb", "rb", "dm", "lw", "rw"],
    metrics: { width: "44m", length: "28m", protection: "4+4" },
    lines: [
      { from: "lw", to: "lb", type: "cover", label: "边锋回收到位" },
      { from: "rw", to: "rb", type: "cover", label: "封闭弱侧" },
      { from: "dm", to: "ball", type: "cover", label: "保护禁区中央" },
    ],
    opponents: [
      { x: 92, y: 50 }, { x: 78, y: 14 }, { x: 77, y: 38 }, { x: 77, y: 62 }, { x: 78, y: 86 },
      { x: 60, y: 18 }, { x: 58, y: 48 }, { x: 60, y: 82 }, { x: 44, y: 25 }, { x: 43, y: 50 }, { x: 44, y: 75 },
    ],
    positions: {
      gk: { x: 8, y: 50 }, lb: { x: 21, y: 18 }, lcb: { x: 20, y: 40 }, rcb: { x: 20, y: 61 }, rb: { x: 21, y: 82 },
      dm: { x: 34, y: 42 }, lcm: { x: 34, y: 64 }, am: { x: 45, y: 58 }, lw: { x: 34, y: 18 }, st: { x: 46, y: 42 }, rw: { x: 34, y: 83 },
    },
  },
];

const formations = [
  { label: "4-1-2-3", detail: "当前 · 单后腰", active: true },
  { label: "4-3-3", detail: "同阵型家族", active: false },
  { label: "4-2-3-1", detail: "双后腰", active: false },
  { label: "4-4-2", detail: "无球形态", active: false },
];

export function TacticsLab() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [selectedRole, setSelectedRole] = useState<RoleId>("dm");
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showOpponents, setShowOpponents] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [showVision, setShowVision] = useState(true);
  const [showDefensiveZone, setShowDefensiveZone] = useState(true);
  const [showProgressRoute, setShowProgressRoute] = useState(true);
  const phase = phases[phaseIndex];
  const role = roles[selectedRole];
  const phaseDuration = 5600 / speed;
  const isDefensivePhase = phase.id === "press" || phase.id === "defend";
  const isPossessionPhase = phase.id === "build" || phase.id === "progress" || phase.id === "attack";

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setPhaseIndex((current) => (current + 1) % phases.length),
      phaseDuration,
    );
    return () => window.clearInterval(timer);
  }, [playing, phaseDuration]);

  const orderedRoles = useMemo(() => Object.keys(roles) as RoleId[], []);
  const selectedPosition = phase.positions[selectedRole];
  const angleBetween = (from: Position, to: Position) => {
    const dx = to.x - from.x;
    const dy = (to.y - from.y) / 1.78;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };
  const getVisionAngle = () => {
    if (isDefensivePhase) return angleBetween(selectedPosition, phase.ball);
    const ballDx = phase.ball.x - selectedPosition.x;
    const ballDy = (phase.ball.y - selectedPosition.y) / 1.78;
    const distance = Math.sqrt(ballDx * ballDx + ballDy * ballDy) || 1;
    const scanBias = role.group === "中场" ? 1.15 : role.group === "后卫" || role.group === "门将" ? 1.35 : 1;
    return Math.atan2(ballDy / distance, ballDx / distance + scanBias) * 180 / Math.PI;
  };
  const visionAngle = getVisionAngle();
  const visionStyle = {
    left: `${selectedPosition.x}%`,
    top: `${selectedPosition.y}%`,
    "--vision-angle": `${visionAngle}deg`,
    "--vision-counter-angle": `${-visionAngle}deg`,
  } as CSSProperties;
  const getProgressRouteStyle = () => {
    const advance = role.group === "门将" ? 15 : role.group === "后卫" ? 23 : role.group === "中场" ? 20 : 13;
    const target = {
      x: Math.min(95, selectedPosition.x + advance),
      y: selectedPosition.y + (50 - selectedPosition.y) * (role.group === "前锋" ? 0.08 : 0.2),
    };
    const dx = target.x - selectedPosition.x;
    const dy = (target.y - selectedPosition.y) / 1.78;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return {
      left: `${selectedPosition.x}%`,
      top: `${selectedPosition.y}%`,
      width: `${Math.sqrt(dx * dx + dy * dy)}%`,
      "--route-angle": `${angle}deg`,
      "--route-counter-angle": `${-angle}deg`,
    } as CSSProperties;
  };
  const getLineStyle = (line: TacticalLine) => {
    const from = line.from === "ball" ? phase.ball : phase.positions[line.from];
    const to = line.to === "ball" ? phase.ball : phase.positions[line.to];
    const dx = to.x - from.x;
    const dy = (to.y - from.y) / 1.78;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return {
      left: `${from.x}%`,
      top: `${from.y}%`,
      width: `${Math.sqrt(dx * dx + dy * dy)}%`,
      "--line-angle": `${angle}deg`,
      "--line-counter-angle": `${-angle}deg`,
      "--line-start": line.from === "ball" ? "12px" : "clamp(17px, 2vw, 22px)",
      "--line-end": line.to === "ball" ? "12px" : "clamp(17px, 2vw, 22px)",
    } as CSSProperties;
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="国家队战术板首页">
          <span className="brand-mark">T</span>
          <span>
            <strong>TACTICA</strong>
            <small>国家队战术板</small>
          </span>
        </a>
        <nav className="main-nav" aria-label="主导航">
          <button className="nav-item active">战术演示</button>
          <button className="nav-item" disabled>世界杯球队 <span>后续</span></button>
          <button className="nav-item" disabled>阵型资料库 <span>后续</span></button>
        </nav>
        <div className="edition"><i /> 2026 世界杯 · 阶段一</div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">SPAIN · POSITIONAL PLAY</p>
          <h1>看见阵型，<em>如何真正移动。</em></h1>
          <p className="hero-description">从位置职责出发，拆解球队在持球、转换与防守中的整体移动。这里没有球星卡，只有教练想让每个位置完成的任务。</p>
        </div>
        <div className="team-card">
          <div className="flag" aria-hidden="true"><span /></div>
          <div><small>当前球队</small><strong>西班牙</strong></div>
          <div className="team-meta"><span>ESP</span><span>4-1-2-3</span></div>
        </div>
      </section>

      <section className="workspace" aria-label="西班牙动态战术演示">
        <div className="board-column">
          <div className="board-toolbar">
            <div className="phase-tabs" role="tablist" aria-label="攻防阶段">
              {phases.map((item, index) => (
                <button
                  key={item.id}
                  className={index === phaseIndex ? "phase-tab active" : "phase-tab"}
                  onClick={() => { setPhaseIndex(index); setPlaying(false); }}
                  role="tab"
                  aria-selected={index === phaseIndex}
                >
                  <span>{item.short}</span>{item.title}
                </button>
              ))}
            </div>
            <div className="playback">
              <button className="layer-button" onClick={() => setShowOpponents((value) => !value)} aria-pressed={showOpponents} aria-label="显示或隐藏对手站位">
                对手 <b>{showOpponents ? "开" : "关"}</b>
              </button>
              <button className="layer-button" onClick={() => setShowLines((value) => !value)} aria-pressed={showLines} aria-label="显示或隐藏战术线路">
                线路 <b>{showLines ? "开" : "关"}</b>
              </button>
              <button className="play-button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "暂停战术演示" : "播放战术演示"}>
                {playing ? "Ⅱ" : "▶"}
              </button>
              <button className="speed-button" onClick={() => setSpeed((value) => value === 1 ? 1.5 : value === 1.5 ? 0.75 : 1)} aria-label="切换播放速度">
                {speed}×
              </button>
            </div>
            <div
              key={`${phase.id}-${playing}-${speed}`}
              className={`auto-timer ${playing ? "running" : ""}`}
              style={{ animationDuration: `${phaseDuration}ms` }}
            />
          </div>

          <div className={`pitch phase-${phase.id}`}>
            <div className="pitch-grain" />
            <div className="pitch-boundary" />
            <div className="halfway-line" />
            <div className="center-circle" />
            <div className="center-dot" />
            <div className="penalty-area left"><span /></div>
            <div className="penalty-area right"><span /></div>
            <div className="goal left" />
            <div className="goal right" />
            <div className="attack-direction">进攻方向 <b>→</b></div>
            <div className="zone-label own">组织区</div>
            <div className="zone-label middle">推进区</div>
            <div className="zone-label final">终结区</div>

            <div className="live-coach">
              <span>LIVE COACH · 0{phaseIndex + 1}</span>
              <strong>{phase.shape}</strong>
              <small>{phase.instruction}</small>
            </div>
            <div className="pitch-metrics" aria-label="当前阵型战术指标">
              <span><small>宽度</small><b>{phase.metrics.width}</b></span>
              <span><small>纵深</small><b>{phase.metrics.length}</b></span>
              <span><small>身后保护</small><b>{phase.metrics.protection}</b></span>
            </div>
            <div className="guidance-controls" aria-label="球员指导图层">
              <span>指导模型 · {role.label}</span>
              <div>
                <button onClick={() => setShowVision((value) => !value)} aria-pressed={showVision}>视角</button>
                <button onClick={() => setShowDefensiveZone((value) => !value)} aria-pressed={showDefensiveZone} disabled={!isDefensivePhase}>防区</button>
                <button onClick={() => setShowProgressRoute((value) => !value)} aria-pressed={showProgressRoute} disabled={!isPossessionPhase}>推进</button>
              </div>
            </div>

            {showVision && (
              <div className={`vision-cone ${role.group}`} style={visionStyle} aria-hidden="true">
                <span>主要视角</span>
              </div>
            )}
            {showDefensiveZone && isDefensivePhase && (
              <div className={`defensive-zone ${role.group}`} style={visionStyle} aria-hidden="true">
                <span>防守责任区</span>
              </div>
            )}
            {showProgressRoute && isPossessionPhase && (
              <div className="progress-corridor" style={getProgressRouteStyle()} aria-hidden="true">
                <i />
                <span>首选推进走廊</span>
              </div>
            )}

            {showOpponents && phase.opponents.map((position, index) => (
              <div
                key={`opponent-${index}`}
                className="opponent-node"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                aria-hidden="true"
              >
                <span>{index === 0 ? "GK" : index}</span>
              </div>
            ))}

            {showLines && phase.lines.map((line, index) => (
              <div
                key={`${phase.id}-${line.type}-${index}`}
                className={`tactical-line ${line.type}`}
                style={getLineStyle(line)}
                aria-hidden="true"
              >
                <i className="tactical-stroke" />
                <span>{line.label}</span>
              </div>
            ))}

            <div className="focus-halo" style={{ left: `${phase.ball.x}%`, top: `${phase.ball.y}%` }} />
            <div className="ball" style={{ left: `${phase.ball.x}%`, top: `${phase.ball.y}%` }} aria-label="足球位置"><span /></div>

            {orderedRoles.map((id) => {
              const position = phase.positions[id];
              const item = roles[id];
              const focused = phase.focus.includes(id);
              return (
                <button
                  key={id}
                  className={`player-node ${item.group} ${focused ? "focused" : ""} ${selectedRole === id ? "selected" : ""}`}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  onClick={() => setSelectedRole(id)}
                  aria-label={`查看${item.label}的职责`}
                  aria-pressed={selectedRole === id}
                >
                  <span className="player-disc">{item.short}</span>
                  <span className="player-label">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="phase-progress" aria-label="当前战术阶段">
            <div className="progress-copy">
              <span>{phase.eyebrow}</span>
              <strong>{phase.title}</strong>
              <p>{phase.description}</p>
            </div>
            <div className="progress-track">
              {phases.map((item, index) => (
                <button key={item.id} className={index === phaseIndex ? "active" : index < phaseIndex ? "passed" : ""} onClick={() => { setPhaseIndex(index); setPlaying(false); }} aria-label={`切换到${item.title}`}>
                  <i />
                </button>
              ))}
            </div>
            <div className="pitch-legend" aria-label="战术线路图例">
              <span><i className="pass" />传球</span>
              <span><i className="run" />跑动</span>
              <span><i className="press" />压迫</span>
              <span><i className="cover" />保护</span>
            </div>
          </div>
        </div>

        <aside className="analysis-panel">
          <div className="panel-heading">
            <span>COACH&apos;S BOARD</span>
            <strong>教练战术安排</strong>
          </div>

          <div className="shape-card">
            <div><small>基础阵型</small><strong>4-1-2-3</strong></div>
            <span className="shape-arrow">→</span>
            <div><small>当前形态</small><strong>{phase.shape}</strong></div>
          </div>

          <div className="coach-note">
            <span className="note-index">0{phaseIndex + 1}</span>
            <div><small>本阶段核心指令</small><strong>{phase.instruction}</strong></div>
          </div>

          <div className="role-card">
            <div className="role-heading">
              <span className={`role-badge ${role.group}`}>{role.short}</span>
              <div><small>{role.group} · 位置职责</small><h2>{role.label}</h2></div>
            </div>
            <h3>{role.headline}</h3>
            <p>{role.responsibility}</p>
            <div className="ability-list">
              {role.abilities.map((ability) => <span key={ability}>{ability}</span>)}
            </div>
            <div className="connection-note"><i /> <span><small>协作关系</small>{role.connections}</span></div>
          </div>

          <div className="formation-family">
            <div className="section-title"><span>阵型分类</span><small>FORMATION FAMILY</small></div>
            <div className="formation-grid">
              {formations.map((item) => (
                <div key={item.label} className={item.active ? "formation-chip active" : "formation-chip"}>
                  <strong>{item.label}</strong><span>{item.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="principles">
        <div className="section-lead">
          <span>西班牙 · 战术原则</span>
          <h2>阵型是起点，<br />职责决定变化。</h2>
        </div>
        <article><span>01</span><h3>控球不是目的</h3><p>通过安全传递引导对手移动，在空隙出现的瞬间加速进入下一条线。</p></article>
        <article><span>02</span><h3>占满五条通道</h3><p>边锋、边后卫与中场不站在同一条线，让防守者不断面对交接选择。</p></article>
        <article><span>03</span><h3>丢球后的五秒</h3><p>离球最近的人围堵，后腰封住中路，中卫前压缩短反抢距离。</p></article>
      </section>

      <footer>
        <div><strong>TACTICA</strong><span>第一阶段原型 · 西班牙国家队</span></div>
        <p>后续计划：世界杯参赛队入口 · 多阵型对比 · 比赛场景时间轴</p>
      </footer>
    </main>
  );
}
