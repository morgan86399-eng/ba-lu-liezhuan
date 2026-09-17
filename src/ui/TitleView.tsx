import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { motionDuration } from "../game/view.ts";

export function TitleView({ onStart, onContinue, canContinue }: { onStart: () => void; onContinue: () => void; canContinue: boolean }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const d = motionDuration(0.9);
      gsap.fromTo(".title-mark", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: d, ease: "power2.out" });
      gsap.fromTo(".title-cta", { opacity: 0 }, { opacity: 1, duration: d, delay: motionDuration(0.25) });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="screen title-screen">
      <div className="title-veil" />
      <div className="title-mark">
        <p className="eyebrow">三國 · 歧路列傳</p>
        <h1>八路列傳</h1>
        <div className="gold-rule" />
        <p className="title-sub">八人開局 · 路徑行動 · 削盾蓄力</p>
      </div>
      <div className="title-cta">
        <button type="button" className="cta" onClick={onStart}>
          開卷
        </button>
        {canContinue ? (
          <button type="button" className="cta ghost" onClick={onContinue}>
            續寫
          </button>
        ) : null}
      </div>
    </section>
  );
}
