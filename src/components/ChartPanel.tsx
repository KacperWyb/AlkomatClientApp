import { AlcoholChart } from "./AlcoholChart";
import type { OutputData } from "../assets/interfaces";

interface ChartPanelProps {
  output: OutputData | null;
}

export const ChartPanel = ({ output }: ChartPanelProps) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 12,
      height: 420,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}
  >
    <h3>Wykres stężenia alkoholu (‰)</h3>
    {output && <AlcoholChart output={output} />}
  </div>
);
