import type {
  HeroDef,
  HeroId,
  ItemDef,
  ItemId,
  LocationId,
  MapDef,
  PathActionId,
  WeaponId,
} from "./types.ts";

export const WEAPON_LABEL: Record<WeaponId, string> = {
  blade: "刀",
  spear: "槍",
  axe: "斧",
  bow: "弓",
  fan: "扇",
  fire: "火",
  lightning: "雷",
  dark: "暗",
};

export const PATH_LABEL: Record<PathActionId, string> = {
  challenge: "挑戰",
  duel: "決鬥",
  intimidate: "威嚇",
  inquire: "探聽",
  guide: "引導",
  allure: "遊說",
  steal: "偷竊",
  purchase: "購買",
};

export const ITEMS: Record<ItemId, ItemDef> = {
  herb: {
    id: "herb",
    name: "草藥",
    price: 20,
    heal: 18,
    damage: 0,
    weapon: null,
    text: "恢復氣血 18。",
  },
  salve: {
    id: "salve",
    name: "金創藥",
    price: 55,
    heal: 40,
    damage: 0,
    weapon: null,
    text: "恢復氣血 40。",
  },
  oil: {
    id: "oil",
    name: "火油",
    price: 35,
    heal: 0,
    damage: 16,
    weapon: "fire",
    text: "擲出火油，剋火弱點並削盾。",
  },
};

