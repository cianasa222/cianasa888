// Trash Simulator – exchange: the price board. Live pool mid, oracle
// reference, deviation and a 24-point trend line for every material.
import { useEffect } from "react";
import { MATERIALS, formatCents, isMaterialId } from "../game/types";
import type { MarketPriceRow, MarketSlice } from "../hooks/useBackendSync";
import {
  AssetIcon,
  EM_DASH,
  Sparkline,
  Spinner,
  ToneChip,
  assetColor,
  assetName,
  assetTicker,
  formatCentsFine,
} from "./MenuMarketUi";
import { EmptyNote, Panel, SectionHead, num } from "./MenuUi";

export interface PricesViewProps {
  market: MarketSlice;
}

export function PricesView({ market }: PricesViewProps) {
  const prices = market.prices;
  const refresh = market.refreshPrices;

  // A fresh snapshot whenever the board is opened.
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Panel className="p-4">
      <SectionHead
        label="价格牌"
        hint="池子中间价对照参考价。池子随每次兑换而变动，参考价不变。"
        right={
          <div className="flex h-4 items-center justify-end">
            {market.pricesBusy ? (
              <Spinner size={13} />
            ) : (
              <span className="ts-mono text-[11px] text-white/35">
                {prices ? `${prices.list.length} markets` : EM_DASH}
              </span>
            )}
          </div>
        }
      />

      {!prices ? (
        <EmptyNote>
          无法连接交易所。登录后查看实时价格。
        </EmptyNote>
      ) : (
        <>
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="ts-label pb-2 text-left font-normal">
                    材料
                  </th>
                  <th className="ts-label pb-2 text-right font-normal">
                    池子中间价
                  </th>
                  <th className="ts-label pb-2 text-right font-normal">
                    参考价
                  </th>
                  <th className="ts-label pb-2 text-right font-normal">
                    偏差
                  </th>
                  <th className="ts-label pb-2 text-right font-normal">
                    趋势
                  </th>
                </tr>
              </thead>
              <tbody>
                {prices.list.map((row) => (
                  <PriceRow key={row.material} row={row} />
                ))}
              </tbody>
            </table>
          </div>

          <p className="ts-mono mt-3 text-[11px] leading-relaxed text-white/30">
            批发柜台按参考价低 {(prices.wholesaleSpreadBp / 100).toFixed(0)}% 收购 · {num(prices.swaps)} 次兑换 ·{" "}
            已销毁手续费 {formatCents(prices.feeBurnedCents)}。所有数字均为游戏内货币。
          </p>
        </>
      )}
    </Panel>
  );
}

function PriceRow({ row }: { row: MarketPriceRow }) {
  const def = isMaterialId(row.material) ? MATERIALS[row.material] : null;
  const color = assetColor(row.material);
  const dev = Math.round(row.deviationBp);

  return (
    <tr className="border-b border-white/[0.05] last:border-0">
      <td className="py-2 pr-3 align-middle">
        <div className="flex items-center gap-2.5">
          <AssetIcon asset={row.material} size={24} />
          <div className="min-w-0">
            <div className="truncate text-[13px] text-white/85">
              {assetName(row.material)}
              <span className="ts-mono ml-1.5 text-[11px] text-white/35">
                {assetTicker(row.material)}
              </span>
            </div>
            <div className="ts-mono text-[10px] text-white/30">
              max {num(row.maxSellUnits)} {def?.unit ?? "units"} sell ·{" "}
              {formatCents(row.maxBuyCents)} buy
            </div>
          </div>
        </div>
      </td>
      <td className="ts-mono py-2 pr-3 text-right align-middle text-[13px] text-white/85">
        {formatCentsFine(row.midCents)}
        {def && (
          <span className="ml-1 text-[10px] text-white/30">/{def.unit}</span>
        )}
      </td>
      <td className="ts-mono py-2 pr-3 text-right align-middle text-[12px] text-white/45">
        {formatCentsFine(row.oracleCents)}
      </td>
      <td className="py-2 pr-3 text-right align-middle">
        <ToneChip tone={dev < 0 ? "bad" : "good"}>
          {dev > 0 ? "+" : dev < 0 ? "−" : ""}
          {Math.abs(dev)} bp
        </ToneChip>
      </td>
      <td className="py-2 text-right align-middle">
        <div className="flex justify-end">
          <Sparkline points={row.trend} color={color} />
        </div>
      </td>
    </tr>
  );
}
