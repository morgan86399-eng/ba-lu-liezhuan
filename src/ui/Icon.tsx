import type { CommandId, PathActionId, WeaponId } from "../game/types.ts";

type IconName =
  | WeaponId
  | CommandId
  | PathActionId
  | "shield"
  | "shieldBroken"
  | "menu"
  | "talk"
  | "up"
  | "down"
  | "left"
  | "right"
  | "close"
  | "save"
  | "gold"
  | "hp"
  | "bp";

const paths: Record<IconName, string> = {
  blade: "M5 19 L15 4 L18 6 L8 21 Z M7 17 L4 20",
  spear: "M12 3 L13 14 L16 21 L12 19 L8 21 L11 14 Z M11 8 H13",
  axe: "M4 8 L12 4 L14 8 L10 10 L20 18 L18 20 L8 12 Z",
  bow: "M6 4 Q18 12 6 20 M6 4 L18 12 L6 20 M10 12 H16",
  fan: "M12 20 L4 8 Q12 4 20 8 Z M12 20 V9",
  fire: "M12 3 C12 10 7 11 7 15 A5 5 0 0 0 17 15 C17 11 12 10 12 3 M10 17 Q12 14 14 17",
  lightning: "M13 2 L6 13 H12 L10 22 L19 10 H13 Z",
  dark: "M12 3 A8 8 0 1 0 12 21 A6 6 0 0 1 12 3",
  attack: "M4 18 L14 5 L18 8 L8 21 Z",
  skill: "M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z",
  defend: "M12 3 L20 7 V12 C20 17 12 21 12 21 C12 21 4 17 4 12 V7 Z",
  item: "M8 8 H16 V20 H8 Z M8 8 L12 4 L16 8",
  challenge: "M6 18 L12 5 L18 18 Z M9 14 H15",
  duel: "M4 16 L10 6 M14 6 L20 16 M8 12 H16",
  intimidate: "M6 8 Q12 2 18 8 L16 20 H8 Z M10 11 H14",
  inquire: "M8 6 H16 V14 H12 L9 18 V14 H8 Z",
  guide: "M8 18 V10 L12 6 L16 10 V18 M10 18 V13 H14 V18",
  allure: "M12 5 Q16 9 12 12 Q8 9 12 5 M8 14 Q12 20 16 14",
  steal: "M9 11 A4 4 0 1 1 15 15 L18 18",
  purchase: "M6 8 H18 L17 18 H7 Z M9 8 V6 A3 3 0 0 1 15 6 V8",
  shield: "M12 3 L20 6 V12 C20 17 12 21 12 21 C12 21 4 17 4 12 V6 Z",
  shieldBroken: "M12 3 L20 6 V11 L15 13 L20 16 C18 19 12 21 12 21 C12 21 4 17 4 12 V6 Z M9 10 L15 16 M15 10 L9 16",
  menu: "M5 7 H19 M5 12 H19 M5 17 H19",
  talk: "M5 6 H19 V15 H12 L8 19 V15 H5 Z",
  up: "M6 14 L12 8 L18 14",
  down: "M6 10 L12 16 L18 10",
  left: "M14 6 L8 12 L14 18",
  right: "M10 6 L16 12 L10 18",
  close: "M7 7 L17 17 M17 7 L7 17",
  save: "M6 5 H16 L18 7 V19 H6 Z M8 5 V9 H16 V5 M8 13 H16",
  gold: "M12 4 A8 8 0 1 0 12 20 A8 8 0 1 0 12 4 M8 12 H16",
  hp: "M12 19 C12 19 4 13 4 9 A4 4 0 0 1 12 8 A4 4 0 0 1 20 9 C20 13 12 19 12 19",
  bp: "M12 4 L14 10 H20 L15 14 L17 20 L12 16 L7 20 L9 14 L4 10 H10 Z",
};

export function Icon({
  name,
  size = 22,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className ?? "icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={paths[name]} />
    </svg>
  );
}

export type { IconName };
