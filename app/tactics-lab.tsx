"use client";

import { useEffect, useMemo, useState } from "react";

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
    description: "门将与中卫拉开宽度，后腰回到第一压迫线之后接球，主动邀请对手向前。",
    shape: "2-3 出球底座",
    instruction: "耐心吸引，再越过第一线",
    ball: { x: 20, y: 44 },
    focus: ["gk", "lcb", "rcb", "dm"],
    positions: {
      gk: { x: 8, y: 50 }, lb: { x: 28, y: 13 }, lcb: { x: 24, y: 36 }, rcb: { x: 24, y: 64 }, rb: { x: 28, y: 87 },
      dm: { x: 39, y: 50 }, lcm: { x: 48, y: 31 }, am: { x: 51, y: 67 }, lw: { x: 60, y: 12 }, st: { x: 61, y: 50 }, rw: { x: 60, y: 88 },
    },
  },
  {
    id: "progress",
    short: "02",
    title: "中场推进",
    eyebrow: "持球 · 第二阶段",
    description: "后腰决定转移方向，两名中场占据不同高度，边后卫开始越过中场线。",
    shape: "3-2-5 动态站位",
    instruction: "用宽度拉开，再从肋部穿过",
    ball: { x: 48, y: 57 },
    focus: ["dm", "lcm", "am", "rb"],
    positions: {
      gk: { x: 12, y: 50 }, lb: { x: 43, y: 15 }, lcb: { x: 32, y: 37 }, rcb: { x: 31, y: 63 }, rb: { x: 48, y: 84 },
      dm: { x: 47, y: 48 }, lcm: { x: 58, y: 31 }, am: { x: 61, y: 65 }, lw: { x: 69, y: 12 }, st: { x: 71, y: 49 }, rw: { x: 70, y: 89 },
    },
  },
  {
    id: "attack",
    short: "03",
    title: "进攻落位",
    eyebrow: "持球 · 终结阶段",
    description: "五人占满前场通道。中锋回撤牵制，前腰与右后卫在亚马尔式边锋身边形成连续配合。",
    shape: "前场五通道",
    instruction: "一侧吸引，弱侧终结",
    ball: { x: 78, y: 77 },
    focus: ["rw", "rb", "am", "st"],
    positions: {
      gk: { x: 16, y: 50 }, lb: { x: 55, y: 14 }, lcb: { x: 38, y: 36 }, rcb: { x: 38, y: 64 }, rb: { x: 72, y: 77 },
      dm: { x: 52, y: 50 }, lcm: { x: 67, y: 33 }, am: { x: 73, y: 62 }, lw: { x: 79, y: 10 }, st: { x: 82, y: 47 }, rw: { x: 81, y: 90 },
    },
  },
  {
    id: "press",
    short: "04",
    title: "高位反抢",
    eyebrow: "转换 · 丢球瞬间",
    description: "最近的球员立即围堵持球者，后腰前移封锁向中锋的直传，中卫同步压缩纵向距离。",
    shape: "五秒反抢圈",
    instruction: "先封中路，再逼向边线",
    ball: { x: 70, y: 55 },
    focus: ["dm", "lcm", "am", "st", "rw"],
    positions: {
      gk: { x: 18, y: 50 }, lb: { x: 49, y: 16 }, lcb: { x: 45, y: 38 }, rcb: { x: 45, y: 62 }, rb: { x: 55, y: 82 },
      dm: { x: 57, y: 49 }, lcm: { x: 65, y: 34 }, am: { x: 68, y: 62 }, lw: { x: 72, y: 15 }, st: { x: 76, y: 48 }, rw: { x: 75, y: 84 },
    },
  },
  {
    id: "defend",
    short: "05",
    title: "低位防守",
    eyebrow: "无球 · 阵地防守",
    description: "两侧边锋回到中场线，前腰上提到中锋身边，阵型由4-1-2-3收缩为紧凑4-4-2。",
    shape: "4-4-2 防守块",
    instruction: "保持横向紧凑，保护禁区中央",
    ball: { x: 67, y: 20 },
    focus: ["lb", "lcb", "rcb", "rb", "dm"],
    positions: {
      gk: { x: 8, y: 50 }, lb: { x: 25, y: 17 }, lcb: { x: 23, y: 39 }, rcb: { x: 23, y: 61 }, rb: { x: 25, y: 83 },
      dm: { x: 39, y: 43 }, lcm: { x: 39, y: 65 }, am: { x: 48, y: 58 }, lw: { x: 38, y: 17 }, st: { x: 50, y: 42 }, rw: { x: 39, y: 84 },
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
  const phase = phases[phaseIndex];
  const role = roles[selectedRole];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setPhaseIndex((current) => (current + 1) % phases.length),
      2800 / speed,
    );
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  const orderedRoles = useMemo(() => Object.keys(roles) as RoleId[], []);

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
              <button className="play-button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "暂停战术演示" : "播放战术演示"}>
                {playing ? "Ⅱ" : "▶"}
              </button>
              <button className="speed-button" onClick={() => setSpeed((value) => value === 1 ? 1.5 : value === 1.5 ? 0.75 : 1)} aria-label="切换播放速度">
                {speed}×
              </button>
            </div>
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
          </div>
        </div>

        <aside className="analysis-panel">
          <div className="panel-heading">
            <span>COACH'S BOARD</span>
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
