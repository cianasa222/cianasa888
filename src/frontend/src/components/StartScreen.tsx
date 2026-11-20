// Trash Simulator – control room: sign-in, operator ID, main menu
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GlobalStats, LeaderboardEntry, ProfileOutput } from "../backend";
import { useGame } from "../game/state";
import { levelFromXp } from "../game/types";
import type { RegisterOutcome } from "../hooks/useBackendSync";

export interface StartScreenProps {
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoggingIn: boolean;
  authInitializing: boolean;
  loginError: string | null;
  onLogin: () => void;
  onGuest: () => void;
  onLogout: () => void;
  profile: ProfileOutput | null;
  profileChecking: boolean;
  profileError: boolean;
  onRetryProfile: () => void;
  needsRegistration: boolean;
  onRegister: (name: string) => void;
  registerBusy: boolean;
  registerOutcome: RegisterOutcome | null;
  checkNameAvailable: (name: string) => Promise<boolean>;
  hasSave: boolean;
  onContinue: () => void;
  onNewRun: () => void;
  loadBusy: boolean;
  leaderboard: LeaderboardEntry[] | null;
  globalStats: GlobalStats | null;
}

const NAME_PATTERN = /^[A-Za-zÄÖÜäöüß0-9 ._-]{3,24}$/;

function num(v: bigint | number): string {
  return new Intl.NumberFormat("zh-CN").format(Number(v));
}

/** Dot-leader row, like on a weighbridge ticket. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="board-row py-[5px]">
      <span className="text-[12px] text-[var(--muted)]">{label}</span>
      <span className="lead" />
      <span className="ts-mono text-[13px] text-[var(--chalk)]">{value}</span>
    </div>
  );
}

function StatusChip({ text, tone }: { text: string; tone: "on" | "off" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-[7px] w-[7px] rounded-full"
        style={{
          background: tone === "on" ? "var(--sorted)" : "var(--seam)",
          boxShadow: tone === "on" ? "0 0 8px rgba(155,197,61,0.7)" : "none",
        }}
      />
      <span className="ts-label">{text}</span>
    </div>
  );
}

export function StartScreen(props: StartScreenProps) {
  const {
    isAuthenticated,
    isGuest,
    isLoggingIn,
    authInitializing,
    loginError,
    onLogin,
    onGuest,
    onLogout,
    profile,
    profileChecking,
    profileError,
    onRetryProfile,
    needsRegistration,
    onRegister,
    registerBusy,
    registerOutcome,
    checkNameAvailable,
    hasSave,
    onContinue,
    onNewRun,
    loadBusy,
    leaderboard,
    globalStats,
  } = props;

  const isTouchLike = typeof window !== "undefined" && "ontouchstart" in window;
  // Guests have no profile; the control room shows their local display name.
  const playerName = useGame((s) => s.playerName);

  const mode: "locked" | "checking" | "error" | "register" | "menu" | "guest" =
    authInitializing
      ? "checking"
      : !isAuthenticated
        ? "locked"
        : isGuest
          ? "guest"
          : profile
            ? "menu"
            : needsRegistration
              ? "register"
              : profileError
                ? "error"
                : "checking";

  return (
    <div className="ts-shell ts-grain">
      {/* Signature: hazard stripe along the left edge */}
      <div className="hazard-rail anim-rail absolute inset-y-0 left-0 w-[10px] md:w-[14px]" />

      <div className="relative mx-auto flex min-h-full w-full max-w-6xl flex-col gap-8 py-10 pl-[26px] pr-5 md:gap-10 md:py-14 md:pl-14 md:pr-10">
        <Header
          isAuthenticated={isAuthenticated}
          name={profile?.name ?? (isGuest ? playerName : null)}
        />

        <div className="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <section className="anim-rise d2 order-2 lg:order-1">
            {mode === "locked" && (
              <LockedPanel
                isLoggingIn={isLoggingIn}
                onLogin={onLogin}
                onGuest={onGuest}
                loginError={loginError}
              />
            )}
            {mode === "checking" && <CheckingPanel busy={profileChecking} />}
            {mode === "error" && <ProfileErrorPanel onRetry={onRetryProfile} />}
            {mode === "register" && (
              <RegisterPanel
                onRegister={onRegister}
                busy={registerBusy}
                outcome={registerOutcome}
                checkNameAvailable={checkNameAvailable}
              />
            )}
            {mode === "guest" && (
              <GuestMenuPanel
                hasSave={hasSave}
                onContinue={onContinue}
                onNewRun={onNewRun}
                onLogout={onLogout}
                loadBusy={loadBusy}
              />
            )}
            {mode === "menu" && profile && (
              <MenuPanel
                profile={profile}
                hasSave={hasSave}
                onContinue={onContinue}
                onNewRun={onNewRun}
                onLogout={onLogout}
                loadBusy={loadBusy}
              />
            )}
          </section>

          <aside className="anim-rise d3 order-1 flex flex-col gap-4 lg:order-2">
            <DataBoard globalStats={globalStats} />
            <ShiftBoard leaderboard={leaderboard} you={profile?.name ?? null} />
          </aside>
        </div>

        <ControlLegend touch={isTouchLike} />
      </div>
    </div>
  );
}

