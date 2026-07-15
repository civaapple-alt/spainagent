import type { MatchupCatalogEntry, TeamCatalogEntry } from "../types";
import { spainTeam } from "./spain";

export const teamCatalog: TeamCatalogEntry[] = [
  { id: "ESP", slug: "spain", name: "西班牙", nameEn: "SPAIN", code: "ESP", status: "ready", definition: spainTeam },
  { id: "FRA", slug: "france", name: "法国", nameEn: "FRANCE", code: "FRA", status: "research-planned" },
  { id: "ENG", slug: "england", name: "英格兰", nameEn: "ENGLAND", code: "ENG", status: "research-planned" },
  { id: "ARG", slug: "argentina", name: "阿根廷", nameEn: "ARGENTINA", code: "ARG", status: "research-planned" },
];

export const matchupCatalog: MatchupCatalogEntry[] = [
  { id: "esp-fra", homeTeamId: "ESP", awayTeamId: "FRA", status: "planned" },
  { id: "esp-eng", homeTeamId: "ESP", awayTeamId: "ENG", status: "planned" },
  { id: "esp-arg", homeTeamId: "ESP", awayTeamId: "ARG", status: "planned" },
  { id: "fra-eng", homeTeamId: "FRA", awayTeamId: "ENG", status: "planned" },
  { id: "fra-arg", homeTeamId: "FRA", awayTeamId: "ARG", status: "planned" },
  { id: "eng-arg", homeTeamId: "ENG", awayTeamId: "ARG", status: "planned" },
];

export const readyTeams = teamCatalog.filter((team) => team.status === "ready" && team.definition);
export const plannedResearchTeams = teamCatalog.filter((team) => team.status !== "ready");
