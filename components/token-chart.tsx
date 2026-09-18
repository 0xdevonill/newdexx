"use client";

import { useEffect, useRef } from "react";
import {
  AreaSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

export type Candle = { time: number; value: number; volume?: number };

export function TokenChart({
  candles,
  up,
}: {
  candles: Candle[];
  up: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const series = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const color = up ? "#3f9e74" : "#e5675b";
    const c = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ba3a6",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
      },
      grid: {
        vertLines: { color: "#242929" },
        horzLines: { color: "#242929" },
      },
      rightPriceScale: { borderColor: "#242929" },
      timeScale: { borderColor: "#242929", timeVisible: true },
      crosshair: { horzLine: { color: "#3f9e7488" }, vertLine: { color: "#3f9e7488" } },
    });
    const s = c.addSeries(AreaSeries, {
      lineColor: color,
      topColor: `${color}55`,
      bottomColor: `${color}08`,
      lineWidth: 2,
      priceFormat: { type: "price", precision: 8, minMove: 0.00000001 },
    });
    chart.current = c;
    series.current = s;
    return () => {
      c.remove();
      chart.current = null;
      series.current = null;
    };
  }, [up]);

  useEffect(() => {
    if (!series.current) return;
    const data = candles.map((x) => ({
      time: x.time as UTCTimestamp,
      value: x.value > 0 ? x.value : 0.0000001,
    }));
    series.current.setData(data);
    chart.current?.timeScale().fitContent();
  }, [candles]);

  return <div ref={host} className="tv-chart" />;
}
