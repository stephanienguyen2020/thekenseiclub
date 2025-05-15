"use client";
import { useEffect, useRef } from "react";
import { createChart, Time, LineData, LineSeries } from "lightweight-charts";
import { fromBlockchainAmount, toBlockchainAmount } from "@/lib/priceUtils";

interface PortfolioChartProps {
    data: { timestamp: string; value: number }[];
}

export default function PortfolioChart({ data }: PortfolioChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 200,
            layout: { background: { color: "#f3f4f6" }, textColor: "#222" },
            grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
            rightPriceScale: { borderColor: "#000" },
            timeScale: { borderColor: "#000" },
        });

        // Use addLineSeries for lightweight-charts v5
        const lineSeries = chart.addSeries(LineSeries, {
            color: "#0039C6",
            lineWidth: 2,
        });

        // Convert data to lightweight-charts format
        const chartData: LineData[] = data.map((point) => ({
            time: (new Date(point.timestamp).getTime() / 1000) as Time,
            value: fromBlockchainAmount(point.value.toString()),
        }));

        console.log("chartData", chartData);

        lineSeries.setData(chartData);
        chart.timeScale().fitContent();

        chartRef.current = chart;

        // Responsive resize
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
        };
        window.addEventListener("resize", handleResize);

        return () => {
            chart.remove();
            window.removeEventListener("resize", handleResize);
        };
    }, [data]);

    return <div ref={chartContainerRef} className="w-full h-[200px]" />;
} 