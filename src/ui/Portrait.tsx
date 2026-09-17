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
      <div
        className={`portrait portrait-fallback ${className ?? ""}`}
        data-hero={id ?? "none"}
        style={{ background: `radial-gradient(circle at 38% 28%, ${accent} 0%, #07080c 72%)` }}
      >
        <span className="seal">{name.slice(0, 1)}</span>
        <i className="portrait-haze" />
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
