import { heroById, portraitPath } from "../game/data.ts";
import type { HeroId } from "../game/types.ts";
import { useState } from "react";

const HAS_FILE: Record<string, boolean> = { caocao: true };

export function Portrait({
  id,
  name,
  className,
}: {
  id?: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(!id || !HAS_FILE[id]);
  const hero = isHero(id) ? heroById(id) : null;
  const accent = hero?.accent ?? "#2a2d38";
  if (failed || !id) {
    return (
      <div className={`portrait portrait-fallback ${className ?? ""}`} style={{ background: `radial-gradient(circle at 40% 30%, ${accent} 0%, #0b0e14 75%)` }}>
        <span>{name.slice(0, 1)}</span>
      </div>
    );
  }
  return (
    <img
      className={`portrait ${className ?? ""}`}
      src={portraitPath(id)}
      alt={name}
      onError={() => setFailed(true)}
    />
  );
}

function isHero(id?: string): id is HeroId {
  return Boolean(
    id &&
      ["guanyu", "zhaoyun", "zhangfei", "zhuge", "liubei", "caocao", "sunshangxiang", "diaochan"].includes(id),
  );
}
