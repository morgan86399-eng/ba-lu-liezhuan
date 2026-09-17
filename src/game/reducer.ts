import { backBattle, createBattle, pickBoost, pickCommand, pickItem, pickSkill, pickTarget } from "./combat.ts";
import { ENCOUNTERS, heroById, INN_COST, ITEMS, MAPS } from "./data.ts";
import { executePathAction, previewPathAction } from "./pathAction.ts";
import { freshState, persist } from "./save.ts";
import type { BattleState, CommandId, GameState, HeroId, ItemId, LocationId, MenuTab, Pos } from "./types.ts";
import { nearbyNpc, sameTile } from "./view.ts";

export type Action =
  | { type: "START" }
  | { type: "HOVER_HERO"; id: HeroId }
  | { type: "CONFIRM_HERO" }
  | { type: "DIALOGUE_NEXT" }
  | { type: "MOVE"; dx: number; dy: number }
  | { type: "TALK" }
  | { type: "PATH_OPEN" }
  | { type: "PATH_CANCEL" }
  | { type: "PATH_DO"; roll?: number }
  | { type: "MENU_OPEN" }
  | { type: "MENU_CLOSE" }
  | { type: "MENU_TAB"; tab: MenuTab }
  | { type: "BUY"; item: ItemId }
  | { type: "REST" }
  | { type: "SAVE" }
  | { type: "LOAD"; state: GameState }
  | { type: "TITLE" }
  | { type: "BATTLE_CMD"; cmd: CommandId }
  | { type: "BATTLE_SKILL"; skillId: string }
  | { type: "BATTLE_ITEM"; item: ItemId }
  | { type: "BATTLE_BOOST"; boost: 0 | 1 | 2 | 3 }
  | { type: "BATTLE_TARGET"; id: string }
  | { type: "BATTLE_BACK" }
  | { type: "BATTLE_LEAVE" }
  | { type: "CLEAR_TOAST" };

function blocked(map: (typeof MAPS)[LocationId], pos: Pos): boolean {
  if (pos.x < 0 || pos.y < 0 || pos.x >= map.width || pos.y >= map.height) return true;
  return map.blocked.some((b) => b.x === pos.x && b.y === pos.y);
}

function startEncounter(state: GameState, id: keyof typeof ENCOUNTERS): GameState {
  if (!state.heroId) return state;
  return {
    ...state,
    screen: "battle",
    battle: createBattle(id, state.heroId, state.hp, state.bp),
    menuOpen: false,
    pathPreview: null,
  };
}

function flagForBattle(state: GameState, battle: string): boolean {
  if (battle === "gate") return state.flags.gateCleared;
  if (battle === "road") return state.flags.roadCleared;
  if (battle === "boss") return state.flags.bossCleared;
  return false;
}

function yieldCombat(
  battle: BattleState,
  ev:
    | { kind: "cmd"; cmd: CommandId }
    | { kind: "skill"; skillId: string }
    | { kind: "item"; item: ItemId }
    | { kind: "boost"; boost: 0 | 1 | 2 | 3 }
    | { kind: "target"; id: string }
    | { kind: "back" },
): BattleState {
  if (ev.kind === "cmd") return pickCommand(battle, ev.cmd);
  if (ev.kind === "skill") return pickSkill(battle, ev.skillId);
  if (ev.kind === "item") return pickItem(battle, ev.item);
  if (ev.kind === "boost") return pickBoost(battle, ev.boost);
  if (ev.kind === "target") return pickTarget(battle, ev.id);
  return backBattle(battle);
}

