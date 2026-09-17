import { heroById, MAPS, PATH_LABEL } from "../game/data.ts";
import type { GameState } from "../game/types.ts";
import { chapterGoal, nearbyNpc, pathActionVisible, timeLabel } from "../game/view.ts";
import { Icon } from "./Icon.tsx";
import { Portrait } from "./Portrait.tsx";

export function WorldView({
  state,
  onMove,
  onTalk,
  onPath,
  onPathDo,
  onPathCancel,
  onMenu,
}: {
  state: GameState;
  onMove: (dx: number, dy: number) => void;
  onTalk: () => void;
  onPath: () => void;
  onPathDo: () => void;
  onPathCancel: () => void;
  onMenu: () => void;
}) {
  const map = MAPS[state.locationId];
  const hero = state.heroId ? heroById(state.heroId) : null;
  const npc = nearbyNpc(map, state.pos);
  const showPath = pathActionVisible(map, state.pos);
  const goal = chapterGoal(state.locationId, state.flags);

  return (
    <section className={`screen world-screen loc-${map.id}`}>
      <div className="world-stage" style={{ ["--cols" as string]: map.width, ["--rows" as string]: map.height }}>
        {map.exits.map((ex) => (
          <div
            key={`${ex.to}-${ex.pos.x}-${ex.pos.y}`}
            className="pin exit-pin"
            style={{ left: `${((ex.pos.x + 0.5) / map.width) * 100}%`, top: `${((ex.pos.y + 0.5) / map.height) * 100}%` }}
          >
            <span className="pin-name">{MAPS[ex.to].name}</span>
          </div>
        ))}
        {map.npcs.map((n) => (
          <div
            key={n.id}
            className="pin npc-pin"
            style={{ left: `${((n.pos.x + 0.5) / map.width) * 100}%`, top: `${((n.pos.y + 0.5) / map.height) * 100}%` }}
          >
            <span className="pin-name">{n.name}</span>
          </div>
        ))}
        {hero ? (
          <div
            className="pin you-pin"
            style={{ left: `${((state.pos.x + 0.5) / map.width) * 100}%`, top: `${((state.pos.y + 0.5) / map.height) * 100}%` }}
          >
            <Portrait id={hero.id} name={hero.name} />
            <span className="pin-name">{hero.name}</span>
          </div>
        ) : null}
      </div>

      <header className="hud-top">
        <div className="hud-place panel">
          <strong>
            {map.name} · {timeLabel(state.timeOfDay)}
          </strong>
          <span>
            金錢 {state.gold} · 等級 {state.level}
          </span>
        </div>
        <div className="hud-mini panel" aria-label="迷你地圖">
          {Array.from({ length: map.height }).map((_, y) => (
            <div key={y} className="mini-row">
              {Array.from({ length: map.width }).map((__, x) => {
                const you = state.pos.x === x && state.pos.y === y;
                const person = map.npcs.some((n) => n.pos.x === x && n.pos.y === y);
                return <i key={`${x}-${y}`} className={you ? "you" : person ? "npc" : ""} />;
              })}
            </div>
          ))}
          <span>黃點是你 · 白點是人</span>
        </div>
      </header>

      <div className="goal-banner panel">{goal}</div>

      {state.pathPreview ? (
        <div className="path-confirm panel">
          <p className="eyebrow">{hero ? PATH_LABEL[hero.pathAction] : "路徑行動"}</p>
          <h3>
            {state.pathPreview.label} · {npc?.name}
          </h3>
          <p>成功率 {state.pathPreview.rate}%</p>
          <p>{state.pathPreview.condition}</p>
          <p>{state.pathPreview.preview}</p>
          <div className="path-actions">
            <button type="button" className="cta" onClick={onPathDo}>
              執行
            </button>
            <button type="button" className="cta ghost" onClick={onPathCancel}>
              取消
            </button>
          </div>
        </div>
      ) : null}

      <div className="pad" aria-label="方向">
        <button type="button" className="pad-btn" onClick={() => onMove(0, -1)} aria-label="上">
          <Icon name="up" />
        </button>
        <div className="pad-mid">
          <button type="button" className="pad-btn" onClick={() => onMove(-1, 0)} aria-label="左">
            <Icon name="left" />
          </button>
          <button type="button" className="pad-btn" onClick={() => onMove(1, 0)} aria-label="右">
            <Icon name="right" />
          </button>
        </div>
        <button type="button" className="pad-btn" onClick={() => onMove(0, 1)} aria-label="下">
          <Icon name="down" />
        </button>
      </div>

      <div className="ctx">
        {npc ? (
          <button type="button" className="ctx-btn" onClick={onTalk}>
            <Icon name="talk" />
            交談 · {npc.name}
          </button>
        ) : null}
        {showPath && hero ? (
          <button type="button" className="ctx-btn gold" onClick={onPath}>
            <Icon name={hero.pathAction} />
            {PATH_LABEL[hero.pathAction]} · {npc?.name}
          </button>
        ) : null}
        <button type="button" className="ctx-btn" onClick={onMenu}>
          <Icon name="menu" />
          列傳
        </button>
      </div>
    </section>
  );
}