function Header({
  isAuthenticated,
  name,
}: {
  isAuthenticated: boolean;
  name: string | null;
}) {
  return (
    <header className="anim-rise d1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="ts-eyebrow">
          海岸北段 · 清洁服务
        </span>
        <StatusChip
          text={
            isAuthenticated
              ? `Signed in${name ? ` · ${name}` : ""}`
              : "未登录"
          }
          tone={isAuthenticated ? "on" : "off"}
        />
      </div>

      <h1 className="ts-display mt-5 text-[clamp(3rem,11vw,6.5rem)]">
        <span className="block">垃圾</span>
        <span className="block text-[var(--amber)]">模拟器</span>
      </h1>

      <div
        className="mt-5 h-[3px] w-[120px]"
        style={{ background: "var(--amber)" }}
      />
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
        一段海岸，数千件拾获物，八大可回收类别。捡起来，分好类，送到回收站。
      </p>
    </header>
  );
}

function LockedPanel({
  isLoggingIn,
  onLogin,
  onGuest,
  loginError,
}: {
  isLoggingIn: boolean;
  onLogin: () => void;
  onGuest: () => void;
  loginError: string | null;
}) {
  return (
    <div className="plate plate-riveted px-5 py-6 md:px-8 md:py-7">
      <div className="ts-label mb-1">登录</div>
      <h2 className="ts-display mb-3 text-[22px] tracking-normal">
        需要登录
      </h2>
      <p className="mb-6 max-w-sm text-[14px] leading-relaxed text-[var(--muted)]">
        你的进度保存在互联网计算机上的个人资料中，这样它能跟随你到任何设备。本设备上没有本地存档。
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onLogin}
        disabled={isLoggingIn}
      >
        <span>
          {isLoggingIn ? "登录中" : "使用互联网身份登录"}
        </span>
        <span className="tag">第 1 步，共 2 步</span>
      </button>
      <button
        type="button"
        className="btn mt-2"
        onClick={onGuest}
        disabled={isLoggingIn}
      >
        <span>游客进入</span>
        <span className="tag">无需登录</span>
      </button>
      {loginError && (
        <p className="ts-mono mt-4 text-[11px] leading-relaxed text-[var(--amber)]">
          登录失败：{loginError}
        </p>
      )}
      <p className="ts-mono mt-4 text-[11px] leading-relaxed text-[var(--muted)]">
        首次登录后需要接着选择显示名称。游客无需登录即可游玩——进度仅保存在本设备上。
      </p>
    </div>
  );
}

function CheckingPanel({ busy }: { busy: boolean }) {
  return (
    <div className="plate plate-riveted px-5 py-8 md:px-8">
      <div className="ts-label mb-2">资料</div>
      <p className="text-[14px] text-[var(--muted)]">
        {busy ? "正在加载资料…" : "连接中…"}
      </p>
    </div>
  );
}

function ProfileErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="plate plate-riveted px-5 py-6 md:px-8 md:py-7">
      <div className="ts-label mb-1">资料</div>
      <h2 className="ts-display mb-3 text-[22px] tracking-normal">
        无法加载资料
      </h2>
      <p className="mb-5 max-w-sm text-[14px] leading-relaxed text-[var(--muted)]">
        连接你的资料失败。请检查网络连接后重试。
      </p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        <span>重试</span>
      </button>
    </div>
  );
}

