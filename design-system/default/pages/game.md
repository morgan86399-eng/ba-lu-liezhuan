# 八路列傳 — 執行期設計覆寫

本頁優先於任何 MASTER 設計稿。執行期 UI 必須遵守：

- 字體：標題 `Noto Serif TC`，內文 `Noto Sans TC`。禁止 Inter、系統企業無襯線。
- 主色金 `#e4c56a`，暗底 `#0b0e14` / `#12141c`。禁止企業綠 `#15803D`。
- 圖示：SVG（`Icon.tsx`）。禁止 emoji 當主 UI。
- 版面：`100dvh` + `safe-area`；主按鈕 ≥ 44×44；320–768 無整頁橫向捲動。
- 動效：只動 `transform` / `opacity`。`prefers-reduced-motion: reduce` 時 duration 0。
- 戰鬥資訊層級：出手順序 → 盾列／弱點圖示 → 蓄力珠 → 底部指令列。
