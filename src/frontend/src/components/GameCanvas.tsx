// Trash Simulator – canvas mount for the Three.js engine
// Checks WebGL2, shows the loading state meanwhile and catches start-up errors.
import { useEffect, useRef } from "react";
import { Game } from "../game/engine";
import { useGame } from "../game/state";

function webgl2Available(): boolean {
  try {
    const probe = document.createElement("canvas");
    return probe.getContext("webgl2") != null;
  } catch {
    return false;
  }
}

export function GameCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const st = useGame.getState();

    if (!webgl2Available()) {
      st.setEngineStatus(
        "error",
        "WebGL2 在此浏览器中不可用。请开启硬件加速（浏览器设置 → 系统），或尝试使用最新版 Chrome/Firefox/Edge。在某些嵌入式预览窗口中，在独立标签页中打开应用会有所帮助。",
      );
      return;
    }

    st.setEngineStatus("booting");
    let game: Game | null = null;
    let cancelled = false;

    // Wait two frames so the loading screen is definitely painted before the
    // (blocking) world build starts.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        try {
          game = new Game(canvas);
        } catch (e) {
          const msg =
            e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e);
          useGame.getState().setEngineStatus("error", msg);
        }
      });
    });

    return () => {
      cancelled = true;
      game?.dispose();
      useGame.getState().setEngineStatus("idle");
    };
  }, []);

  return (
    <canvas ref={ref} className="absolute inset-0 h-full w-full touch-none" />
  );
}
