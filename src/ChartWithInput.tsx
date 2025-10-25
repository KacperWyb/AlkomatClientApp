import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Drink {
  id: string;
  label: string;
  volumeMl: number;
  percent: number;
  count: number;
}

interface InputData {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: string;
  drinks: Drink[];
  food: "nic" | "niewiele" | "standardowo" | "dużo";
  metabolism: "słabo" | "normalnie" | "szybko";
  startTime: string;
  endTime: string;
}

interface TimelinePoint {
  time: number;
  promiles: number;
}

interface OutputData {
  promiles: number;
  summary: string;
  timeline: TimelinePoint[];
}

const PRESETS = [
  { id: "large_beer", label: "Duże piwo 500ml", volumeMl: 500, percent: 5 },
  { id: "small_beer", label: "Małe piwo 350ml", volumeMl: 350, percent: 5 },
  { id: "wine", label: "Wino kieliszek 175ml", volumeMl: 175, percent: 12 },
  { id: "champagne", label: "Szampan kieliszek 120ml", volumeMl: 120, percent: 12 },
  { id: "spirit", label: "Mocny alkohol kieliszek 50ml", volumeMl: 50, percent: 40 },
] as const;

export const ChartWithInput = () => {
  const [input, setInput] = useState<InputData>({
    weightKg: 60,
    heightCm: 165,
    age: 30,
    sex: "male",
    drinks: PRESETS.map(d => ({ ...d, count: 0 })),
    food: "standardowo",
    metabolism: "normalnie",
    startTime: new Date().toISOString().slice(0,16),
    endTime: new Date().toISOString().slice(0,16),
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

  const removeDrink = (index: number) => {
    const newDrinks = [...input.drinks];
    newDrinks.splice(index,1);
    setInput({ ...input, drinks: newDrinks });
  };

  const addCustomDrink = () => {
    const label = prompt("Nazwa napoju") || "Niestandardowy napój";
    const percent = Number(prompt("Procent alkoholu") || 0);
    const volumeMl = Number(prompt("Ilość [ml]") || 0);
    setInput({
      ...input,
      drinks: [...input.drinks, { id: Date.now().toString(), label, percent, volumeMl, count: 1 }]
    });
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
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>🍺 Symulator alkoholu</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <div>
          <label>Płeć</label>
          <select value={input.sex} onChange={e => handleChange("sex", e.target.value)}>
            <option value="male">Mężczyzna</option>
            <option value="female">Kobieta</option>
          </select>
        </div>
        <div>
          <label>Wzrost [cm]</label>
          <input type="number" value={input.heightCm} onChange={e => handleChange("heightCm", Number(e.target.value))}/>
        </div>
        <div>
          <label>Waga [kg]</label>
          <input type="number" value={input.weightKg} onChange={e => handleChange("weightKg", Number(e.target.value))}/>
        </div>
        <div>
          <label>Wiek [lata]</label>
          <input type="number" value={input.age} onChange={e => handleChange("age", Number(e.target.value))}/>
        </div>
      </div>

      <h3>Co zostało spożyte?</h3>
      {input.drinks.map((d,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
          <span>{d.label}</span>
          <button onClick={() => handleDrinkChange(i,-1)}>−</button>
          <span>{d.count}</span>
          <button onClick={() => handleDrinkChange(i,1)}>+</button>
          <button onClick={() => removeDrink(i)}>🗑️</button>
          <span>{d.percent}% | {d.volumeMl}ml</span>
        </div>
      ))}
      <div style={{ marginBottom:20 }}>
        <button onClick={addCustomDrink}>Nie ma na liście tego co spożywałeś? ➕ Dodaj</button>
      </div>

      <div>
        <label>W trakcie spożywania alkoholu jadłeś</label>
        <select value={input.food} onChange={e=>handleChange("food", e.target.value)}>
          <option value="nic">nic</option>
          <option value="niewiele">niewiele</option>
          <option value="standardowo">standardowo</option>
          <option value="dużo">dużo (tłusto)</option>
        </select>
      </div>

      <div>
        <label>Alkohol spalasz</label>
        <select value={input.metabolism} onChange={e=>handleChange("metabolism", e.target.value)}>
          <option value="słabo">słabo</option>
          <option value="normalnie">normalnie</option>
          <option value="szybko">szybko</option>
        </select>
      </div>

      <div>
        <label>Rozpoczęcie spożycia</label>
        <input type="datetime-local" value={input.startTime} onChange={e=>handleChange("startTime", e.target.value)}/>
      </div>
      <div>
        <label>Zakończenie spożycia</label>
        <input type="datetime-local" value={input.endTime} onChange={e=>handleChange("endTime", e.target.value)}/>
      </div>

      <button onClick={submit} style={{ marginTop:10 }}>Oblicz promile 🍷</button>

      {output && (
        <>
          <h3>Podsumowanie: {output.summary}</h3>
          <p>Maksymalny promil: {output.promiles.toFixed(2)}</p>
          {output && <AlcoholChart output={output} />}
        </>
      )}
    </div>
  )
}

const AlcoholChart = ({ output }: { output: OutputData }) => {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={output.timeline}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="time" label={{ value:"Minuty", position:"insideBottomRight" }}/>
          <YAxis domain={[0, Math.max(...output.timeline.map(p=>p.promiles))*1.2]}/>
          <Tooltip/>
          <Line type="monotone" dataKey="promiles" stroke="#2E8B57" strokeWidth={3} dot={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};