import { ENCOUNTERS, heroById, ITEMS } from "./data.ts";
import type {
  BattleState,
  Combatant,
  CommandId,
  HeroId,
  ItemId,
  SkillDef,
  WeaponId,
} from "./types.ts";
import { currentActor, isAllyTurn } from "./view.ts";

const BREAK_TURNS = 2;
const BREAK_MULT = 2;
const WEAK_MULT = 1.25;

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function allyFromHero(heroId: HeroId, hp?: number, bp?: number): Combatant {
  const hero = heroById(heroId);
  return {
    id: `ally-${hero.id}`,
    name: hero.name,
    heroId: hero.id,
    hp: hp ?? hero.maxHp,
    maxHp: hero.maxHp,
    bp: bp ?? 0,
    maxBp: hero.maxBp,
    atk: hero.atk,
    shields: 0,
    maxShields: 0,
    broken: false,
    breakTurns: 0,
    weaknesses: [],
    revealed: [],
    skills: hero.skills,
    isEnemy: false,
    defending: false,
  };
}

export function createBattle(
  encounterId: keyof typeof ENCOUNTERS,
  heroId: HeroId,
  hp?: number,
  bp?: number,
): BattleState {
  const enc = ENCOUNTERS[encounterId];
  const ally = allyFromHero(heroId, hp, bp);
  const enemies: Combatant[] = enc.enemies.map((e) => ({
    id: e.id,
    name: e.name,
    hp: e.hp,
    maxHp: e.hp,
    bp: 0,
    maxBp: 0,
    atk: e.atk,
    shields: e.shields,
    maxShields: e.shields,
    broken: false,
    breakTurns: 0,
    weaknesses: e.weaknesses,
    revealed: [],
    skills: [],
    isEnemy: true,
    defending: false,
  }));
  const turnQueue = [ally.id, ...enemies.map((e) => e.id)];
  return {
    encounterId,
    title: enc.title,
    allies: [ally],
    enemies,
    turnQueue,
    turnIndex: 0,
    phase: "command",
    command: null,
    boost: 0,
    skillId: null,
    itemId: null,
    toast: "先打弱點削盾，崩解後再蓄力多段。",
    log: [`${enc.title}開始。`],
    floaters: [],
    breakFlash: false,
  };
}

function mutateUnit(battle: BattleState, id: string, fn: (u: Combatant) => Combatant): BattleState {
  return {
    ...battle,
    allies: battle.allies.map((u) => (u.id === id ? fn(u) : u)),
    enemies: battle.enemies.map((u) => (u.id === id ? fn(u) : u)),
  };
}

function living(units: Combatant[]): Combatant[] {
  return units.filter((u) => u.hp > 0);
}

export function rebuildQueue(battle: BattleState): BattleState {
  const units = [...living(battle.allies), ...living(battle.enemies)];
  const prev = battle.turnQueue[battle.turnIndex];
  const turnQueue = units.map((u) => u.id);
  let turnIndex = Math.max(0, turnQueue.indexOf(prev));
  if (turnIndex < 0) turnIndex = 0;
  return { ...battle, turnQueue, turnIndex };
}

export function concludeIfDone(battle: BattleState): BattleState {
  if (living(battle.enemies).length === 0) {
    return { ...battle, phase: "won", toast: "勝。", log: [...battle.log, "戰鬥勝利。"] };
  }
  if (living(battle.allies).length === 0) {
    return { ...battle, phase: "lost", toast: "敗。", log: [...battle.log, "全軍覆沒。"] };
  }
  return battle;
}

export function pickCommand(battle: BattleState, command: CommandId): BattleState {
  if (!isAllyTurn(battle) || battle.phase === "won" || battle.phase === "lost") return battle;
  if (command === "defend") {
    return resolveDefend({ ...battle, command, boost: 0, skillId: null, itemId: null });
  }
  if (command === "skill") {
    return { ...battle, command, phase: "skill", skillId: null, toast: "選擇戰技。" };
  }
  if (command === "item") {
    return { ...battle, command, phase: "item", itemId: null, toast: "選擇物件。" };
  }
  return { ...battle, command, phase: "boost", skillId: null, itemId: null, toast: "點選蓄力珠（0–3）。" };
}

