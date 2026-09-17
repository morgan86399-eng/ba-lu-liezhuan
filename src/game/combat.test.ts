import assert from "node:assert/strict";
import {
  breakMultiplier,
  createBattle,
  hitsForBoost,
  pickBoost,
  pickCommand,
  pickSkill,
  pickTarget,
  simulateScriptedWin,
} from "./combat.ts";
import { HEROES } from "./data.ts";
import { executePathAction, previewPathAction } from "./pathAction.ts";
import { reduce } from "./reducer.ts";
import { freshState } from "./save.ts";
import { nearbyNpc } from "./view.ts";
import { MAPS } from "./data.ts";

const gy = HEROES.find((h) => h.id === "guanyu")!;

{
  const b = createBattle("gate", "guanyu", 36, 3);
  assert.equal(b.turnQueue.length >= 2, true, "出手順序至少含我方與敵");
  assert.equal(b.turnQueue[0], b.allies[0].id);
  assert.equal(b.enemies[0].shields, 3);
  const afterCmd = pickCommand(b, "attack");
  assert.equal(afterCmd.phase, "boost");
  const afterBoost = pickBoost(afterCmd, 3);
  const resolved = afterBoost.phase === "target" ? pickTarget(afterBoost, b.enemies[0].id) : afterBoost;
  const foe = resolved.enemies[0];
  assert.ok(foe.shields < 3 || foe.broken, "弱點刀應削盾");
  assert.ok(resolved.floaters.length > 0, "傷害數字／弱點 flash");
}

{
  assert.equal(hitsForBoost(1, 0), 1);
  assert.equal(hitsForBoost(1, 3), 4);
  assert.equal(breakMultiplier(), 2);
}

{
  let b = createBattle("gate", "guanyu", 36, 3);
  const foeId = b.enemies[0].id;
  while (!b.enemies[0].broken && b.phase !== "lost" && b.phase !== "won") {
    if (b.phase === "command") {
      const skill = b.allies[0].skills[0];
      b = pickCommand(b, "skill");
      b = pickSkill(b, skill.id);
      b = pickBoost(b, Math.min(3, b.allies[0].bp) as 0 | 1 | 2 | 3);
      if (b.phase === "target") b = pickTarget(b, foeId);
    } else break;
    if (b.enemies[0].hp <= 0) break;
  }
  assert.equal(b.enemies[0].broken || b.phase === "won", true, "連削可崩解");
}

{
  const gate = simulateScriptedWin("gate", "guanyu");
  assert.equal(gate.phase, "won", "城門戰可勝");
  const road = simulateScriptedWin("road", "zhaoyun");
  assert.equal(road.phase, "won", "官道可勝");
  const boss = simulateScriptedWin("boss", "zhuge");
  assert.equal(boss.phase, "won", "渠帥可勝");
}

{
  const traveler = MAPS.xinye.npcs.find((n) => n.id === "traveler")!;
  const preview = previewPathAction(HEROES.find((h) => h.id === "zhuge")!, traveler);
  assert.equal(preview.action, "inquire");
  assert.ok(preview.rate >= 90);
  const result = executePathAction(HEROES.find((h) => h.id === "zhuge")!, traveler, 0);
  assert.equal(result.flags?.inquiredWeakness, true);
}

{
  let s = freshState();
  s = reduce(s, { type: "START" });
  assert.equal(s.screen, "select");
  s = reduce(s, { type: "HOVER_HERO", id: "zhuge" });
  s = reduce(s, { type: "CONFIRM_HERO" });
  assert.equal(s.heroId, "zhuge");
  s = reduce(s, { type: "DIALOGUE_NEXT" });
  s = reduce(s, { type: "DIALOGUE_NEXT" });
  assert.equal(s.screen, "world");
  const traveler = MAPS.xinye.npcs.find((n) => n.id === "traveler")!;
  s = { ...s, pos: { x: traveler.pos.x + 1, y: traveler.pos.y } };
  assert.ok(nearbyNpc(MAPS.xinye, s.pos));
  s = reduce(s, { type: "PATH_OPEN" });
  assert.ok(s.pathPreview);
  s = reduce(s, { type: "PATH_DO", roll: 0 });
  assert.equal(s.flags.inquiredWeakness, true);
  s = reduce(s, { type: "DIALOGUE_NEXT" });
  s = { ...s, pos: MAPS.xinye.exits[0].pos };
  s = reduce(s, { type: "MOVE", dx: 0, dy: 0 });
  // standing on exit after inquire should allow gate if we step
  s = { ...s, pos: { x: 4, y: 5 }, screen: "world" };
  s = reduce(s, { type: "MOVE", dx: 0, dy: 1 });
  assert.equal(s.screen, "battle");
  assert.equal(s.battle?.encounterId, "gate");
  s = { ...s, battle: simulateScriptedWin("gate", "zhuge") };
  s = reduce(s, { type: "BATTLE_LEAVE" });
  assert.equal(s.flags.gateCleared, true);
  s = { ...s, battle: simulateScriptedWin("road", "zhuge"), screen: "battle" };
  s = reduce(s, { type: "BATTLE_LEAVE" });
  assert.equal(s.flags.roadCleared, true);
  s = { ...s, battle: simulateScriptedWin("boss", "zhuge"), screen: "battle" };
  s = reduce(s, { type: "BATTLE_LEAVE" });
  assert.equal(s.flags.chapter1Done, true);
  assert.equal(s.screen, "ending");
}

{
  for (const hero of HEROES) {
    assert.ok(hero.pathAction, `${hero.name} 必須有路徑行動`);
    assert.ok(hero.skills.length >= 1, `${hero.name} 必須有戰技`);
  }
}

console.log("combat.test.ts ok");
