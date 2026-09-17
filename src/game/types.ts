export type WeaponId =
  | "blade"
  | "spear"
  | "axe"
  | "bow"
  | "fan"
  | "fire"
  | "lightning"
  | "dark";

export type PathActionId =
  | "challenge"
  | "duel"
  | "intimidate"
  | "inquire"
  | "guide"
  | "allure"
  | "steal"
  | "purchase";

export type HeroId =
  | "guanyu"
  | "zhaoyun"
  | "zhangfei"
  | "zhuge"
  | "liubei"
  | "caocao"
  | "sunshangxiang"
  | "diaochan";

export type ItemId = "herb" | "salve" | "oil";

export type LocationId = "xinye" | "gate" | "road" | "northcamp";

export type TimeOfDay = "dawn" | "day" | "dusk" | "night";

export type CommandId = "attack" | "skill" | "defend" | "item";

export type MenuTab = "items" | "status" | "save";

export type ScreenId = "title" | "select" | "dialogue" | "world" | "battle" | "ending";

export interface Pos {
  x: number;
  y: number;
}

export interface SkillDef {
  id: string;
  name: string;
  weapon: WeaponId;
  power: number;
  hits: number;
  shieldBonus: number;
  bpCost: number;
  text: string;
}

export interface HeroDef {
  id: HeroId;
  name: string;
  title: string;
  job: string;
  pathAction: PathActionId;
  weapon: WeaponId;
  maxHp: number;
  maxBp: number;
  atk: number;
  bio: string;
  opening: string[];
  skills: SkillDef[];
  accent: string;
}

export interface ItemDef {
  id: ItemId;
  name: string;
  price: number;
  heal: number;
  damage: number;
  weapon: WeaponId | null;
  text: string;
}

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  pos: Pos;
  talks: string[];
  pathHint: string;
  coward: boolean;
  merchant: boolean;
  inn: boolean;
  challengeable: boolean;
  knowsWeakness: boolean;
}

export interface MapDef {
  id: LocationId;
  name: string;
  width: number;
  height: number;
  start: Pos;
  blocked: Pos[];
  exits: { pos: Pos; to: LocationId; needFlag?: keyof StoryFlags; battle?: string }[];
  npcs: NpcDef[];
  banner: string;
}

export interface StoryFlags {
  inquiredWeakness: boolean;
  gateCleared: boolean;
  roadCleared: boolean;
  bossCleared: boolean;
  chapter1Done: boolean;
  rested: boolean;
}

export interface Combatant {
  id: string;
  name: string;
  heroId?: HeroId;
  hp: number;
  maxHp: number;
  bp: number;
  maxBp: number;
  atk: number;
  shields: number;
  maxShields: number;
  broken: boolean;
  breakTurns: number;
  weaknesses: WeaponId[];
  revealed: WeaponId[];
  skills: SkillDef[];
  isEnemy: boolean;
  defending: boolean;
}

export type BattlePhase =
  | "command"
  | "boost"
  | "skill"
  | "item"
  | "target"
  | "resolving"
  | "won"
  | "lost";

export interface Floater {
  id: string;
  text: string;
  kind: "dmg" | "break" | "weak" | "heal" | "miss";
  actorId: string;
}

export interface BattleState {
  encounterId: string;
  title: string;
  allies: Combatant[];
  enemies: Combatant[];
  turnQueue: string[];
  turnIndex: number;
  phase: BattlePhase;
  command: CommandId | null;
  boost: 0 | 1 | 2 | 3;
  skillId: string | null;
  itemId: ItemId | null;
  toast: string;
  log: string[];
  floaters: Floater[];
  breakFlash: boolean;
}

export interface PathPreview {
  action: PathActionId;
  label: string;
  rate: number;
  condition: string;
  preview: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  portrait?: string;
}

export interface GameState {
  screen: ScreenId;
  selectedHero: HeroId | null;
  heroId: HeroId | null;
  gold: number;
  level: number;
  exp: number;
  hp: number;
  bp: number;
  inventory: Record<ItemId, number>;
  flags: StoryFlags;
  locationId: LocationId;
  pos: Pos;
  timeOfDay: TimeOfDay;
  journal: string[];
  dialogue: DialogueLine[] | null;
  dialogueIndex: number;
  afterDialogue: ScreenId | null;
  battle: BattleState | null;
  menuOpen: boolean;
  menuTab: MenuTab;
  pathPreview: PathPreview | null;
  lastPathResult: string | null;
}