function RegisterPanel({
  onRegister,
  busy,
  outcome,
  checkNameAvailable,
}: {
  onRegister: (name: string) => void;
  busy: boolean;
  outcome: RegisterOutcome | null;
  checkNameAvailable: (name: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const seq = useRef(0);

  const formatOk = NAME_PATTERN.test(name.trim());

  useEffect(() => {
    if (!formatOk) {
      setAvailable(null);
      return;
    }
    const mine = ++seq.current;
    setChecking(true);
    const t = window.setTimeout(async () => {
      const ok = await checkNameAvailable(name.trim());
      if (seq.current === mine) {
        setAvailable(ok);
        setChecking(false);
      }
    }, 400);
    return () => {
      window.clearTimeout(t);
      setChecking(false);
    };
  }, [name, formatOk, checkNameAvailable]);

  const hint = useMemo(() => {
    if (name.trim().length === 0)
      return "3 至 24 个字符。字母（含变音字母）、数字、空格、点、连字符、下划线。";
    if (!formatOk)
      return "该名称包含无效字符或太短。";
    if (checking) return "正在检查是否可用…";
    if (available === false) return "该名称已被占用。";
    if (available === true) return "该名称可用。";
    return " ";
  }, [name, formatOk, checking, available]);

  const hintTone =
    available === true
      ? "var(--sorted)"
      : available === false || (name.length > 0 && !formatOk)
        ? "var(--amber)"
        : "var(--muted)";

  const submit = useCallback(() => {
    if (formatOk && !busy) onRegister(name.trim());
  }, [formatOk, busy, name, onRegister]);

  return (
    <div className="plate plate-riveted px-5 py-6 md:px-8 md:py-7">
      <div className="ts-label mb-1">第 2 步，共 2 步</div>
      <h2 className="ts-display mb-3 text-[22px] tracking-normal">
        创建操作员 ID
      </h2>
      <p className="mb-5 max-w-sm text-[14px] leading-relaxed text-[var(--muted)]">
        这是你在排行榜上显示的名字，只可设定一次，之后无法更改。
      </p>

      <label className="ts-label mb-2 block" htmlFor="operatorName">
        显示名称
      </label>
      <input
        id="operatorName"
        className="ts-input"
        value={name}
        maxLength={24}
        autoComplete="off"
        spellCheck={false}
        placeholder="例如：Northwind"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "确认") submit();
        }}
      />
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className="ts-mono text-[11px]" style={{ color: hintTone }}>
          {hint}
        </span>
        <span className="ts-mono text-[11px] text-[var(--muted)]">
          {name.trim().length}/24
        </span>
      </div>

      {outcome === "nameTaken" && (
        <p className="ts-mono mt-3 text-[11px] text-[var(--amber)]">
          该名称刚刚被别人抢注了，请换一个。
        </p>
      )}
      {outcome === "invalidName" && (
        <p className="ts-mono mt-3 text-[11px] text-[var(--amber)]">
          名称被拒绝，请检查长度和字符。
        </p>
      )}
      {outcome === "anonymous" && (
        <p className="ts-mono mt-3 text-[11px] text-[var(--amber)]">
          你的会话已失效，请重新登录。
        </p>
      )}
      {outcome === "error" && (
        <p className="ts-mono mt-3 text-[11px] text-[var(--amber)]">
          连接失败，请重试。
        </p>
      )}

      <div className="mt-6">
        <button
          type="button"
          className="btn btn-primary"
          onClick={submit}
          disabled={!formatOk || busy || available === false}
        >
          <span>{busy ? "创建中" : "设定名称"}</span>
          <span className="tag">一次性</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Control-room menu for guests: no profile, no registration. Stats come from
 * the local game state; progress lives in the guest save on this device.
 */
function GuestMenuPanel({
  hasSave,
  onContinue,
  onNewRun,
  onLogout,
  loadBusy,
}: {
  hasSave: boolean;
  onContinue: () => void;
  onNewRun: () => void;
  onLogout: () => void;
  loadBusy: boolean;
}) {
  const [confirmNew, setConfirmNew] = useState(false);
  const playerName = useGame((s) => s.playerName);
  const xp = useGame((s) => s.xp);
  const recyclePoints = useGame((s) => s.recyclePoints);
  const collected = useGame((s) => s.stats.collected);
  const disposed = useGame((s) => s.stats.disposed);
  const lvl = levelFromXp(xp);
  const pct = Math.round((lvl.into / Math.max(1, lvl.needed)) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Operator ID */}
      <div className="plate plate-riveted px-5 py-5 md:px-8 md:py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="ts-label mb-1">操作员 ID · 游客</div>
            <div className="ts-display text-[30px] tracking-normal">
              {playerName}
            </div>
          </div>
          <div className="text-right">
            <div className="ts-label mb-1">等级</div>
            <div className="ts-display text-[30px] text-[var(--amber)]">
              {String(lvl.level)}
            </div>
          </div>
        </div>

        <div className="mt-4 h-[6px] w-full" style={{ background: "#0c1113" }}>
          <div
            className="h-full transition-[width] duration-500"
            style={{ width: `${pct}%`, background: "var(--amber)" }}
          />
        </div>
        <div className="ts-mono mt-2 flex justify-between text-[11px] text-[var(--muted)]">
          <span>
            {num(lvl.into)} / {num(lvl.needed)} 经验，升到 {lvl.level + 1} 级
          </span>
          <span>{num(recyclePoints)} 积分</span>
        </div>

        <div
          className="mt-4 border-t pt-3"
          style={{ borderColor: "var(--seam)" }}
        >
          <Row label="已拾取" value={num(collected)} />
          <Row label="已处理" value={num(disposed)} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {hasSave && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onContinue}
            disabled={loadBusy}
          >
            <span>{loadBusy ? "加载中" : "继续班次"}</span>
            <span className="tag">等级 {lvl.level}</span>
          </button>
        )}

        {!confirmNew ? (
          <button
            type="button"
            className={hasSave ? "btn" : "btn btn-primary"}
            onClick={() => (hasSave ? setConfirmNew(true) : onNewRun())}
          >
            <span>开始新班次</span>
            <span className="tag">{hasSave ? "重置" : "开始"}</span>
          </button>
        ) : (
          <div
            className="plate px-4 py-4"
            style={{ borderColor: "var(--amber-dim)" }}
          >
            <p className="mb-3 text-[13px] leading-relaxed text-[var(--chalk)]">
              开始新班次将删除本设备上保存的进度。等级、积分和统计数据全部从零开始。
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setConfirmNew(false);
                  onNewRun();
                }}
              >
                <span>删除进度并开始</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setConfirmNew(false)}
              >
                <span>取消</span>
              </button>
            </div>
          </div>
        )}

        <button type="button" className="btn" onClick={onLogout}>
          <span>退出登录</span>
          <span className="tag">游客会话结束</span>
        </button>
      </div>
    </div>
  );
}

