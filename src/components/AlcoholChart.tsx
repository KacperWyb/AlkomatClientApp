import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { OutputData } from "../assets/interfaces";

export const AlcoholChart = React.memo(({ output }: { output: OutputData }) => (
  <div style={{ width: "100%", height: 400 }}>
    <ResponsiveContainer>
      <LineChart data={output.timeline}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: "Minuty", position: "insideBottomRight" }} />
        <YAxis domain={[0, Math.max(...output.timeline.map(p => p.promiles)) * 1.2]} />
        <Tooltip />
        <Line type="monotone" dataKey="promiles" stroke="#2E8B57" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
));