export function pickSkill(battle: BattleState, skillId: string): BattleState {
  return { ...battle, skillId, phase: "boost", toast: "點選蓄力珠（0–3）。" };
}

export function pickItem(battle: BattleState, itemId: ItemId): BattleState {
  const def = ITEMS[itemId];
  if (def.heal > 0) {
    return resolveItem({ ...battle, itemId, command: "item", boost: 0 });
  }
  return { ...battle, itemId, command: "item", phase: "boost", toast: "點選蓄力珠後投擲。" };
}

export function pickBoost(battle: BattleState, boost: 0 | 1 | 2 | 3): BattleState {
  const actor = currentActor(battle);
  if (!actor) return battle;
  const capped = Math.min(boost, 3, actor.bp) as 0 | 1 | 2 | 3;
  const next = { ...battle, boost: capped, phase: "target" as const, toast: "選擇目標。" };
  const foes = living(next.enemies);
  if (foes.length === 1 && battle.command !== "item") {
    return resolveOffense(next, foes[0].id);
  }
  if (battle.command === "item" && ITEMS[battle.itemId!]?.heal) {
    return resolveItem(next);
  }
  if (foes.length === 1 && battle.command === "item") {
    return resolveOffense(next, foes[0].id);
  }
  return next;
}

export function pickTarget(battle: BattleState, targetId: string): BattleState {
  if (battle.phase !== "target") return battle;
  return resolveOffense(battle, targetId);
}

export function backBattle(battle: BattleState): BattleState {
  if (battle.phase === "boost" || battle.phase === "skill" || battle.phase === "item" || battle.phase === "target") {
    return { ...battle, phase: "command", command: null, skillId: null, itemId: null, boost: 0, toast: "選擇指令。" };
  }
  return battle;
}

function hitCount(baseHits: number, boost: number): number {
  return Math.max(1, baseHits + boost);
}

function isWeak(target: Combatant, weapon: WeaponId): boolean {
  return target.weaknesses.includes(weapon);
}

function applyHits(
  battle: BattleState,
  actor: Combatant,
  target: Combatant,
  weapon: WeaponId,
  power: number,
  hits: number,
  shieldBonus: number,
): { battle: BattleState; brokenNow: boolean; total: number; weak: boolean } {
  let next = { ...battle, floaters: [] as BattleState["floaters"], breakFlash: false };
  let brokenNow = false;
  let total = 0;
  let anyWeak = false;
  let tgt = { ...target };

  for (let i = 0; i < hits; i += 1) {
    const weak = isWeak(tgt, weapon);
    if (weak) {
      anyWeak = true;
      if (!tgt.revealed.includes(weapon)) tgt.revealed = [...tgt.revealed, weapon];
    }
    if (!tgt.broken && (weak || shieldBonus > 0)) {
      const cut = (weak ? 1 : 0) + (i === 0 ? shieldBonus : 0);
      tgt.shields = Math.max(0, tgt.shields - cut);
      if (tgt.shields === 0 && tgt.maxShields > 0) {
        tgt.broken = true;
        tgt.breakTurns = BREAK_TURNS;
        brokenNow = true;
      }
    }
    const defMit = tgt.defending ? 0.5 : 1;
    const dmg = Math.max(
      1,
      Math.round(power * (tgt.broken ? BREAK_MULT : 1) * (weak ? WEAK_MULT : 1) * defMit),
    );
    tgt.hp = Math.max(0, tgt.hp - dmg);
    total += dmg;
  }

  next = mutateUnit(next, tgt.id, () => tgt);
  next.floaters = [
    {
      id: uid("fl"),
      text: `${total}`,
      kind: brokenNow ? "break" : anyWeak ? "weak" : "dmg",
      actorId: tgt.id,
    },
  ];
  if (brokenNow) {
    next.breakFlash = true;
    next.floaters.push({ id: uid("br"), text: "崩解", kind: "break", actorId: tgt.id });
  } else if (anyWeak) {
    next.floaters.push({ id: uid("wk"), text: "弱點", kind: "weak", actorId: tgt.id });
  }
  next.toast = brokenNow
    ? `${tgt.name}崩解！傷害加倍。`
    : anyWeak
      ? `命中弱點，盾破 ${target.shields}→${tgt.shields}`
      : `${actor.name}造成 ${total} 傷害`;
  next.log = [...next.log, next.toast];
  return { battle: next, brokenNow, total, weak: anyWeak };
}