function finishBattle(state: GameState): GameState {
  const battle = state.battle;
  if (!battle || !state.heroId) return { ...state, screen: "world", battle: null };
  const ally = battle.allies[0];
  const hp = Math.max(1, ally.hp);
  const bp = ally.bp;
  if (battle.phase === "lost") {
    const hero = heroById(state.heroId);
    return {
      ...state,
      hp: hero.maxHp,
      bp: 0,
      screen: "dialogue",
      battle: null,
      locationId: "xinye",
      pos: MAPS.xinye.start,
      dialogue: [{ speaker: "旁白", text: "你被抬回新野客棧。再整軍出發。" }],
      dialogueIndex: 0,
      afterDialogue: "world",
    };
  }
  if (battle.phase !== "won") return { ...state, hp, bp, screen: "world", battle: null };

  const flags = { ...state.flags };
  let journal = state.journal;
  let nextLoc: LocationId = state.locationId;
  let pos = state.pos;
  let ending = false;
  if (battle.encounterId === "gate") {
    flags.gateCleared = true;
    journal = [...journal, "城門黃巾已破，官道可通。"];
    nextLoc = "road";
    pos = MAPS.road.start;
  } else if (battle.encounterId === "road") {
    flags.roadCleared = true;
    journal = [...journal, "官道伏兵已清，北營在望。"];
    nextLoc = "northcamp";
    pos = MAPS.northcamp.start;
  } else if (battle.encounterId === "boss") {
    flags.bossCleared = true;
    flags.chapter1Done = true;
    journal = [...journal, "北營渠帥授首。第一章終。"];
    ending = true;
  } else if (battle.encounterId === "elder") {
    journal = [...journal, "里長認輸，願指一條路：黃巾懼刀、槍與火。"];
    flags.inquiredWeakness = true;
  }
  if (ending) {
    return {
      ...state,
      flags,
      journal,
      hp,
      bp,
      gold: state.gold + 40,
      exp: state.exp + 12,
      screen: "ending",
      battle: null,
    };
  }
  return {
    ...state,
    flags,
    journal,
    hp,
    bp,
    gold: state.gold + 12,
    exp: state.exp + 4,
    locationId: nextLoc,
    pos,
    screen: "world",
    battle: null,
  };
}

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return { ...state, screen: "select" };
    case "HOVER_HERO":
      return { ...state, selectedHero: action.id };
    case "CONFIRM_HERO": {
      if (!state.selectedHero) return state;
      const hero = heroById(state.selectedHero);
      return {
        ...freshState(),
        screen: "dialogue",
        selectedHero: hero.id,
        heroId: hero.id,
        hp: hero.maxHp,
        bp: 0,
        dialogue: [
          { speaker: hero.name, text: hero.opening[0] ?? hero.bio, portrait: hero.id },
          { speaker: hero.name, text: hero.opening[1] ?? "往新野去。", portrait: hero.id },
        ],
        dialogueIndex: 0,
        afterDialogue: "world",
        journal: [
          `初入新野。八路之中，你選了${hero.name}。新野並沒有黃巾的足跡，客棧、商販、里長都還在。`,
        ],
      };
    }
    case "DIALOGUE_NEXT": {
      if (!state.dialogue) return { ...state, screen: state.afterDialogue ?? "world" };
      const next = state.dialogueIndex + 1;
      if (next >= state.dialogue.length) {
        return {
          ...state,
          screen: state.afterDialogue ?? "world",
          dialogue: null,
          dialogueIndex: 0,
          afterDialogue: null,
        };
      }
      return { ...state, dialogueIndex: next };
    }
    case "MOVE": {
      if (state.screen !== "world" || state.menuOpen || state.pathPreview) return state;
      const map = MAPS[state.locationId];
      const nextPos = { x: state.pos.x + action.dx, y: state.pos.y + action.dy };
      if (blocked(map, nextPos)) return state;
      const exit = map.exits.find((e) => sameTile(e.pos, nextPos));
      if (exit) {
        if (exit.needFlag && !state.flags[exit.needFlag]) {
          return {
            ...state,
            pos: nextPos,
            lastPathResult: "尚未探明弱點，不宜硬闖。",
            dialogue: [{ speaker: "旁白", text: "先用路徑行動問清楚黃巾弱點，再出城門。" }],
            dialogueIndex: 0,
            afterDialogue: "world",
            screen: "dialogue",
          };
        }
        if (exit.battle && !flagForBattle(state, exit.battle)) {
          return startEncounter({ ...state, pos: nextPos }, exit.battle as keyof typeof ENCOUNTERS);
        }
        const dest = MAPS[exit.to];
        return { ...state, locationId: exit.to, pos: dest.start, lastPathResult: null };
      }
      if (state.locationId === "gate" && !state.flags.gateCleared) {
        return startEncounter({ ...state, pos: nextPos }, "gate");
      }
      if (state.locationId === "road" && !state.flags.roadCleared) {
        return startEncounter({ ...state, pos: nextPos }, "road");
      }
      const boss = map.npcs.find((n) => n.id === "boss");
      if (boss && !state.flags.bossCleared) {
        const nearBoss = sameTile(nextPos, boss.pos) || Math.max(Math.abs(nextPos.x - boss.pos.x), Math.abs(nextPos.y - boss.pos.y)) <= 1;
        if (nearBoss) return startEncounter({ ...state, pos: nextPos }, "boss");
      }
      return { ...state, pos: nextPos, lastPathResult: null, pathPreview: null };
    }
    case "TALK": {
      const map = MAPS[state.locationId];
      const npc = nearbyNpc(map, state.pos);
      if (!npc) return state;
      const line = npc.talks[state.flags.inquiredWeakness ? Math.min(1, npc.talks.length - 1) : 0];
      return {
        ...state,
        screen: "dialogue",
        dialogue: [{ speaker: npc.name, text: line }],
        dialogueIndex: 0,
        afterDialogue: "world",
        menuOpen: false,
      };
    }
    case "PATH_OPEN": {
      if (!state.heroId) return state;
      const npc = nearbyNpc(MAPS[state.locationId], state.pos);
      if (!npc) return state;
      return { ...state, pathPreview: previewPathAction(heroById(state.heroId), npc), lastPathResult: null };
    }
    case "PATH_CANCEL":
      return { ...state, pathPreview: null };
    case "PATH_DO": {
      if (!state.heroId || !state.pathPreview) return state;
      const npc = nearbyNpc(MAPS[state.locationId], state.pos);
      if (!npc) return { ...state, pathPreview: null };
      const roll = action.roll ?? Math.floor(Math.random() * 100);
      const result = executePathAction(heroById(state.heroId), npc, roll);
      let next: GameState = {
        ...state,
        pathPreview: null,
        lastPathResult: result.text,
        gold: Math.max(0, state.gold + (result.goldDelta ?? 0)),
        flags: { ...state.flags, ...result.flags },
        journal: result.journal ? [...state.journal, result.journal] : state.journal,
      };
      if (result.item) {
        next = { ...next, inventory: { ...next.inventory, [result.item]: next.inventory[result.item] + 1 } };
      }
      if (result.startBattle) {
        return startEncounter(next, result.startBattle as keyof typeof ENCOUNTERS);
      }
      return {
        ...next,
        screen: "dialogue",
        dialogue: [{ speaker: npc.name, text: result.text }],
        dialogueIndex: 0,
        afterDialogue: "world",
      };
    }
    case "MENU_OPEN":
      return { ...state, menuOpen: true };
    case "MENU_CLOSE":
      return { ...state, menuOpen: false };
    case "MENU_TAB":
      return { ...state, menuTab: action.tab };
    case "BUY": {
      const item = ITEMS[action.item];
      if (state.gold < item.price) return { ...state, lastPathResult: "錢不夠。" };
      return {
        ...state,
        gold: state.gold - item.price,
        inventory: { ...state.inventory, [action.item]: state.inventory[action.item] + 1 },
        lastPathResult: `買下${item.name}。`,
      };
    }
    case "REST": {
      if (state.gold < INN_COST) return { ...state, lastPathResult: "住店要十錢。" };
      const max = state.heroId ? heroById(state.heroId).maxHp : state.hp;
      return {
        ...state,
        gold: state.gold - INN_COST,
        hp: max,
        timeOfDay: state.timeOfDay === "day" ? "night" : "day",
        flags: { ...state.flags, rested: true },
        lastPathResult: "一夜無話，氣血回復。",
      };
    }
    case "SAVE":
      persist(state);
      return { ...state, lastPathResult: "列傳已存。" };
    case "LOAD":
      return { ...action.state, menuOpen: false };
    case "TITLE":
      return { ...freshState(), screen: "title" };
    case "BATTLE_CMD":
      return state.battle ? { ...state, battle: yieldCombat(state.battle, { kind: "cmd", cmd: action.cmd }) } : state;
    case "BATTLE_SKILL":
      return state.battle ? { ...state, battle: yieldCombat(state.battle, { kind: "skill", skillId: action.skillId }) } : state;
    case "BATTLE_ITEM": {
      if (!state.battle) return state;
      if (state.inventory[action.item] <= 0) return { ...state, battle: { ...state.battle, toast: "沒有此物。" } };
      const used = { ...state.inventory, [action.item]: state.inventory[action.item] - 1 };
      return { ...state, inventory: used, battle: yieldCombat(state.battle, { kind: "item", item: action.item }) };
    }
    case "BATTLE_BOOST":
      return state.battle ? { ...state, battle: yieldCombat(state.battle, { kind: "boost", boost: action.boost }) } : state;
    case "BATTLE_TARGET":
      return state.battle ? { ...state, battle: yieldCombat(state.battle, { kind: "target", id: action.id }) } : state;
    case "BATTLE_BACK":
      return state.battle ? { ...state, battle: yieldCombat(state.battle, { kind: "back" }) } : state;
    case "BATTLE_LEAVE":
      return finishBattle(state);
    case "CLEAR_TOAST":
      return { ...state, lastPathResult: null };
    default:
      return state;
  }
}
