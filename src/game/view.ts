import { PATH_LABEL, TOUCH_MIN } from "./data.ts";
import type {
  BattleState,
  CommandId,
  HeroId,
  LocationId,
  MapDef,
  NpcDef,
  PathActionId,
  Pos,
  StoryFlags,
  TimeOfDay,
} from "./types.ts";

export const DESIGN_TOKENS = {
  gold: "#e4c56a",
  ink: "#0b0e14",
  panel: "#12141c",
  serif: '"Noto Serif TC", "Songti TC", serif',
  sans: '"Noto Sans TC", "PingFang TC", sans-serif',
  forbiddenFont: null as string | null,
  forbiddenGreen: null as string | null,
};

export const COMMANDS: { id: CommandId; label: string }[] = [
  { id: "attack", label: "攻擊" },
  { id: "skill", label: "戰技" },
  { id: "defend", label: "防禦" },
  { id: "item", label: "物件" },
];

export function chebyshev(a: Pos, b: Pos): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function isNear(a: Pos, b: Pos, range = 1): boolean {
  return chebyshev(a, b) <= range && !(a.x === b.x && a.y === b.y);
}

export function sameTile(a: Pos, b: Pos): boolean {
  return a.x === b.x && a.y === b.y;
}

export function nearbyNpc(map: MapDef, pos: Pos): NpcDef | null {
  return map.npcs.find((n) => isNear(pos, n.pos) || sameTile(pos, n.pos)) ?? null;
}

export function pathActionVisible(map: MapDef, pos: Pos): boolean {
  return nearbyNpc(map, pos) !== null;
}

export function chapterGoal(_locationId: LocationId, flags: StoryFlags): string {
  if (!flags.inquiredWeakness) return "靠近人並使用路徑行動。先把黃巾的弱點問清楚。";
  if (!flags.gateCleared) return "出城門，削盾崩解攔路黃巾。";
  if (!flags.roadCleared) return "沿官道北上，擊破伏兵。";
  if (!flags.bossCleared) return "北營渠帥：蓄力多段，趁崩解窗口了結。";
  return "第一章已通關。可回客棧養傷，或開新的列傳。";
}

export function timeLabel(t: TimeOfDay): string {
  return { dawn: "黎明", day: "晝", dusk: "黃昏", night: "夜" }[t];
}

export function minimapMarks(
  map: MapDef,
  pos: Pos,
): { x: number; y: number; kind: "you" | "npc" | "exit" }[] {
  const marks: { x: number; y: number; kind: "you" | "npc" | "exit" }[] = [
    { x: pos.x, y: pos.y, kind: "you" },
  ];
  for (const n of map.npcs) marks.push({ x: n.pos.x, y: n.pos.y, kind: "npc" });
  for (const e of map.exits) marks.push({ x: e.pos.x, y: e.pos.y, kind: "exit" });
  return marks;
}

export function turnOrderActors(battle: BattleState): { id: string; name: string; active: boolean; enemy: boolean; heroId?: HeroId }[] {
  return battle.turnQueue.map((id, i) => {
    const unit = [...battle.allies, ...battle.enemies].find((u) => u.id === id);
    return {
      id,
      name: unit?.name ?? id,
      active: i === battle.turnIndex,
      enemy: Boolean(unit?.isEnemy),
      heroId: unit?.heroId,
    };
  });
}

export function currentActor(battle: BattleState) {
  const id = battle.turnQueue[battle.turnIndex];
  return [...battle.allies, ...battle.enemies].find((u) => u.id === id) ?? null;
}

export function isAllyTurn(battle: BattleState): boolean {
  const unit = currentActor(battle);
  return Boolean(unit && !unit.isEnemy);
}

export function boostOrbs(bp: number, selected: number): { index: number; filled: boolean; chosen: boolean }[] {
  return [0, 1, 2].map((index) => ({
    index,
    filled: index < bp,
    chosen: index < selected,
  }));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function motionDuration(seconds: number): number {
  return prefersReducedMotion() ? 0 : seconds;
}

export function touchTargetMin(): number {
  return TOUCH_MIN;
}

export function pathActionTitle(action: PathActionId): string {
  return PATH_LABEL[action];
}

export function noHorizontalPageScrollCss(): string {
  return "overflow-x:hidden;max-width:100vw;";
}
