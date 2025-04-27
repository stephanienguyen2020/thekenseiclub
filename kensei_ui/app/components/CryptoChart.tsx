import React, { useEffect, useRef } from "react";
// Import directly from the specific module to ensure we get the correct API
import { createChart } from "lightweight-charts";

export interface CandleData {
  time: string;
  bondingCurveId: string;
  high: number;
  open: number;
  close: number;
  low: number;
}

interface CryptoChartProps {
  data: CandleData[];
  width?: number;
  height?: number;
}

const CryptoChart: React.FC<CryptoChartProps> = ({
  data,
  width = 600,
  height = 300,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    console.log("Data received: ", data);
    if (!chartContainerRef.current || data.length === 0) return;

    // Ensure any previous chart instance is removed
    if (chart.current) {
      chart.current.remove();
      chart.current = null;
    }

    // Format the data for the chart
    const formattedData = data
      .map((item) => ({
        // Use a proper time format that works with all versions
        time: new Date(item.time).getTime() / 1000, // Convert to timestamp
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }))
      .sort((a, b) => a.time - b.time);

    console.log("Formatted data:", formattedData);

    try {
      // Create the chart with minimal options to reduce potential errors
      chart.current = createChart(chartContainerRef.current, {
        width,
        height,
      });

      console.log("Chart created:", chart.current);

      // Log all methods available on the chart and its prototype chain
      console.log("Chart keys:", Object.keys(chart.current));
      console.log(
        "Chart prototype methods:",
        Object.getOwnPropertyNames(Object.getPrototypeOf(chart.current))
      );

      // Attempt to use line series as a fallback that should work in all versions
      const lineSeries = chart.current.addLineSeries({
        color: "#2196F3",
        lineWidth: 2,
      });

      if (!lineSeries) {
        console.error("Failed to create line series");
        return;
      }

      // Convert data to line series format
      const lineData = formattedData.map((item) => ({
        time: item.time,
        value: item.close,
      }));

      console.log("Line data:", lineData);
      lineSeries.setData(lineData);

      // Make the chart responsive
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }

      resizeObserver.current = new ResizeObserver((entries) => {
        if (entries.length === 0 || !entries[0].contentRect) return;
        const { width: newWidth, height: newHeight } = entries[0].contentRect;
        if (chart.current) {
          chart.current.applyOptions({ width: newWidth, height: newHeight });
          chart.current.timeScale().fitContent();
        }
      });

      resizeObserver.current.observe(chartContainerRef.current);
    } catch (error) {
      console.error("Error creating chart:", error);
    }

    // Clean up
    return () => {
      if (chart.current) {
        chart.current.remove();
      }
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, [data, width, height]);

  return (
    <div className="crypto-chart-container">
      <div
        ref={chartContainerRef}
        className="crypto-chart"
        style={{
          width: "100%",
          height: "100%",
          minHeight: height,
        }}
      />
    </div>
  );
};

export default CryptoChart;