export const HEROES: HeroDef[] = [
  {
    id: "guanyu",
    name: "關羽",
    title: "武聖",
    job: "青龍刀客",
    pathAction: "challenge",
    weapon: "blade",
    maxHp: 36,
    maxBp: 5,
    atk: 9,
    accent: "#6b1d1d",
    bio: "義薄雲天，青龍偃月一刀可破堅盾。新野城門的黃巾最懼刀鋒。",
    opening: [
      "關羽立於新野城外，赤面長髯，青龍偃月斜倚肩上。",
      "「黃巾餘黨據北營。先問清楚弱點，再去城門會他們。」",
    ],
    skills: [
      {
        id: "qinglong",
        name: "青龍斬",
        weapon: "blade",
        power: 12,
        hits: 1,
        shieldBonus: 1,
        bpCost: 0,
        text: "刀勢沈重，額外削盾。",
      },
    ],
  },
  {
    id: "zhaoyun",
    name: "趙雲",
    title: "常山",
    job: "龍槍",
    pathAction: "duel",
    weapon: "spear",
    maxHp: 34,
    maxBp: 5,
    atk: 8,
    accent: "#2a3a55",
    bio: "常山趙子龍，槍出如龍。決鬥門可約人單挑，探得敵軍破綻。",
    opening: [
      "趙雲銀甲白袍，長槍點地，新野晨霧尚未散盡。",
      "「先與人決鬥探聽，再上城門。槍鋒專破渠帥之盾。」",
    ],
    skills: [
      {
        id: "longqiang",
        name: "龍槍連突",
        weapon: "spear",
        power: 7,
        hits: 2,
        shieldBonus: 0,
        bpCost: 0,
        text: "兩段槍刺，利於連削。",
      },
    ],
  },
  {
    id: "zhangfei",
    name: "張飛",
    title: "虓虎",
    job: "虓虎",
    pathAction: "intimidate",
    weapon: "axe",
    maxHp: 40,
    maxBp: 5,
    atk: 10,
    accent: "#1a1a1a",
    bio: "當陽一吼，懦夫膽裂。威嚇可逼問口供，斧刃專砸盾牌。",
    opening: [
      "張飛環眼虯髯，丈八矛往地上一頓。",
      "「有膽子的站出來！黃巾弱點，老子問得出口。」",
    ],
    skills: [
      {
        id: "howl",
        name: "當陽吼",
        weapon: "axe",
        power: 11,
        hits: 1,
        shieldBonus: 1,
        bpCost: 0,
        text: "怒吼砸盾，破防一擊。",
      },
    ],
  },
  {
    id: "zhuge",
    name: "諸葛亮",
    title: "臥龍",
    job: "軍師",
    pathAction: "inquire",
    weapon: "fan",
    maxHp: 28,
    maxBp: 5,
    atk: 7,
    accent: "#d8d2c4",
    bio: "羽扇綸巾，探聽市井便知敵虛實。火計與扇骨皆可破盾。",
    opening: [
      "諸葛亮輕搖羽扇，新野市聲入耳。",
      "「先探聽黃巾弱點。城門一戰，當以智取。」",
    ],
    skills: [
      {
        id: "huoji",
        name: "火計",
        weapon: "fire",
        power: 11,
        hits: 1,
        shieldBonus: 0,
        bpCost: 0,
        text: "火攻，專剋火弱。",
      },
    ],
  },
  {
    id: "liubei",
    name: "劉備",
    title: "仁君",
    job: "昭烈",
    pathAction: "guide",
    weapon: "blade",
    maxHp: 32,
    maxBp: 5,
    atk: 7,
    accent: "#7a3b12",
    bio: "仁德可引導路人開口。雙股劍雖不烈，弱點命中仍能崩盾。",
    opening: [
      "劉備拱手入城，市井百姓側目。",
      "「先引導知情者同行，問明黃巾虛實，再赴城門。」",
    ],
    skills: [
      {
        id: "renyi",
        name: "仁義斬",
        weapon: "blade",
        power: 10,
        hits: 1,
        shieldBonus: 0,
        bpCost: 0,
        text: "劍勢端正，穩削一盾。",
      },
    ],
  },
  {
    id: "caocao",
    name: "曹操",
    title: "魏武",
    job: "奸雄",
    pathAction: "allure",
    weapon: "fire",
    maxHp: 33,
    maxBp: 5,
    atk: 8,
    accent: "#4a1020",
    bio: "挾天子而令諸侯。遊說可換情報，火攻與權謀一樣灼人。",
    opening: [
      "曹操立於新野驛道，目光如炬。",
      "「黃巾不過草寇。先遊說知情者，再燒他們的盾。」",
    ],
    skills: [
      {
        id: "jizhou",
        name: "奸雄令",
        weapon: "fire",
        power: 10,
        hits: 1,
        shieldBonus: 1,
        bpCost: 0,
        text: "令旗一揮，火勢削盾。",
      },
    ],
  },
  {
    id: "sunshangxiang",
    name: "孫尚香",
    title: "弓腰姬",
    job: "弓手",
    pathAction: "steal",
    weapon: "bow",
    maxHp: 30,
    maxBp: 5,
    atk: 8,
    accent: "#7a1f3a",
    bio: "江東弓馬，順手牽羊亦不誤正事。箭矢可點破遠盾。",
    opening: [
      "孫尚香把弓挎在肩上，笑看新野市集。",
      "「袋裡空空？先偷點情報——黃巾弱點值千金。」",
    ],
    skills: [
      {
        id: "liushi",
        name: "流矢",
        weapon: "bow",
        power: 6,
        hits: 2,
        shieldBonus: 0,
        bpCost: 0,
        text: "連射兩箭。",
      },
    ],
  },
  {
    id: "diaochan",
    name: "貂蟬",
    title: "閉月",
    job: "舞姬",
    pathAction: "purchase",
    weapon: "dark",
    maxHp: 27,
    maxBp: 5,
    atk: 7,
    accent: "#4b3a6a",
    bio: "閉月之姿，金帛可買口風。暗器專襲心防。",
    opening: [
      "貂蟬立於燈影裡，袖中暗器微響。",
      "「情報有價。買到黃巾弱點，北營便不足懼。」",
    ],
    skills: [
      {
        id: "biyue",
        name: "閉月",
        weapon: "dark",
        power: 11,
        hits: 1,
        shieldBonus: 0,
        bpCost: 0,
        text: "暗擊心防。",
      },
    ],
  },
];

export function heroById(id: HeroId): HeroDef {
  const hero = HEROES.find((h) => h.id === id);
  if (!hero) throw new Error(`unknown hero ${id}`);
  return hero;
}

export const YELLOW_WEAKNESSES: WeaponId[] = ["blade", "fire", "spear"];

