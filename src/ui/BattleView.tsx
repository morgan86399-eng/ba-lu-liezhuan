import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { ITEMS, WEAPON_LABEL } from "../game/data.ts";
import type { BattleState, CommandId, ItemId } from "../game/types.ts";
import { boostOrbs, COMMANDS, currentActor, isAllyTurn, motionDuration, prefersReducedMotion, turnOrderActors } from "../game/view.ts";
import { Icon } from "./Icon.tsx";
import { Portrait } from "./Portrait.tsx";

export function BattleView({
  battle,
  inventory,
  onCommand,
  onSkill,
  onItem,
  onBoost,
  onTarget,
  onBack,
  onLeave,
  onEnemy,
}: {
  battle: BattleState;
  inventory: Record<ItemId, number>;
  onCommand: (cmd: CommandId) => void;
  onSkill: (id: string) => void;
  onItem: (id: ItemId) => void;
  onBoost: (n: 0 | 1 | 2 | 3) => void;
  onTarget: (id: string) => void;
  onBack: () => void;
  onLeave: () => void;
  onEnemy: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  const actor = currentActor(battle);
  const allyTurn = isAllyTurn(battle);
  const order = turnOrderActors(battle);

  useGSAP(
    () => {
      if (!battle.floaters.length) return;
      gsap.fromTo(
        ".floater",
        { opacity: 0, y: 12 },
        { opacity: 1, y: -18, duration: motionDuration(0.35), stagger: motionDuration(0.05), ease: "power2.out" },
      );
      if (battle.breakFlash) {
        gsap.fromTo(".break-flash", { opacity: 0.7 }, { opacity: 0, duration: motionDuration(0.4) });
      }
    },
    { scope: root, dependencies: [battle.floaters, battle.breakFlash] },
  );

  useEffect(() => {
    if (battle.phase === "won" || battle.phase === "lost") {
      const t = window.setTimeout(onLeave, prefersReducedMotion() ? 0 : 900);
      return () => window.clearTimeout(t);
    }
    if (battle.phase === "resolving") {
      const t = window.setTimeout(onEnemy, prefersReducedMotion() ? 0 : 520);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [battle.phase, onLeave, onEnemy]);

  return (
    <section ref={root} className="screen battle-screen">
      <div className="break-flash" hidden={!battle.breakFlash} />
      <ol className="turn-bar">
        {order.map((u) => (
          <li key={u.id} className={`${u.active ? "is-on" : ""} ${u.enemy ? "enemy" : ""}`}>
            <Portrait id={u.heroId ?? (u.enemy ? undefined : undefined)} name={u.name} />
            <span>{u.name}</span>
          </li>
        ))}
      </ol>

      <div className="battle-field">
        {battle.enemies.map((e) => (
          <button
            key={e.id}
            type="button"
            className={`foe ${e.broken ? "broken" : ""} ${battle.phase === "target" ? "can-target" : ""}`}
            onClick={() => battle.phase === "target" && onTarget(e.id)}
            disabled={e.hp <= 0}
          >
            <div className="foe-art" />
            <strong>{e.name}</strong>
            <div className="hp-line">
              <b style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
            </div>
            <div className="shield-row" aria-label="盾">
              {Array.from({ length: e.maxShields }).map((_, i) => (
                <Icon key={i} name={i < e.shields && !e.broken ? "shield" : "shieldBroken"} size={20} />
              ))}
              {e.broken ? <em className="break-tag">崩解</em> : null}
            </div>
            <div className="weak-row">
              {(e.broken ? e.weaknesses : e.revealed).map((w) => (
                <span key={w} className="weak-ico" title={WEAPON_LABEL[w]}>
                  <Icon name={w} size={18} />
                </span>
              ))}
              {!e.broken && e.revealed.length === 0 ? <span className="weak-unknown">弱點未明</span> : null}
            </div>
            {battle.floaters
              .filter((f) => f.actorId === e.id)
              .map((f) => (
                <i key={f.id} className={`floater ${f.kind}`}>
                  {f.text}
                </i>
              ))}
          </button>
        ))}
      </div>

      <p className="battle-toast">{battle.toast}</p>

      <footer className="battle-dock">
        {battle.allies.map((a) => (
          <div key={a.id} className="ally-chip">
            <Portrait id={a.heroId} name={a.name} />
            <div>
              <strong>{a.name}</strong>
              <span>
                氣血 {a.hp}/{a.maxHp}
              </span>
              <div className="orb-read">
                {boostOrbs(a.bp, 0).map((o) => (
                  <i key={o.index} className={o.filled ? "filled" : ""} />
                ))}
              </div>
            </div>
          </div>
        ))}

        {battle.phase === "won" || battle.phase === "lost" ? (
          <div className="cmd-bar">
            <button type="button" className="cmd is-on" onClick={onLeave}>
              {battle.phase === "won" ? "繼續" : "回客棧"}
            </button>
          </div>
        ) : null}

        {allyTurn && battle.phase === "command" ? (
          <div className="cmd-bar">
            {COMMANDS.map((c) => (
              <button key={c.id} type="button" className="cmd" onClick={() => onCommand(c.id)}>
                <Icon name={c.id} />
                {c.label}
              </button>
            ))}
          </div>
        ) : null}

        {battle.phase === "skill" && actor ? (
          <div className="cmd-bar sub">
            <button type="button" className="cmd" onClick={onBack}>
              返回
            </button>
            {actor.skills.map((s) => (
              <button key={s.id} type="button" className="cmd" onClick={() => onSkill(s.id)}>
                {s.name}
              </button>
            ))}
          </div>
        ) : null}

        {battle.phase === "item" ? (
          <div className="cmd-bar sub">
            <button type="button" className="cmd" onClick={onBack}>
              返回
            </button>
            {(Object.keys(ITEMS) as ItemId[]).map((id) => (
              <button key={id} type="button" className="cmd" disabled={inventory[id] <= 0} onClick={() => onItem(id)}>
                {ITEMS[id].name} ×{inventory[id]}
              </button>
            ))}
          </div>
        ) : null}

        {battle.phase === "boost" && actor ? (
          <div className="boost-bar">
            <p>蓄力 0–3 · 現有氣力 {actor.bp}</p>
            <div className="orbs">
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`orb-hit ${battle.boost === n ? "is-on" : ""}`}
                  disabled={n > actor.bp}
                  onClick={() => onBoost(n as 0 | 1 | 2 | 3)}
                >
                  {n === 0 ? (
                    "不蓄"
                  ) : (
                    <>
                      {Array.from({ length: n }).map((_, i) => (
                        <i key={i} className="orb" />
                      ))}
                    </>
                  )}
                </button>
              ))}
            </div>
            <button type="button" className="cmd ghost" onClick={onBack}>
              返回
            </button>
          </div>
        ) : null}

        {battle.phase === "target" ? <p className="hint">點選敵人。</p> : null}
      </footer>
    </section>
  );
}
