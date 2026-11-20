// Trash Simulator – in-game menu: upgrades, missions, inventory, market,
// statistics and leaderboard. The tab lives in the store, so `setMenu(open,
// tab)` can jump straight to a section.
import type { GlobalStats, LeaderboardEntry } from "../backend";
import { sound } from "../game/sound";
import type { GameStore } from "../game/state";
import { missionProgress, useGame } from "../game/state";
import { MISSIONS, formatCents, levelFromXp } from "../game/types";
import type { MarketSlice } from "../hooks/useBackendSync";
import { CollectionTab } from "./MenuCollection";
import { InventoryTab } from "./MenuInventory";
import { MarketTab } from "./MenuMarket";
import { Chip, EmptyNote, MiniBar, Panel, SectionHead, num } from "./MenuUi";
import { UpgradesTab } from "./MenuUpgrades";

/** The tab is kept in the store so `setMenu(open, tab)` can select it. */
type TabId = GameStore["menuTab"];

export interface MenusProps {
  leaderboard: LeaderboardEntry[] | null;
  globalStats: GlobalStats | null;
  leaderboardBusy: boolean;
  onRefreshLeaderboard: () => void;
  market: MarketSlice;
  onClose: () => void;
}

const TABS: Array<[TabId, string]> = [
  ["upgrades", "升级"],
  ["missions", "任务"],
  ["inventory", "背包"],
  ["market", "市场"],
  ["collection", "收藏"],
  ["stats", "统计"],
  ["leaderboard", "排行榜"],
];

function fmtTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h} 小时 ${m} 分钟` : `${m} 分钟`;
}

function fmtDist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export function Menus({
  leaderboard,
  globalStats,
  leaderboardBusy,
  onRefreshLeaderboard,
  market,
  onClose,
}: MenusProps) {
  const st = useGame();
  const tab = st.menuTab;
  const level = levelFromXp(st.xp).level;
  const balance = market.balanceCents;

  const selectTab = (id: TabId) => {
    if (id !== tab) sound.uiClick();
    st.setMenu(true, id);
    if (id === "leaderboard") onRefreshLeaderboard();
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-3">
      <div className="menu-panel flex h-[min(780px,94vh)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl text-white shadow-2xl">
        {/* Signature stripe, as on the control-room screen */}
        <div className="hazard-rail h-[5px] w-full shrink-0" />

        <header className="shrink-0 border-b border-white/10 px-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="ts-label">班次终端</div>
              <div className="ts-display truncate text-[22px] tracking-normal">
                {st.playerName}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="ts-mono rounded-md bg-[rgba(242,160,7,0.15)] px-2 py-1 text-[12px] text-[#ffca70]">
                {level} 级
              </span>
              <span className="ts-mono rounded-md bg-emerald-400/12 px-2 py-1 text-[12px] text-emerald-300">
                {num(st.recyclePoints)} 积分
              </span>
              {balance !== null && (
                <span className="ts-mono rounded-md bg-white/10 px-2 py-1 text-[12px] text-white/85">
                  {formatCents(balance)}
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition hover:bg-white/20"
              >
                关闭
              </button>
            </div>
          </div>

          <nav className="scroll-thin mt-3 flex gap-1 overflow-x-auto">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => selectTab(id)}
                className={`whitespace-nowrap rounded-t-lg px-3 py-2 text-[13px] font-medium transition ${
                  tab === id
                    ? "bg-white/[0.07] text-white shadow-[inset_0_-2px_0_var(--amber)]"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto p-4">
          {tab === "upgrades" && <UpgradesTab balanceCents={balance} />}
          {tab === "missions" && <MissionsTab />}
          {tab === "inventory" && <InventoryTab />}
          {tab === "market" && <MarketTab market={market} />}
          {tab === "collection" && <CollectionTab />}
          {tab === "stats" && <StatsTab />}
          {tab === "leaderboard" && (
            <LeaderboardTab
              leaderboard={leaderboard}
              globalStats={globalStats}
              busy={leaderboardBusy}
              onRefresh={onRefreshLeaderboard}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MissionsTab() {
  const st = useGame();
  const done = MISSIONS.filter((m) => st.missionsDone.includes(m.id)).length;

  return (
    <div className="space-y-3">
      <Panel className="p-4">
        <SectionHead
          label="委托"
          hint="仓库办公室发布的常驻任务，奖励自动发放。"
          right={
            <span className="ts-mono text-[13px] text-white/70">
              {done} / {MISSIONS.length} 已完成
            </span>
          }
        />
        <MiniBar value={done} max={MISSIONS.length} color="#9bc53d" />
      </Panel>

      <div className="space-y-2">
        {MISSIONS.map((m) => {
          const complete = st.missionsDone.includes(m.id);
          const prog = Math.min(m.target, missionProgress(st, m.metric));
          return (
            <div
              key={m.id}
              className={`rounded-xl border p-3 ${
                complete
                  ? "border-emerald-400/25 bg-emerald-400/[0.06]"
                  : "border-white/10 bg-white/[0.035]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold">{m.name}</span>
                    {complete && <Chip tone="good">已完成</Chip>}
                  </div>
                  <p className="mt-0.5 text-[12px] text-white/50">{m.desc}</p>
                </div>
                <div className="ts-mono shrink-0 text-right text-[12px]">
                  <div
                    className={complete ? "text-emerald-300" : "text-white/80"}
                  >
                    {num(prog)} / {num(m.target)}
                  </div>
                  <div className="text-[11px] text-white/40">
                    +{m.rewardXp} 经验 · {m.rewardPoints} 积分
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <MiniBar
                  value={prog}
                  max={m.target}
                  color={complete ? "#9bc53d" : "#4fa3e0"}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsTab() {
  const st = useGame();
  const rows: Array<[string, string]> = [
    ["已收集", num(st.stats.collected)],
    ["已处理", num(st.stats.disposed)],
    ["已回收（回收站）", num(st.stats.recycled)],
    ["回收积分", num(st.recyclePoints)],
    ["狗狗拾回", num(st.stats.dogItems)],
    ["无人机拾回", num(st.stats.droneItems)],
    ["吉普车运载次数", num(st.stats.jeepLoads)],
    ["游玩时间", fmtTime(st.stats.playSeconds)],
    ["步行", fmtDist(st.stats.distanceWalked)],
    ["驾驶", fmtDist(st.stats.distanceDriven)],
  ];
  const byCat = Object.entries(st.stats.byCategoryCollected);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {rows.map(([k, v]) => (
          <Panel key={k} className="p-3">
            <div className="ts-label">{k}</div>
            <div className="ts-mono mt-1 text-[18px] font-semibold">{v}</div>
          </Panel>
        ))}
      </div>
      <Panel className="p-4">
        <SectionHead label="按类别统计" />
        {byCat.length === 0 ? (
          <EmptyNote>尚未收集任何物品。</EmptyNote>
        ) : (
          <div className="flex flex-wrap gap-2 text-[12px]">
            {byCat.map(([k, v]) => (
              <span key={k} className="rounded-full bg-white/10 px-2.5 py-1">
                {k}: <b>{num(v)}</b>
              </span>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function LeaderboardTab({
  leaderboard,
  globalStats,
  busy,
  onRefresh,
}: {
  leaderboard: LeaderboardEntry[] | null;
  globalStats: GlobalStats | null;
  busy: boolean;
  onRefresh: () => void;
}) {
  const playerName = useGame((s) => s.playerName);

  return (
    <div className="space-y-3">
      <Panel className="p-4">
        <SectionHead
          label="顶尖收集者"
          hint={
            globalStats
              ? `${num(Number(globalStats.players))} 名操作员 · 全球共处理 ${num(Number(globalStats.totalDisposed))} 件物品`
              : "全体操作员的全球排名。"
          }
          right={
            <button
              type="button"
              onClick={onRefresh}
              disabled={busy}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] transition hover:bg-white/20 disabled:opacity-40"
            >
              {busy ? "加载中…" : "刷新"}
            </button>
          }
        />
        {leaderboard === null && (
          <EmptyNote>无法连接排行榜。</EmptyNote>
        )}
        {leaderboard?.length === 0 && (
          <EmptyNote>暂无记录——来做第一个！</EmptyNote>
        )}
        {leaderboard && leaderboard.length > 0 && (
          <ol className="space-y-1.5">
            {leaderboard.map((e, i) => (
              <li
                key={`${e.name}-${i}`}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  e.name === playerName
                    ? "border-[rgba(242,160,7,0.35)] bg-[rgba(242,160,7,0.07)]"
                    : "border-white/[0.07] bg-black/20"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="ts-mono w-6 text-center text-[12px] text-white/45">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-[13px] font-semibold">
                    {e.name}
                  </span>
                </div>
                <div className="ts-mono shrink-0 text-right text-[12px] text-white/60">
                  Lv. {String(e.level)} · {num(Number(e.totalDisposed))}{" "}
                  disposed
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}