export const MAPS: Record<LocationId, MapDef> = {
  xinye: {
    id: "xinye",
    name: "新野",
    width: 9,
    height: 7,
    start: { x: 4, y: 3 },
    blocked: [
      { x: 1, y: 1 },
      { x: 7, y: 1 },
      { x: 2, y: 5 },
    ],
    exits: [{ pos: { x: 4, y: 6 }, to: "gate", needFlag: "inquiredWeakness", battle: "gate" }],
    banner: "靠近人並使用路徑行動。先把黃巾的弱點問清楚。",
    npcs: [
      {
        id: "inn",
        name: "掌櫃",
        role: "客棧",
        pos: { x: 1, y: 2 },
        talks: ["客官住店？一夜養傷，五更再走。", "北營黃巾最怕刀與火，城門那些人也一樣。"],
        pathHint: "客棧人雜，適合探聽與過夜。",
        coward: false,
        merchant: false,
        inn: true,
        challengeable: false,
        knowsWeakness: true,
      },
      {
        id: "merchant",
        name: "商販",
        role: "貨郎",
        pos: { x: 7, y: 3 },
        talks: ["草藥二十錢，火油三十五。金創藥貴些。", "黃巾在官道攔商隊，弱點……得另說。"],
        pathHint: "貨郎只認錢與手快。",
        coward: false,
        merchant: true,
        inn: false,
        challengeable: false,
        knowsWeakness: false,
      },
      {
        id: "elder",
        name: "里長",
        role: "里長",
        pos: { x: 2, y: 4 },
        talks: ["新野還安穩。要打黃巾，先問清楚再出城門。", "有本事就挑戰我，輸了也別怨。"],
        pathHint: "里長吃硬不吃軟，可挑戰或決鬥。",
        coward: false,
        merchant: false,
        inn: false,
        challengeable: true,
        knowsWeakness: false,
      },
      {
        id: "traveler",
        name: "行商",
        role: "過客",
        pos: { x: 6, y: 5 },
        talks: ["官道上的黃巾盾厚，但刀、槍、火都能削。", "我只是路過，別連累我。"],
        pathHint: "過客心虛，探聽、威嚇、遊說都容易開口。",
        coward: true,
        merchant: false,
        inn: false,
        challengeable: false,
        knowsWeakness: true,
      },
    ],
  },
  gate: {
    id: "gate",
    name: "城門",
    width: 7,
    height: 5,
    start: { x: 3, y: 3 },
    blocked: [],
    exits: [{ pos: { x: 3, y: 0 }, to: "road", needFlag: "gateCleared" }],
    banner: "城門有攔路黃巾。削盾崩解後再往官道。",
    npcs: [],
  },
  road: {
    id: "road",
    name: "官道",
    width: 7,
    height: 6,
    start: { x: 3, y: 5 },
    blocked: [],
    exits: [{ pos: { x: 3, y: 0 }, to: "northcamp", needFlag: "roadCleared" }],
    banner: "官道伏兵。打通後直趨北營。",
    npcs: [],
  },
  northcamp: {
    id: "northcamp",
    name: "北營",
    width: 7,
    height: 5,
    start: { x: 3, y: 4 },
    blocked: [],
    exits: [],
    banner: "渠帥在營中。蓄力多段，趁崩解窗口了結。",
    npcs: [
      {
        id: "boss",
        name: "黃巾渠帥",
        role: "渠帥",
        pos: { x: 3, y: 1 },
        talks: ["來者何人？北營不是你們能踏的。"],
        pathHint: "渠帥只認刀槍。",
        coward: false,
        merchant: false,
        inn: false,
        challengeable: true,
        knowsWeakness: false,
      },
    ],
  },
};

export const ENCOUNTERS = {
  gate: {
    id: "gate",
    title: "城門攔路",
    enemies: [
      {
        id: "gate-a",
        name: "黃巾門卒",
        hp: 42,
        atk: 7,
        shields: 3,
        weaknesses: ["blade", "fire"] as WeaponId[],
      },
    ],
  },
  road: {
    id: "road",
    title: "官道伏兵",
    enemies: [
      {
        id: "road-a",
        name: "黃巾遊騎",
        hp: 48,
        atk: 8,
        shields: 3,
        weaknesses: ["spear", "blade", "fire"] as WeaponId[],
      },
    ],
  },
  boss: {
    id: "boss",
    title: "北營渠帥",
    enemies: [
      {
        id: "boss-a",
        name: "黃巾渠帥",
        hp: 70,
        atk: 7,
        shields: 4,
        weaknesses: ["blade", "fire", "spear"] as WeaponId[],
      },
    ],
  },
  elder: {
    id: "elder",
    title: "里長比試",
    enemies: [
      {
        id: "elder-a",
        name: "里長",
        hp: 30,
        atk: 5,
        shields: 2,
        weaknesses: ["blade", "axe", "spear"] as WeaponId[],
      },
    ],
  },
};

export const START_GOLD = 80;
export const START_ITEMS: Record<ItemId, number> = { herb: 2, salve: 0, oil: 1 };
export const INN_COST = 10;
export const TOUCH_MIN = 44;
export const GOLD = "#e4c56a";
export const INK = "#0b0e14";

export function portraitPath(id: string): string {
  return `./art/portrait-${id}.png`;
}
