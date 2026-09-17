import { START_GOLD, START_ITEMS } from "./data.ts";
import type { GameState } from "./types.ts";

export const SAVE_KEY = "ba-lu-liezhuan-save";

export function freshState(): GameState {
  return {
    screen: "title",
    selectedHero: null,
    heroId: null,
    gold: START_GOLD,
    level: 1,
    exp: 0,
    hp: 36,
    bp: 0,
    inventory: { ...START_ITEMS },
    flags: {
      inquiredWeakness: false,
      gateCleared: false,
      roadCleared: false,
      bossCleared: false,
      chapter1Done: false,
      rested: false,
    },
    locationId: "xinye",
    pos: { x: 4, y: 3 },
    timeOfDay: "day",
    journal: ["初入新野。八路之中，你選了一人。新野並沒有黃巾的足跡，客棧、商販、里長都還在。"],
    dialogue: null,
    dialogueIndex: 0,
    afterDialogue: null,
    battle: null,
    menuOpen: false,
    menuTab: "status",
    pathPreview: null,
    lastPathResult: null,
  };
}

export function persist(state: GameState): void {
  if (typeof localStorage === "undefined") return;
  const slim: GameState = {
    ...state,
    screen: state.screen === "battle" ? "world" : state.screen,
    battle: null,
    pathPreview: null,
    menuOpen: false,
    dialogue: state.screen === "dialogue" ? state.dialogue : null,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
}

export function restore(): GameState | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...freshState(), ...parsed, battle: null, pathPreview: null, menuOpen: false };
  } catch {
    return null;
  }
}
