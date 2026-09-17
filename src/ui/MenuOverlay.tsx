import { heroById, INN_COST, ITEMS } from "../game/data.ts";
import type { GameState, ItemId, MenuTab } from "../game/types.ts";
import { Icon } from "./Icon.tsx";
import { Portrait } from "./Portrait.tsx";

const TABS: { id: MenuTab; label: string }[] = [
  { id: "items", label: "道具" },
  { id: "status", label: "狀態" },
  { id: "save", label: "存檔" },
];

export function MenuOverlay({
  state,
  onTab,
  onClose,
  onBuy,
  onRest,
  onSave,
  onTitle,
}: {
  state: GameState;
  onTab: (tab: MenuTab) => void;
  onClose: () => void;
  onBuy: (id: ItemId) => void;
  onRest: () => void;
  onSave: () => void;
  onTitle: () => void;
}) {
  const hero = state.heroId ? heroById(state.heroId) : null;
  return (
    <div className="menu-layer">
      <div className="menu-panel panel">
        <header className="menu-head">
          <h2>列傳</h2>
          <p>
            金錢 {state.gold} · 等級 {state.level} · 閱歷 {state.exp}
          </p>
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.id} type="button" className={state.menuTab === t.id ? "is-on" : ""} onClick={() => onTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </header>

        {state.menuTab === "status" && hero ? (
          <section className="menu-body">
            <div className="status-row">
              <Portrait id={hero.id} name={hero.name} />
              <div>
                <strong>{hero.name}</strong>
                <span>
                  {hero.job} · 氣血 {state.hp}/{hero.maxHp} · 氣力 {state.bp}
                </span>
              </div>
            </div>
            <h3>記下的事</h3>
            <ul className="journal">
              {state.journal.slice(-4).map((j) => (
                <li key={j}>{j}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {state.menuTab === "items" ? (
          <section className="menu-body">
            <h3>行囊</h3>
            {(Object.keys(ITEMS) as ItemId[]).map((id) => {
              const item = ITEMS[id];
              return (
                <div key={id} className="item-row">
                  <Icon name="item" size={20} />
                  <span>
                    {item.name} ×{state.inventory[id]}
                  </span>
                  <button type="button" onClick={() => onBuy(id)}>
                    買 {item.price} 錢
                  </button>
                </div>
              );
            })}
            <button type="button" className="cta ghost" onClick={onRest}>
              客棧過夜 · {INN_COST} 錢
            </button>
          </section>
        ) : null}

        {state.menuTab === "save" ? (
          <section className="menu-body">
            <p>寫入此器本機。不經雲端。</p>
            <div className="menu-actions">
              <button type="button" className="cta" onClick={onSave}>
                <Icon name="save" size={18} /> 存檔
              </button>
              <button type="button" className="cta ghost" onClick={onTitle}>
                回標題
              </button>
            </div>
          </section>
        ) : null}

        <footer className="menu-foot">
          <button type="button" className="cta ghost" onClick={onClose}>
            關閉
          </button>
          {state.lastPathResult ? <p className="hint">{state.lastPathResult}</p> : null}
        </footer>
      </div>
    </div>
  );
}
