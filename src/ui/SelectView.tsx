import { HEROES, PATH_LABEL, WEAPON_LABEL } from "../game/data.ts";
import type { HeroId } from "../game/types.ts";
import { Icon } from "./Icon.tsx";
import { Portrait } from "./Portrait.tsx";

export function SelectView({
  selected,
  onSelect,
  onConfirm,
}: {
  selected: HeroId | null;
  onSelect: (id: HeroId) => void;
  onConfirm: () => void;
}) {
  const hero = HEROES.find((h) => h.id === selected) ?? null;
  return (
    <section className="screen select-screen">
      <header className="select-head">
        <h1>選擇開局英雄</h1>
        <p>每位英雄有自己的路徑行動與戰技。第一章都會到新野。</p>
      </header>
      <div className="select-grid">
        {HEROES.map((h) => (
          <button
            key={h.id}
            type="button"
            className={`hero-card ${selected === h.id ? "is-on" : ""}`}
            onClick={() => onSelect(h.id)}
          >
            <Portrait id={h.id} name={h.name} />
            <div className="hero-meta">
              <strong>{h.name}</strong>
              <span>
                {h.title} · {h.job} · {PATH_LABEL[h.pathAction]}
              </span>
            </div>
          </button>
        ))}
      </div>
      {hero ? (
        <aside className="select-detail panel">
          <Portrait id={hero.id} name={hero.name} className="detail-art" />
          <div>
            <p className="eyebrow">
              {hero.title} · {hero.job}
            </p>
            <h2>{hero.name}</h2>
            <p className="bio">{hero.bio}</p>
            <p className="tags">
              <Icon name={hero.pathAction} size={18} /> {PATH_LABEL[hero.pathAction]}
              <Icon name={hero.weapon} size={18} /> {WEAPON_LABEL[hero.weapon]}
            </p>
            <button type="button" className="cta" onClick={onConfirm}>
              動身
            </button>
          </div>
        </aside>
      ) : null}
    </section>
  );
}
