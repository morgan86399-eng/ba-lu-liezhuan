import { useCallback, useEffect, useReducer } from "react";
import { reduce } from "./game/reducer.ts";
import { freshState, restore } from "./game/save.ts";
import { BattleView } from "./ui/BattleView.tsx";
import { DialogueBox } from "./ui/DialogueBox.tsx";
import { MenuOverlay } from "./ui/MenuOverlay.tsx";
import { SelectView } from "./ui/SelectView.tsx";
import { TitleView } from "./ui/TitleView.tsx";
import { WorldView } from "./ui/WorldView.tsx";

const saved = restore();

export function App() {
  const [state, dispatch] = useReducer(reduce, saved ?? freshState());

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (state.screen === "dialogue") {
        if (e.key === "Enter" || e.key === " ") dispatch({ type: "DIALOGUE_NEXT" });
        return;
      }
      if (state.screen === "world") {
        if (e.key === "Escape") dispatch({ type: state.menuOpen ? "MENU_CLOSE" : "MENU_OPEN" });
        if (state.menuOpen || state.pathPreview) return;
        const map: Record<string, [number, number]> = {
          ArrowUp: [0, -1],
          ArrowDown: [0, 1],
          ArrowLeft: [-1, 0],
          ArrowRight: [1, 0],
          w: [0, -1],
          s: [0, 1],
          a: [-1, 0],
          d: [1, 0],
        };
        const step = map[e.key];
        if (step) dispatch({ type: "MOVE", dx: step[0], dy: step[1] });
        if (e.key === "Enter") dispatch({ type: "TALK" });
      }
    },
    [state.screen, state.menuOpen, state.pathPreview],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  return (
    <div className="app-root">
      {state.screen === "title" ? (
        <TitleView
          onStart={() => dispatch({ type: "START" })}
          onContinue={() => {
            const loaded = restore();
            if (loaded) dispatch({ type: "LOAD", state: loaded });
          }}
          canContinue={Boolean(restore())}
        />
      ) : null}

      {state.screen === "select" ? (
        <SelectView
          selected={state.selectedHero}
          onSelect={(id) => dispatch({ type: "HOVER_HERO", id })}
          onConfirm={() => dispatch({ type: "CONFIRM_HERO" })}
        />
      ) : null}

      {state.screen === "world" || (state.screen === "dialogue" && state.afterDialogue === "world" && state.heroId) ? (
        <WorldView
          state={state}
          onMove={(dx, dy) => dispatch({ type: "MOVE", dx, dy })}
          onTalk={() => dispatch({ type: "TALK" })}
          onPath={() => dispatch({ type: "PATH_OPEN" })}
          onPathDo={() => dispatch({ type: "PATH_DO" })}
          onPathCancel={() => dispatch({ type: "PATH_CANCEL" })}
          onMenu={() => dispatch({ type: "MENU_OPEN" })}
        />
      ) : null}

      {state.screen === "battle" && state.battle ? (
        <BattleView
          battle={state.battle}
          inventory={state.inventory}
          onCommand={(cmd) => dispatch({ type: "BATTLE_CMD", cmd })}
          onSkill={(skillId) => dispatch({ type: "BATTLE_SKILL", skillId })}
          onItem={(item) => dispatch({ type: "BATTLE_ITEM", item })}
          onBoost={(boost) => dispatch({ type: "BATTLE_BOOST", boost })}
          onTarget={(id) => dispatch({ type: "BATTLE_TARGET", id })}
          onBack={() => dispatch({ type: "BATTLE_BACK" })}
          onLeave={() => dispatch({ type: "BATTLE_LEAVE" })}
          onEnemy={() => dispatch({ type: "BATTLE_ENEMY" })}
        />
      ) : null}

      {state.screen === "ending" ? (
        <section className="screen ending-screen">
          <div className="title-mark">
            <p className="eyebrow">第一章終</p>
            <h1>北營既破</h1>
            <div className="gold-rule" />
            <p>渠帥授首。八路列傳，此為開篇。</p>
            <button type="button" className="cta" onClick={() => dispatch({ type: "TITLE" })}>
              回標題
            </button>
          </div>
        </section>
      ) : null}

      {state.screen === "dialogue" && state.dialogue ? (
        <DialogueBox line={state.dialogue[state.dialogueIndex]!} onNext={() => dispatch({ type: "DIALOGUE_NEXT" })} />
      ) : null}

      {state.menuOpen ? (
        <MenuOverlay
          state={state}
          onTab={(tab) => dispatch({ type: "MENU_TAB", tab })}
          onClose={() => dispatch({ type: "MENU_CLOSE" })}
          onBuy={(item) => dispatch({ type: "BUY", item })}
          onRest={() => dispatch({ type: "REST" })}
          onSave={() => dispatch({ type: "SAVE" })}
          onTitle={() => dispatch({ type: "TITLE" })}
        />
      ) : null}
    </div>
  );
}
