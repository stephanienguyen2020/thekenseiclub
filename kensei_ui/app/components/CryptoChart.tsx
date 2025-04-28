import React, {useEffect, useRef} from "react";
import {CandlestickSeries, ColorType, createChart, UTCTimestamp} from "lightweight-charts";

export interface CandleData {
  time: UTCTimestamp;
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

  useEffect(() => {
    console.log("Data received: ", data);
    if (!chartContainerRef.current || data.length === 0) return;

    const formattedData = data
      .map((item) => {
        const timeValue = typeof item.time === "number"
          ? Math.floor(item.time) // Ensure it's an integer
          : Math.floor(new Date(item.time).getTime() / 1000);

        return {
          time: timeValue as UTCTimestamp,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        };
      })
      .sort((a, b) => a.time - b.time);

    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: {type: ColorType.Solid, color: "transparent"},
        textColor: "#D9D9D9",
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        autoScale: true,
      },

    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      priceScaleId: 'right',
      priceFormat: {
        type: 'price',
        precision: 15,
        minMove: 0.000000000000001
      },
    });

    candlestickSeries.setData(formattedData);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
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
