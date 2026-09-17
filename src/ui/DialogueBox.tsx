import type { DialogueLine } from "../game/types.ts";
import { Portrait } from "./Portrait.tsx";

export function DialogueBox({
  line,
  onNext,
}: {
  line: DialogueLine;
  onNext: () => void;
}) {
  return (
    <div className="dialogue-layer" onClick={onNext} role="presentation">
      {line.portrait ? <Portrait id={line.portrait} name={line.speaker} className="dialogue-bust" /> : null}
      <div className="dialogue-box panel">
        <div className="speaker-plate">{line.speaker}</div>
        <p>{line.text}</p>
        <span className="dialogue-next">點擊續</span>
      </div>
    </div>
  );
}
