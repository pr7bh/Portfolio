import { useEffect, useRef, useState } from "react";
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp } from "@tabler/icons-react";
import { playSfx } from "./uiSounds";
import { haptic } from "./fx";
import { unlock } from "./achievements";

const COLS = 24;
const ROWS = 14;
const BEST_KEY = "snake-best";
const DIRS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};
const KEYS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

/* Snake, played inside the terminal. Arrows / WASD (or swipe and the
   on-screen pad on phones), Space pauses, Esc quits, Enter restarts. */
export default function Snake({ onExit }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const game = useRef(null);
  const [ui, setUi] = useState({ score: 0, best: readBest(), state: "ready" });
  const exited = useRef(false);
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let cell = 16;

    const size = () => {
      const w = Math.min(wrapRef.current.clientWidth, 520);
      cell = Math.floor(w / COLS);
      canvas.width = cell * COLS * dpr;
      canvas.height = cell * ROWS * dpr;
      canvas.style.width = `${cell * COLS}px`;
      canvas.style.height = `${cell * ROWS}px`;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const placeFood = (snake) => {
      let f;
      do f = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];
      while (snake.some(([x, y]) => x === f[0] && y === f[1]));
      return f;
    };

    const reset = () => {
      const snake = [[6, 7], [5, 7], [4, 7]];
      game.current = { snake, dir: "right", queue: [], food: placeFood(snake), score: 0, state: "ready", last: 0, acc: 0 };
      setUi((u) => ({ ...u, score: 0, state: "ready" }));
    };

    const draw = (now) => {
      const s = game.current;
      g.clearRect(0, 0, COLS * cell, ROWS * cell);
      // Grid dots
      g.fillStyle = "rgba(255,255,255,0.06)";
      for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) g.fillRect(x * cell + cell / 2 - 1, y * cell + cell / 2 - 1, 2, 2);
      // Food: pulsing amber orb
      const pulse = 0.75 + 0.25 * Math.sin(now / 160);
      const [fx, fy] = s.food;
      g.shadowColor = "rgba(255,162,76,0.9)";
      g.shadowBlur = 14 * pulse;
      g.fillStyle = "#ffa24c";
      g.beginPath();
      g.arc(fx * cell + cell / 2, fy * cell + cell / 2, (cell / 2.6) * pulse, 0, Math.PI * 2);
      g.fill();
      // Snake: cool blue tail → white head
      const n = s.snake.length;
      s.snake.forEach(([x, y], i) => {
        const t = 1 - i / Math.max(1, n - 1);
        g.shadowColor = "rgba(147,241,255,0.8)";
        g.shadowBlur = i === 0 ? 16 : 6;
        g.fillStyle = `rgb(${Math.round(147 + 108 * t)}, ${Math.round(241 + 14 * t)}, 255)`;
        const pad = i === 0 ? 1 : 2;
        g.beginPath();
        g.roundRect(x * cell + pad, y * cell + pad, cell - pad * 2, cell - pad * 2, 4);
        g.fill();
      });
      g.shadowBlur = 0;
    };

    const step = () => {
      const s = game.current;
      const next = s.queue.shift();
      if (next) s.dir = next;
      const [dx, dy] = DIRS[s.dir];
      const [hx, hy] = s.snake[0];
      const head = [hx + dx, hy + dy];
      const hitWall = head[0] < 0 || head[1] < 0 || head[0] >= COLS || head[1] >= ROWS;
      const hitSelf = s.snake.some(([x, y]) => x === head[0] && y === head[1]);
      if (hitWall || hitSelf) {
        s.state = "over";
        playSfx("error");
        haptic("close");
        const best = Math.max(readBest(), s.score);
        try {
          localStorage.setItem(BEST_KEY, String(best));
        } catch {
          /* ignore */
        }
        setUi({ score: s.score, best, state: "over" });
        return;
      }
      s.snake.unshift(head);
      if (head[0] === s.food[0] && head[1] === s.food[1]) {
        s.score += 1;
        s.food = placeFood(s.snake);
        playSfx("type");
        haptic("field");
        if (s.score >= 10) unlock("arcade");
        setUi((u) => ({ ...u, score: s.score }));
      } else {
        s.snake.pop();
      }
    };

    let raf = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const s = game.current;
      if (s.state === "playing") {
        const interval = Math.max(58, 135 - s.score * 4);
        s.acc += Math.min(100, now - (s.last || now));
        while (s.acc >= interval && s.state === "playing") {
          s.acc -= interval;
          step();
        }
      }
      s.last = now;
      draw(now);
    };

    size();
    reset();
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", size);
    wrapRef.current.focus({ preventScroll: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);

  const turn = (dir) => {
    const s = game.current;
    if (!s || exited.current) return;
    if (s.state === "over") return;
    if (s.state !== "playing") {
      s.state = "playing";
      setUi((u) => ({ ...u, state: "playing" }));
    }
    const last = s.queue[s.queue.length - 1] || s.dir;
    const [lx, ly] = DIRS[last];
    const [nx, ny] = DIRS[dir];
    if (lx + nx === 0 && ly + ny === 0) return; // no reversing into yourself
    if (s.queue.length < 3) s.queue.push(dir);
  };

  const restart = () => {
    const s = game.current;
    const snake = [[6, 7], [5, 7], [4, 7]];
    Object.assign(s, { snake, dir: "right", queue: [], score: 0, state: "playing", acc: 0 });
    let f;
    do f = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];
    while (snake.some(([x, y]) => x === f[0] && y === f[1]));
    s.food = f;
    setUi((u) => ({ ...u, score: 0, state: "playing" }));
  };

  const quit = () => {
    if (exited.current) return;
    exited.current = true;
    const s = game.current;
    if (s) s.state = "over";
    setUi((u) => ({ ...u, state: "quit" }));
    onExit?.(s?.score ?? 0);
  };

  const onKeyDown = (e) => {
    if (exited.current) return;
    // Keep keys inside the game (not the terminal, page or shortcuts).
    e.stopPropagation();
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === "Escape" || key === "q") {
      e.preventDefault();
      quit();
    } else if (KEYS[key]) {
      e.preventDefault();
      turn(KEYS[key]);
    } else if (key === " ") {
      e.preventDefault();
      const s = game.current;
      if (s.state === "playing") s.state = "paused";
      else if (s.state === "paused") s.state = "playing";
      setUi((u) => ({ ...u, state: s.state }));
    } else if (key === "Enter" || key === "r") {
      e.preventDefault();
      if (game.current.state === "over") restart();
    }
  };

  // Swipe on the board
  const swipe = useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    swipe.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!swipe.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - swipe.current.x;
    const dy = t.clientY - swipe.current.y;
    swipe.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) {
      if (game.current.state === "over") restart();
      return;
    }
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  };

  const status = {
    ready: touch ? "Swipe or use the pad to start" : "Press an arrow key / WASD to start",
    playing: touch ? "Swipe to steer" : "Space pause · Esc quit",
    paused: "Paused — Space to resume",
    over: touch ? "Game over — tap the board to retry" : "Game over — Enter to retry · Esc to quit",
    quit: "Thanks for playing.",
  }[ui.state];

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        e.stopPropagation();
        if (!exited.current) wrapRef.current.focus({ preventScroll: true });
      }}
      data-sfx="none"
      className="my-2 w-full max-w-[520px] rounded-xl border border-white/10 bg-black/40 p-3 outline-none focus-visible:border-(--cool)/40"
      aria-label="Snake game"
    >
      <div className="mb-2 flex items-center justify-between text-[0.7rem]">
        <span>
          <span className="text-(--cool)">SNAKE</span>
          <span className="text-white/55"> · score </span>
          <span className="tabular-nums text-white">{ui.score}</span>
        </span>
        <span className="text-white/55">
          best <span className="tabular-nums text-(--warm)">{Math.max(ui.best, ui.score)}</span>
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="block touch-none rounded-lg bg-[#050506]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      />
      <div className="mt-2 text-[0.66rem] text-white/55">{status}</div>
      {touch && ui.state !== "quit" && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="grid grid-cols-3 gap-1.5">
            <span />
            <PadButton label="Up" onPress={() => turn("up")} Icon={IconArrowUp} />
            <span />
            <PadButton label="Left" onPress={() => turn("left")} Icon={IconArrowLeft} />
            <PadButton label="Down" onPress={() => turn("down")} Icon={IconArrowDown} />
            <PadButton label="Right" onPress={() => turn("right")} Icon={IconArrowRight} />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              quit();
            }}
            className="rounded-full border border-white/15 px-4 py-2 text-[0.7rem] text-white/70"
          >
            Quit
          </button>
        </div>
      )}
    </div>
  );
}

function PadButton({ label, onPress, Icon }) {
  return (
    <button
      type="button"
      aria-label={label}
      data-sfx="none"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPress();
      }}
      className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 bg-white/[0.05] text-white/80 active:bg-white/15"
    >
      <Icon size={18} stroke={1.8} />
    </button>
  );
}
