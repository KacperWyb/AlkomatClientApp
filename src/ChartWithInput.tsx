import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

interface Drink {
  label: string;
  volumeMl: number;
  percent: number;
  count: number;
}

interface InputData {
  weightKg: number;
  sex: string;
  age: number;
  heightCm: number;
  drinks: Drink[];
  startTime: string;
  endTime: string;
}

interface TimelinePoint {
  time: number;
  promiles: number;
}

interface OutputData {
  promiles: number;
  bloodAlcoholConcentration: number;
  gramsOfAlcohol: number;
  elapsedHours: number;
  status: string;
  summary: string;
  timeline: TimelinePoint[];
  estimatedSobrietyTime: string;
}

const PRESETS = [
  { label: "Duże piwo (500 ml)", volumeMl: 500, percent: 5 },
  { label: "Małe piwo (350 ml)", volumeMl: 350, percent: 5 },
  { label: "Wino – kieliszek (175 ml)", volumeMl: 175, percent: 12 },
  { label: "Szampan – kieliszek (120 ml)", volumeMl: 120, percent: 12 },
  { label: "Mocny alkohol – kieliszek (50 ml)", volumeMl: 50, percent: 40 },
] as const;

export const ChartWithInput = () => {
  const [input, setInput] = useState<InputData>({
    weightKg: 70,
    sex: "male",
    age: 30,
    heightCm: 175,
    drinks: PRESETS.map(d => ({ ...d, count: 0 })),
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
  });
  const [output, setOutput] = useState<OutputData | null>(null);

  const handleChange = (field: keyof InputData, value: any) => {
    setInput({ ...input, [field]: value });
  };

  const handleDrinkChange = (index: number, delta: number) => {
    const newDrinks = [...input.drinks];
    newDrinks[index].count = Math.max(0, newDrinks[index].count + delta);
    setInput({ ...input, drinks: newDrinks });
  };

  const submit = async () => {
    try {
      const res = await fetch("http://localhost:5293/Alkomat/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data: OutputData = await res.json();
      setOutput(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>🍺 Symulator alkoholu</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Waga (kg): </label>
        <input
          type="number"
          value={input.weightKg}
          onChange={(e) => handleChange("weightKg", Number(e.target.value))}
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label>Wzrost (cm): </label>
        <input
          type="number"
          value={input.heightCm}
          onChange={(e) => handleChange("heightCm", Number(e.target.value))}
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label>Wiek: </label>
        <input
          type="number"
          value={input.age}
          onChange={(e) => handleChange("age", Number(e.target.value))}
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label>Płeć: </label>
        <select
          value={input.sex}
          onChange={(e) => handleChange("sex", e.target.value)}
        >
          <option value="male">Mężczyzna</option>
          <option value="female">Kobieta</option>
        </select>
      </div>

      <h3>Co zostało spożyte</h3>
      {input.drinks.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span>{d.label}</span>
          <span>{d.percent}% alkoholu</span>
          <button onClick={() => handleDrinkChange(i, -1)}>−</button>
          <span>{d.count}</span>
          <button onClick={() => handleDrinkChange(i, 1)}>+</button>
        </div>
      ))}

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => alert("Tutaj można dodać własny napój")}>
          Nie ma na liście tego co spożywałeś? ➕ Dodaj
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Start: </label>
        <input
          type="datetime-local"
          value={input.startTime}
          onChange={(e) => handleChange("startTime", e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label>Koniec: </label>
        <input
          type="datetime-local"
          value={input.endTime}
          onChange={(e) => handleChange("endTime", e.target.value)}
        />
      </div>

      <button onClick={submit} style={{ marginBottom: 20 }}>
        Oblicz promile 🍷
      </button>

      {output && (
        <>
          <h3>Podsumowanie: {output.summary}</h3>
          <p>Status: {output.status}</p>
          <p>Maksymalny promil: {output.promiles.toFixed(2)}</p>

          <div style={{ width: "100%", height: 400, marginTop: 20 }}>
            <ResponsiveContainer>
              <LineChart data={output.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" label={{ value: "Minuty", position: "insideBottomRight" }} />
                <YAxis domain={[0, Math.max(...output.timeline.map(p => p.promiles)) * 1.2]} />
                <Tooltip />
                <ReferenceArea y1={0} y2={0.5} fill="rgba(144, 238, 144, 0.3)" />
                <ReferenceArea y1={0.5} y2={1.0} fill="rgba(0, 128, 0, 0.4)" />
                <ReferenceArea y1={1.0} y2={output.promiles} fill="rgba(144, 238, 144, 0.3)" />
                <Line type="monotone" dataKey="promiles" stroke="#2E8B57" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
