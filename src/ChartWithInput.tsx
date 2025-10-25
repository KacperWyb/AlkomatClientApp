import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Drink { volumeMl: number; percent: number; count: number; }
interface InputData { weightKg: number; sex: string; age: number; heightCm: number; drinks: Drink[]; startTime: string; endTime: string; }
interface TimelinePoint { timeString: string; promiles: number; }
interface OutputData { promiles: number; status: string; summary: string; timeline: TimelinePoint[]; }

export const ChartWithInput = () => {
  const [input, setInput] = useState<InputData>({
    weightKg: 70, sex: "male", age: 30, heightCm: 175,
    drinks: [{ volumeMl: 500, percent: 5, count: 1 }],
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
  });
  const [output, setOutput] = useState<OutputData | null>(null);

  const handleChange = (field: keyof InputData, value: any) => setInput({ ...input, [field]: value });
  const handleDrinkChange = (index: number, field: keyof Drink, value: any) => {
    const newDrinks = [...input.drinks]; newDrinks[index] = { ...newDrinks[index], [field]: value }; 
    setInput({ ...input, drinks: newDrinks });
  };
  const addDrink = () => setInput({ ...input, drinks: [...input.drinks, { volumeMl: 0, percent: 0, count: 1 }] });

  const submit = async () => {
    try {
      const res = await fetch("http://localhost:5293/Alkomat/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data: OutputData = await res.json();
      setOutput(data);
    } catch (e) { console.error(e); }
  };

  // Funkcja do wyboru koloru w zależności od promili i trendu
  const getLineColor = (timeline: TimelinePoint[]) => {
    return timeline.map((p, i) => {
      if (p.promiles <= 0.2) return "#2E8B57"; // zielony
      // jeśli promile powyżej 0.2, ale maleją lub rosną w zakresie 0.2-0.36 to też zielony
      if (i > 0 && p.promiles < timeline[i - 1].promiles && timeline[i - 1].promiles <= 0.36) return "#2E8B57";
      return "#FF4500"; // czerwony
    });
  };

  const lineColors = output ? getLineColor(output.timeline) : [];

  return (
    <div style={{ padding: 20 }}>
      <h2>🍺 Symulator alkoholu</h2>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <div><label>Waga (kg): </label>
            <input type="number" value={input.weightKg} onChange={e => handleChange("weightKg", Number(e.target.value))} />
          </div>
          <div><label>Wzrost (cm): </label>
            <input type="number" value={input.heightCm} onChange={e => handleChange("heightCm", Number(e.target.value))} />
          </div>
          <div><label>Wiek: </label>
            <input type="number" value={input.age} onChange={e => handleChange("age", Number(e.target.value))} />
          </div>
          <div><label>Płeć: </label>
            <select value={input.sex} onChange={e => handleChange("sex", e.target.value)}>
              <option value="male">Mężczyzna</option>
              <option value="female">Kobieta</option>
            </select>
          </div>

          <h3>Napoje</h3>
          {input.drinks.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 10 }}>
              <input type="number" placeholder="ml" value={d.volumeMl} onChange={e => handleDrinkChange(i, "volumeMl", Number(e.target.value))} />
              <input type="number" placeholder="%" value={d.percent} onChange={e => handleDrinkChange(i, "percent", Number(e.target.value))} />
              <input type="number" placeholder="ilość" value={d.count} onChange={e => handleDrinkChange(i, "count", Number(e.target.value))} />
            </div>
          ))}
          <button onClick={addDrink}>➕ Dodaj napój</button>
          <div style={{ marginTop: 20 }}><button onClick={submit}>Oblicz promile 🍷</button></div>
        </div>

        {output && (
          <div style={{ flex: 2, height: 400 }}>
            <h3>Podsumowanie: {output.summary}</h3>
            <p>Status: {output.status}</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={output.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeString" label={{ value: "Czas", position: "insideBottomRight" }} />
                <YAxis domain={[0, Math.max(...output.timeline.map(p => p.promiles)) * 1.2]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="promiles"
                  stroke="#2E8B57"
                  strokeWidth={3}
                  dot={false}
                  strokeOpacity={1}
                  // Dynamic colors po każdej wartości
                  strokeDasharray="0"
                  isAnimationActive={false}
                  // Alternatywnie można by zrobić segmenty z różnymi kolorami, np. recharts <Line segment>
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