function spendBp(actor: Combatant, boost: number): Combatant {
  return { ...actor, bp: Math.max(0, actor.bp - boost), defending: false };
}

function gainBp(actor: Combatant): Combatant {
  if (actor.isEnemy) return { ...actor, defending: false };
  return { ...actor, bp: Math.min(actor.maxBp, actor.bp + 1), defending: false };
}

function tickBreak(unit: Combatant): Combatant {
  if (!unit.broken) return { ...unit, defending: false };
  const left = unit.breakTurns - 1;
  if (left <= 0) {
    return { ...unit, broken: false, breakTurns: 0, shields: unit.maxShields, defending: false };
  }
  return { ...unit, breakTurns: left, defending: false };
}

export function advanceTurn(battle: BattleState): BattleState {
  let next = concludeIfDone(battle);
  if (next.phase === "won" || next.phase === "lost") return next;
  const actor = currentActor(next);
  if (actor) {
    next = mutateUnit(next, actor.id, gainBp);
  }
  for (const u of [...next.allies, ...next.enemies]) {
    if (u.id !== actor?.id) next = mutateUnit(next, u.id, tickBreak);
  }
  next = rebuildQueue(next);
  const start = next.turnIndex;
  let guard = 0;
  do {
    next = { ...next, turnIndex: (next.turnIndex + 1) % next.turnQueue.length };
    const cur = currentActor(next);
    guard += 1;
    if (cur && cur.hp > 0) break;
  } while (guard < next.turnQueue.length + 1 && next.turnIndex !== start);

  const cur = currentActor(next);
  if (cur?.isEnemy) {
    return resolveEnemy(next);
  }
  return {
    ...next,
    phase: "command",
    command: null,
    boost: 0,
    skillId: null,
    itemId: null,
    toast: `${cur?.name ?? ""}的回合。`,
  };
}

export function resolveDefend(battle: BattleState): BattleState {
  const actor = currentActor(battle);
  if (!actor) return battle;
  let next = mutateUnit(battle, actor.id, (u) => ({ ...u, defending: true }));
  next = { ...next, toast: `${actor.name}轉守。`, log: [...next.log, `${actor.name}防禦。`], floaters: [] };
  return advanceTurn(next);
}

export function resolveItem(battle: BattleState): BattleState {
  const actor = currentActor(battle);
  const itemId = battle.itemId;
  if (!actor || !itemId) return battle;
  const def = ITEMS[itemId];
  if (def.heal <= 0) return battle;
  const healed = Math.min(actor.maxHp, actor.hp + def.heal);
  let next = mutateUnit(battle, actor.id, (u) => ({ ...u, hp: healed }));
  next = {
    ...next,
    floaters: [{ id: uid("h"), text: `+${healed - actor.hp}`, kind: "heal", actorId: actor.id }],
    toast: `${actor.name}使用${def.name}。`,
    log: [...next.log, `${actor.name}使用${def.name}，恢復 ${healed - actor.hp}。`],
    itemId: null,
  };
  return advanceTurn(next);
}

