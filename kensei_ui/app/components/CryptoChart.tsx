import React, { useEffect, useRef } from "react";
// Import directly from the specific module to ensure we get the correct API
import { createChart, ColorType } from "lightweight-charts";

export interface CandleData {
  time: string | number;
  bondingCurveId?: string;
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

    // Format the data for the chart
    const formattedData = data
      .map((item) => {
        // For lightweight-charts, time needs to be in seconds for Unix timestamps
        const timeValue = typeof item.time === "number" 
          ? Math.floor(item.time) // Ensure it's an integer
          : Math.floor(new Date(item.time).getTime() / 1000);

        return {
          time: timeValue,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        };
      })
      .sort((a, b) => a.time - b.time);

    try {
      // Create the chart with improved options for better visualization
      chart.current = createChart(chartContainerRef.current, {
        width,
        height,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#D9D9D9",
        },
        grid: {
          vertLines: { color: "rgba(42, 46, 57, 0.5)" },
          horzLines: { color: "rgba(42, 46, 57, 0.5)" },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: "rgba(197, 203, 206, 0.8)",
          barSpacing: 10, // Adjust spacing between candles
          fixLeftEdge: true,
          fixRightEdge: true,
          lockVisibleTimeRangeOnResize: true,
        },
        rightPriceScale: {
          borderColor: "rgba(197, 203, 206, 0.8)",
          textColor: "#D9D9D9",
          scaleMargins: {
            top: 0.2,
            bottom: 0.2,
          },
          visible: true,
          autoScale: true,
          entireTextOnly: false,
          priceFormat: {
            type: 'custom',
            formatter: (price: number) => {
              // Format very small numbers in scientific notation
              if (price < 0.000001) {
                return price.toExponential(8);
              }
              return price.toPrecision(8);
            },
          },
        },
        crosshair: {
          vertLine: {
            color: "#758696",
            width: 1,
            style: 3,
            visible: true,
            labelVisible: true,
          },
          horzLine: {
            color: "#758696",
            width: 1,
            style: 3,
            visible: true,
            labelVisible: true,
          },
          mode: 1,
        },
      });

      console.log("Chart created:", chart.current);

      // Create a candlestick series for displaying OHLC data
      const candlestickSeries = chart.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: true,
        borderColor: '#378658',
        borderUpColor: '#26a69a',
        borderDownColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        priceScaleId: 'right',
        // Ensure the series uses the right price scale with our custom formatting
        priceFormat: {
          type: 'custom',
          formatter: (price: number) => {
            // Format very small numbers in scientific notation
            if (price < 0.000001) {
              return price.toExponential(8);
            }
            return price.toPrecision(8);
          },
        },
      });

      // Set the data
      console.log("Candlestick data:", formattedData);
      candlestickSeries.setData(formattedData);

      // Fit content to ensure all data is visible
      chart.current.timeScale().fitContent();

      // Force the price scale to recalculate and show appropriate intervals
      candlestickSeries.applyOptions({
        autoscaleInfoProvider: () => ({
          priceRange: {
            minValue: Math.min(...formattedData.map(d => d.low)) * 0.999,
            maxValue: Math.max(...formattedData.map(d => d.high)) * 1.001
          },
        }),
      });

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

          // Reapply our custom scaling when window is resized
          candlestickSeries.applyOptions({
            autoscaleInfoProvider: () => ({
              priceRange: {
                minValue: Math.min(...formattedData.map(d => d.low)) * 0.999,
                maxValue: Math.max(...formattedData.map(d => d.high)) * 1.001
              },
            }),
          });
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
