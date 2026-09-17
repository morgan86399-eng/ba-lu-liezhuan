import assert from "node:assert/strict";
import { GOLD } from "./data.ts";
import { MAPS } from "./data.ts";
import {
  boostOrbs,
  chapterGoal,
  COMMANDS,
  DESIGN_TOKENS,
  isNear,
  motionDuration,
  nearbyNpc,
  noHorizontalPageScrollCss,
  pathActionVisible,
  prefersReducedMotion,
  timeLabel,
  touchTargetMin,
  turnOrderActors,
} from "./view.ts";
import { createBattle } from "./combat.ts";

assert.equal(DESIGN_TOKENS.gold, "#e4c56a");
assert.equal(GOLD, "#e4c56a");
assert.equal(DESIGN_TOKENS.forbiddenFont, null);
assert.equal(DESIGN_TOKENS.forbiddenGreen, null);
assert.ok(!DESIGN_TOKENS.serif.includes("Inter"));
assert.ok(!DESIGN_TOKENS.sans.includes("Inter"));

assert.equal(touchTargetMin(), 44);
assert.ok(noHorizontalPageScrollCss().includes("overflow-x:hidden"));
assert.equal(timeLabel("day"), "晝");

assert.equal(isNear({ x: 4, y: 3 }, { x: 5, y: 3 }), true);
assert.equal(isNear({ x: 4, y: 3 }, { x: 7, y: 3 }), false);
assert.equal(pathActionVisible(MAPS.xinye, { x: 4, y: 3 }), false, "遠處不顯示路徑行動");
const traveler = MAPS.xinye.npcs.find((n) => n.id === "traveler")!;
assert.equal(pathActionVisible(MAPS.xinye, { x: traveler.pos.x + 1, y: traveler.pos.y }), true);
assert.equal(nearbyNpc(MAPS.xinye, { x: 4, y: 3 }), null);

const flags0 = {
  inquiredWeakness: false,
  gateCleared: false,
  roadCleared: false,
  bossCleared: false,
  chapter1Done: false,
  rested: false,
};
assert.ok(chapterGoal("xinye", flags0).includes("路徑行動"));
assert.ok(chapterGoal("gate", { ...flags0, inquiredWeakness: true }).includes("城門"));

const orbs = boostOrbs(3, 2);
assert.equal(orbs.length, 3);
assert.deepEqual(
  orbs.map((o) => o.chosen),
  [true, true, false],
);

assert.deepEqual(
  COMMANDS.map((c) => c.id),
  ["attack", "skill", "defend", "item"],
);

const battle = createBattle("boss", "guanyu");
const order = turnOrderActors(battle);
assert.ok(order.length >= 2, "多角色出手順序結構");
assert.equal(order[0].active, true);
assert.equal(order.some((o) => o.enemy), true);

assert.equal(prefersReducedMotion(), false);
assert.equal(motionDuration(0.4), 0.4);

console.log("view.test.ts ok");