export function resolveOffense(battle: BattleState, targetId: string): BattleState {
  const actor = currentActor(battle);
  const target = [...battle.allies, ...battle.enemies].find((u) => u.id === targetId);
  if (!actor || !target || target.hp <= 0) return battle;

  let weapon: WeaponId = "blade";
  let power = actor.atk;
  let hits = 1;
  let shieldBonus = 0;
  let skill: SkillDef | undefined;

  if (battle.command === "skill" && battle.skillId) {
    skill = actor.skills.find((s) => s.id === battle.skillId);
    if (skill) {
      weapon = skill.weapon;
      power = skill.power;
      hits = skill.hits;
      shieldBonus = skill.shieldBonus;
    }
  } else if (battle.command === "item" && battle.itemId) {
    const item = ITEMS[battle.itemId];
    weapon = item.weapon ?? "fire";
    power = item.damage;
    hits = 1;
  } else if (actor.heroId) {
    weapon = heroById(actor.heroId).weapon;
    power = actor.atk;
  }

  const boost = Math.min(battle.boost, actor.bp, 3);
  hits = hitCount(hits, boost);
  let next = mutateUnit(battle, actor.id, (u) => spendBp(u, boost));
  const applied = applyHits(next, actor, target, weapon, power, hits, shieldBonus);
  next = applied.battle;
  if (battle.command === "item") {
    next = { ...next, itemId: null };
  }
  return advanceTurn(concludeIfDone(next));
}

export function resolveEnemy(battle: BattleState): BattleState {
  const actor = currentActor(battle);
  const target = living(battle.allies)[0];
  if (!actor || !target) return concludeIfDone(battle);
  const power = actor.atk;
  const defMit = target.defending ? 0.5 : 1;
  const dmg = Math.max(1, Math.round(power * defMit));
  let next = mutateUnit(battle, target.id, (u) => ({ ...u, hp: Math.max(0, u.hp - dmg) }));
  next = {
    ...next,
    floaters: [{ id: uid("ed"), text: `${dmg}`, kind: "dmg", actorId: target.id }],
    toast: `${actor.name}攻擊，${dmg} 傷害。`,
    log: [...next.log, `${actor.name}攻擊 ${target.name} ${dmg}。`],
  };
  return advanceTurn(concludeIfDone(next));
}

export function hitsForBoost(baseHits: number, boost: 0 | 1 | 2 | 3): number {
  return hitCount(baseHits, boost);
}

export function breakMultiplier(): number {
  return BREAK_MULT;
}

export function simulateScriptedWin(encounterId: keyof typeof ENCOUNTERS, heroId: HeroId): BattleState {
  let battle = createBattle(encounterId, heroId, undefined, 3);
  let guard = 0;
  while (battle.phase !== "won" && battle.phase !== "lost" && guard < 80) {
    guard += 1;
    if (!isAllyTurn(battle) || battle.phase === "resolving") {
      battle = resolveEnemy(battle);
      continue;
    }
    const foe = living(battle.enemies)[0];
    if (!foe) break;
    const ally = living(battle.allies)[0];
    if (!ally) break;
    if (ally.hp <= 12 && ally.hp < ally.maxHp) {
      battle = pickCommand(battle, "item");
      battle = pickItem(battle, "herb");
      continue;
    }
    const boost = Math.min(3, ally.bp) as 0 | 1 | 2 | 3;
    if (foe.broken || foe.shields <= 1) {
      battle = pickCommand(battle, "attack");
      battle = pickBoost(battle, boost);
      if (battle.phase === "target") battle = pickTarget(battle, foe.id);
    } else {
      const skill = ally.skills[0];
      if (skill) {
        battle = pickCommand(battle, "skill");
        battle = pickSkill(battle, skill.id);
        battle = pickBoost(battle, boost);
        if (battle.phase === "target") battle = pickTarget(battle, foe.id);
      } else {
        battle = pickCommand(battle, "attack");
        battle = pickBoost(battle, boost);
        if (battle.phase === "target") battle = pickTarget(battle, foe.id);
      }
    }
  }
  return battle;
}
