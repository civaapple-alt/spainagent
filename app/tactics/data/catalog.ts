import type { MatchupCatalogEntry, TeamCatalogEntry } from "../types";
import { franceTeam } from "./france";
import { spainFranceSequence } from "./matchups/spain-france";
import { spainTeam } from "./spain";

export const teamCatalog: TeamCatalogEntry[] = [
  { id: "ESP", slug: "spain", name: "西班牙", nameEn: "SPAIN", code: "ESP", status: "ready", definition: spainTeam },
  { id: "FRA", slug: "france", name: "法国", nameEn: "FRANCE", code: "FRA", status: "ready", definition: franceTeam },
  { id: "ENG", slug: "england", name: "英格兰", nameEn: "ENGLAND", code: "ENG", status: "research-planned" },
  { id: "ARG", slug: "argentina", name: "阿根廷", nameEn: "ARGENTINA", code: "ARG", status: "research-planned" },
];

export const matchupCatalog: MatchupCatalogEntry[] = [
  {
    id: "esp-fra", homeTeamId: "ESP", awayTeamId: "FRA", status: "ready",
    title: "西班牙 × 法国", competition: "2026 世界杯 · 半决赛", playedAt: "2026-07-14",
    score: { home: 2, away: 0 },
    summary: "西班牙通过中场控制、右侧局部优势与高强度无球压迫，切断法国前腰和中锋之间的连接。",
    sources: [
      { label: "比赛结果与进球事件", url: "https://apnews.com/article/france-spain-world-cup-score-87fb7740fa552edf4bfd28d0e8727c23" },
      { label: "Opta赛后战术与数据分析", url: "https://theanalyst.com/articles/spains-intensity-crushes-hype-france-attack-world-cup-stats" },
    ],
    sequence: spainFranceSequence,
  },
  { id: "esp-eng", homeTeamId: "ESP", awayTeamId: "ENG", status: "planned" },
  { id: "esp-arg", homeTeamId: "ESP", awayTeamId: "ARG", status: "planned" },
  { id: "fra-eng", homeTeamId: "FRA", awayTeamId: "ENG", status: "planned" },
  { id: "fra-arg", homeTeamId: "FRA", awayTeamId: "ARG", status: "planned" },
  { id: "eng-arg", homeTeamId: "ENG", awayTeamId: "ARG", status: "planned" },
];

export const readyTeams = teamCatalog.filter((team) => team.status === "ready" && team.definition);
export const plannedResearchTeams = teamCatalog.filter((team) => team.status !== "ready");