function MenuPanel({
  profile,
  hasSave,
  onContinue,
  onNewRun,
  onLogout,
  loadBusy,
}: {
  profile: ProfileOutput;
  hasSave: boolean;
  onContinue: () => void;
  onNewRun: () => void;
  onLogout: () => void;
  loadBusy: boolean;
}) {
  const [confirmNew, setConfirmNew] = useState(false);
  const lvl = levelFromXp(Number(profile.xp));
  const pct = Math.round((lvl.into / Math.max(1, lvl.needed)) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Operator ID */}
      <div className="plate plate-riveted px-5 py-5 md:px-8 md:py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="ts-label mb-1">操作员 ID</div>
            <div className="ts-display text-[30px] tracking-normal">
              {profile.name}
            </div>
          </div>
          <div className="text-right">
            <div className="ts-label mb-1">等级</div>
            <div className="ts-display text-[30px] text-[var(--amber)]">
              {String(lvl.level)}
            </div>
          </div>
        </div>

        <div className="mt-4 h-[6px] w-full" style={{ background: "#0c1113" }}>
          <div
            className="h-full transition-[width] duration-500"
            style={{ width: `${pct}%`, background: "var(--amber)" }}
          />
        </div>
        <div className="ts-mono mt-2 flex justify-between text-[11px] text-[var(--muted)]">
          <span>
            {num(lvl.into)} / {num(lvl.needed)} 经验，升到 {lvl.level + 1} 级
          </span>
          <span>{num(profile.recyclePoints)} points</span>
        </div>

        <div
          className="mt-4 border-t pt-3"
          style={{ borderColor: "var(--seam)" }}
        >
          <Row label="已拾取" value={num(profile.totalCollected)} />
          <Row label="已处理" value={num(profile.totalDisposed)} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {hasSave && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onContinue}
            disabled={loadBusy}
          >
            <span>{loadBusy ? "加载中" : "继续班次"}</span>
            <span className="tag">等级 {lvl.level}</span>
          </button>
        )}

        {!confirmNew ? (
          <button
            type="button"
            className={hasSave ? "btn" : "btn btn-primary"}
            onClick={() => (hasSave ? setConfirmNew(true) : onNewRun())}
          >
            <span>开始新班次</span>
            <span className="tag">{hasSave ? "重置" : "开始"}</span>
          </button>
        ) : (
          <div
            className="plate px-4 py-4"
            style={{ borderColor: "var(--amber-dim)" }}
          >
            <p className="mb-3 text-[13px] leading-relaxed text-[var(--chalk)]">
              开始新班次将删除你资料中保存的进度。等级、积分和统计数据全部从零开始。
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setConfirmNew(false);
                  onNewRun();
                }}
              >
                <span>删除进度并开始</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setConfirmNew(false)}
              >
                <span>取消</span>
              </button>
            </div>
          </div>
        )}

        <button type="button" className="btn" onClick={onLogout}>
          <span>退出登录</span>
          <span className="tag">保留资料</span>
        </button>
      </div>
    </div>
  );
}

