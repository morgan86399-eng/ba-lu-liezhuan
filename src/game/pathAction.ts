import { PATH_LABEL, YELLOW_WEAKNESSES, WEAPON_LABEL } from "./data.ts";
import type { HeroDef, NpcDef, PathPreview, StoryFlags } from "./types.ts";

export function successRate(hero: HeroDef, npc: NpcDef): number {
  const action = hero.pathAction;
  if (action === "inquire") return npc.knowsWeakness ? 95 : 70;
  if (action === "intimidate") return npc.coward ? 90 : npc.challengeable ? 40 : 55;
  if (action === "challenge" || action === "duel") return npc.challengeable ? 80 : 35;
  if (action === "steal") return npc.merchant ? 65 : 45;
  if (action === "purchase") return npc.merchant || npc.knowsWeakness ? 100 : 50;
  if (action === "allure") return npc.coward || npc.knowsWeakness ? 85 : 60;
  if (action === "guide") return npc.knowsWeakness ? 80 : 50;
  return 50;
}

export function previewPathAction(hero: HeroDef, npc: NpcDef): PathPreview {
  const action = hero.pathAction;
  const rate = successRate(hero, npc);
  const condition = npc.pathHint;
  let preview = "對方未必肯說。";
  if (action === "inquire") preview = npc.knowsWeakness ? "可能問出黃巾弱點。" : "聽聽市井閒話。";
  if (action === "intimidate") preview = npc.coward ? "對方會嚇得吐實。" : "硬漢未必吃這套。";
  if (action === "challenge" || action === "duel") {
    preview = npc.challengeable ? "約戰一場，贏了或可換情報。" : "對方不想動手。";
  }
  if (action === "steal") preview = "順手牽羊，可能摸到錢或藥。";
  if (action === "purchase") preview = "花錢買口風或貨物。";
  if (action === "allure") preview = "三言兩語，套出實話。";
  if (action === "guide") preview = "請對方同行，路上方便開口。";
  return { action, label: PATH_LABEL[action], rate, condition, preview };
}

export interface PathResult {
  ok: boolean;
  text: string;
  flags?: Partial<StoryFlags>;
  goldDelta?: number;
  item?: "herb" | "oil";
  startBattle?: string;
  journal?: string;
}

export function executePathAction(hero: HeroDef, npc: NpcDef, roll: number): PathResult {
  const rate = successRate(hero, npc);
  const ok = roll < rate;
  const action = hero.pathAction;

  if (action === "purchase" && (npc.merchant || npc.knowsWeakness)) {
    if (npc.knowsWeakness) {
      return {
        ok: true,
        text: `你花十五錢買下行商的密話：黃巾弱點是${weakText()}。`,
        goldDelta: -15,
        flags: { inquiredWeakness: true },
        journal: `以金帛換得情報：黃巾懼${weakText()}。`,
      };
    }
    return { ok: true, text: "商販只肯賣貨。請開列傳選單選購。", goldDelta: 0 };
  }

  if (!ok) {
    return { ok: false, text: `${PATH_LABEL[action]}失敗。${npc.name}不肯就範。` };
  }

  if ((action === "challenge" || action === "duel") && npc.challengeable) {
    if (npc.id === "boss") {
      return { ok: true, text: "渠帥應戰。", startBattle: "boss" };
    }
    return { ok: true, text: `${npc.name}應下比試。`, startBattle: "elder" };
  }

  if (action === "steal") {
    if (npc.merchant) {
      return { ok: true, text: "你摸走一包草藥。", item: "herb", journal: "從商販處順走草藥。" };
    }
    return { ok: true, text: "袖裡多了二十錢。", goldDelta: 20 };
  }

  if (npc.knowsWeakness) {
    return {
      ok: true,
      text: `${npc.name}壓低聲音：「黃巾的盾，最怕${weakText()}。城門那些也一樣。」`,
      flags: { inquiredWeakness: true },
      journal: `探得黃巾弱點：${weakText()}。可出城門。`,
    };
  }

  if (npc.inn) {
    return { ok: true, text: "掌櫃拱手：住店請按列傳選單過夜。" };
  }

  return { ok: true, text: `${npc.name}點點頭，卻沒多說黃巾的事。` };
}

function weakText(): string {
  return YELLOW_WEAKNESSES.map((w) => WEAPON_LABEL[w]).join("、");
}
