import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";

interface DataPoint {
  x: number;
  y: number;
}

export const ChartWithGradient = () => {
  const [data, setData] = useState<DataPoint[]>([
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 5 },
    { x: 4, y: 7 },
    { x: 5, y: 6 },
    { x: 6, y: 8 },
    { x: 7, y: 9 },
    { x: 8, y: 7 },
    { x: 9, y: 5 },
    { x: 10, y: 3 },
  ]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" domain={[1, 10]} />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          {/* Kolorowe strefy tła */}
          <ReferenceArea y1={0} y2={4} fill="rgba(144, 238, 144, 0.3)" />
          <ReferenceArea y1={4} y2={6} fill="rgba(0, 128, 0, 0.4)" />
          <ReferenceArea y1={6} y2={10} fill="rgba(144, 238, 144, 0.3)" />
          <Line type="monotone" dataKey="y" stroke="#2E8B57" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() =>
            setData(data.map(p => ({ ...p, y: Math.floor(Math.random() * 10) + 1 })))
          }
        >
          🎲 Losuj dane
        </button>
      </div>
    </div>
  );
};