function DataBoard({ globalStats }: { globalStats: GlobalStats | null }) {
  return (
    <div className="plate px-5 py-4">
      <div className="ts-label mb-3">运营数据（全部时间）</div>
      {globalStats ? (
        <>
          <Row label="活跃操作员" value={num(globalStats.players)} />
          <Row label="已拾取" value={num(globalStats.totalCollected)} />
          <Row label="已处理" value={num(globalStats.totalDisposed)} />
        </>
      ) : (
        <p className="ts-mono text-[12px] text-[var(--muted)]">
          暂无数据。
        </p>
      )}
    </div>
  );
}

function ShiftBoard({
  leaderboard,
  you,
}: {
  leaderboard: LeaderboardEntry[] | null;
  you: string | null;
}) {
  const rows = (leaderboard ?? []).slice(0, 8);
  return (
    <div className="plate px-5 py-4">
      <div className="ts-label mb-3">排行榜</div>
      {rows.length === 0 ? (
        <p className="ts-mono text-[12px] text-[var(--muted)]">
          暂无记录，第一名虚位以待。
        </p>
      ) : (
        <ol className="flex flex-col">
          {rows.map((r, i) => {
            const mine = you != null && r.name === you;
            return (
              <li
                key={r.name}
                className="board-row py-[5px]"
                style={{ color: mine ? "var(--amber)" : undefined }}
              >
                <span className="ts-mono w-5 text-[12px] text-[var(--muted)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-[13px]">{r.name}</span>
                <span className="lead" />
                <span className="ts-mono text-[12px]">
                  {num(r.totalDisposed)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function ControlLegend({ touch }: { touch: boolean }) {
  const items: [string, string][] = touch
    ? [
        ["左摇杆", "移动"],
        ["右半屏", "环顾四周"],
        ["抓取", "拾取"],
        ["E", "吉普车"],
        ["使用", "卸货 · 使用"],
        ["喇叭", "喇叭（吉普车内按住）"],
      ]
    : [
        ["WASD", "移动"],
        ["鼠标", "环顾四周"],
        ["左键点击", "拾取"],
        ["Shift", "疾跑 · 刹车"],
        ["空格", "跳跃"],
        ["E", "吉普车"],
        ["F", "卸货 · 使用"],
        ["1/2 · 滚轮", "工具"],
        ["H", "喇叭（吉普车内按住）"],
        ["Tab", "菜单"],
        ["I", "背包"],
        ["M", "市场"],
        ["Esc", "暂停"],
      ];

  return (
    <footer className="anim-rise d4">
      <div className="ts-label mb-3">操作说明</div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {items.map(([key, what]) => (
          <div key={key} className="flex items-baseline gap-2">
            <span
              className="ts-mono px-[6px] py-[2px] text-[11px]"
              style={{
                background: "#0c1113",
                border: "1px solid var(--seam)",
                color: "var(--chalk)",
              }}
            >
              {key}
            </span>
            <span className="text-[12px] text-[var(--muted)]">{what}</span>
          </div>
        ))}
      </div>
    </footer>
  );
}
