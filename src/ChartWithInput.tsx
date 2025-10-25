import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts";

interface Drink { volumeMl: number; percent: number; count: number; }
interface InputData {
  weightKg: number;
  sex: string;
  age: number;
  heightCm: number;
  drinks: Drink[];
  startTime: string;
  endTime: string;
}
interface TimelinePoint { timeString: string; promiles: number; }
interface OutputData { promiles: number; status: string; summary: string; timeline: TimelinePoint[]; }

// Presety napojów do wyboru (typowe wartości %)
const PRESETS = [
  { id: "large_beer", label: "Duże piwo (500 ml)", volumeMl: 500, percent: 5 },
  { id: "small_beer", label: "Małe piwo (350 ml)", volumeMl: 350, percent: 5 },
  { id: "wine", label: "Wino – kieliszek (175 ml)", volumeMl: 175, percent: 12 },
  { id: "champagne", label: "Szampan – kieliszek (120 ml)", volumeMl: 120, percent: 12 },
  { id: "spirit", label: "Mocny alkohol – kieliszek (50 ml)", volumeMl: 50, percent: 40 },
] as const;

type PresetId = typeof PRESETS[number]["id"];

export const ChartWithInput = () => {
  // --- Stan danych wejściowych (bez ręcznej edycji napojów) ---
  const [input, setInput] = useState<InputData>({
    weightKg: 70,
    sex: "male",
    age: 30,
    heightCm: 175,
    drinks: [],
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
  });

  // Liczniki dla presetów: start wg Twoich wymagań
  const [presetCounts, setPresetCounts] = useState<Record<PresetId, number>>({
    large_beer: 1,
    small_beer: 1,
    wine: 0,
    champagne: 0,
    spirit: 0,
  });

  // Dodatkowe, własne napoje
  const [customDrinks, setCustomDrinks] = useState<Drink[]>([]);

  const [output, setOutput] = useState<OutputData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zmiana pól prostych
  const handleChange = (field: keyof InputData, value: any) => setInput(prev => ({ ...prev, [field]: value }));

  // Modyfikacja liczby sztuk dla presetów
  const changePresetCount = (id: PresetId, next: number) => {
    setPresetCounts(prev => ({ ...prev, [id]: Math.max(0, next | 0) }));
  };

  // Dodaj własny napój (domyślnie: % 0, objętość 10 ml, 1 szt.)
  const addCustomDrink = () => setCustomDrinks(prev => ([...prev, { volumeMl: 10, percent: 0, count: 1 }]));
  const updateCustomDrink = (index: number, patch: Partial<Drink>) => {
    setCustomDrinks(prev => prev.map((d, i) => i === index ? { ...d, ...patch } : d));
  };
  const removeCustomDrink = (index: number) => setCustomDrinks(prev => prev.filter((_, i) => i !== index));

  // Z presetów + customów budujemy tablicę do API
  useEffect(() => {
    const fromPresets: Drink[] = PRESETS.flatMap(p => {
      const count = presetCounts[p.id] ?? 0;
      return count > 0 ? [{ volumeMl: p.volumeMl, percent: p.percent, count }] : [];
    });
    const newDrinks = [...fromPresets, ...customDrinks];

    setInput(prev => {
      const same = JSON.stringify(prev.drinks) === JSON.stringify(newDrinks);
      return same ? prev : { ...prev, drinks: newDrinks };
    });
  }, [presetCounts, customDrinks]);

  // Wywołanie obliczeń po KAŻDEJ zmianie (debounce)
  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(() => { submit(controller.signal); }, 450);
    return () => { controller.abort(); clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const submit = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5293/Alkomat/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: OutputData = await res.json();
      setOutput(data);
    } catch (e: any) {
      if (e?.name === "AbortError") return; // przerwane przy kolejnej zmianie
      console.error(e);
      setError(e?.message ?? "Coś poszło nie tak");
    } finally {
      setLoading(false);
    }
  };

  // Kolory tła: zielone do 0.2‰, czerwone powyżej 0.2‰
  const currPromiles = output?.timeline?.length
    ? output.timeline[output.timeline.length - 1].promiles
    : 0;
  const isGreenPhase = currPromiles <= 0.2;

  const panelBg = isGreenPhase
    ? "linear-gradient(180deg,#E8F5E9 0%,#FFFFFF 60%)"
    : "linear-gradient(180deg,#FFEBEE 0%,#FFFFFF 60%)";

  // Dane wykresu
  const timeline = output?.timeline ?? [];
  const maxY = useMemo(() => {
    if (timeline.length === 0) return 1;
    const m = Math.max(...timeline.map(p => p.promiles));
    return Math.max(1, m * 1.2);
  }, [timeline]);

  const xStart = timeline[0]?.timeString;
  const xEnd = timeline[timeline.length - 1]?.timeString;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, padding: 20, alignItems: "start" }}>
      {/* Lewy panel: dane + wybór napojów */}
      <div style={{ background: panelBg, border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 style={{ marginTop: 0 }}>🍺 Symulator alkoholu</h2>

        <div style={{ display: "grid", gap: 8 }}>
          <label>
            <span>Waga (kg): </span>
            <input type="number" value={input.weightKg} onChange={e => handleChange("weightKg", Number(e.target.value))} style={{ width: "100%" }} />
          </label>
          <label>
            <span>Wzrost (cm): </span>
            <input type="number" value={input.heightCm} onChange={e => handleChange("heightCm", Number(e.target.value))} style={{ width: "100%" }} />
          </label>
          <label>
            <span>Wiek: </span>
            <input type="number" value={input.age} onChange={e => handleChange("age", Number(e.target.value))} style={{ width: "100%" }} />
          </label>
          <label>
            <span>Płeć: </span>
            <select value={input.sex} onChange={e => handleChange("sex", e.target.value)} style={{ width: "100%" }}>
              <option value="male">Mężczyzna</option>
              <option value="female">Kobieta</option>
            </select>
          </label>

          {/* Co zostało spożyte */}
          <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
            <strong>Co zostało spożyte</strong>
            {PRESETS.map(p => (
              <div key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{p.percent}% alkoholu</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => changePresetCount(p.id, (presetCounts[p.id] ?? 0) - 1)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f8fafc" }}>−</button>
                  <input type="number" min={0} value={presetCounts[p.id] ?? 0} onChange={e => changePresetCount(p.id, Number(e.target.value))} style={{ width: 64, textAlign: "center" }} />
                  <button onClick={() => changePresetCount(p.id, (presetCounts[p.id] ?? 0) + 1)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f8fafc" }}>+</button>
                </div>
              </div>
            ))}

            {/* Dodawanie własnego napoju */}
            <div style={{ marginTop: 4, fontSize: 14 }}>
              <span>Nie ma na liście tego co spożywałeś?</span>
              <button onClick={addCustomDrink} style={{ marginLeft: 8, background: "#ecfeff", color: "#0e7490", border: "1px solid #a5f3fc", borderRadius: 8, padding: "6px 10px" }}>➕ Dodaj</button>
            </div>

            {customDrinks.map((d, i) => (
              <div key={i} style={{ border: "1px solid #a5f3fc", background: "#f0f9ff", borderRadius: 10, padding: 10 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <label style={{ flex: "1 1 120px" }}>
                    <small>Moc (%)</small>
                    <input type="number" step={0.1} value={d.percent} onChange={e => updateCustomDrink(i, { percent: Number(e.target.value) })} style={{ width: "100%" }} />
                  </label>
                  <label style={{ flex: "1 1 120px" }}>
                    <small>Objętość (ml)</small>
                    <input type="number" value={d.volumeMl} onChange={e => updateCustomDrink(i, { volumeMl: Number(e.target.value) })} style={{ width: "100%" }} />
                  </label>
                  <label style={{ flex: "1 1 120px" }}>
                    <small>Ilość (szt.)</small>
                    <input type="number" min={1} value={d.count} onChange={e => updateCustomDrink(i, { count: Number(e.target.value) })} style={{ width: "100%" }} />
                  </label>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button onClick={() => removeCustomDrink(i)} style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 10px" }}>Usuń</button>
                </div>
              </div>
            ))}
          </div>

          {/* Czas */}
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            <label>
              <small>Start</small>
              <input
                type="datetime-local"
                value={input.startTime.slice(0, 16)}
                onChange={e => handleChange("startTime", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
            <label>
              <small>Koniec</small>
              <input
                type="datetime-local"
                value={input.endTime.slice(0, 16)}
                onChange={e => handleChange("endTime", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
          </div>

          {/* Bez przycisku „Oblicz” – liczy się automatycznie */}
          <div style={{ marginTop: 8, minHeight: 20 }}>
            {loading && <span>Obliczam…</span>}
            {error && <span style={{ color: "#b91c1c" }}>Błąd: {error}</span>}
          </div>

          {output && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  title={isGreenPhase ? "≤ 0.2‰" : "> 0.2‰"}
                  style={{ width: 10, height: 10, borderRadius: 9999, background: isGreenPhase ? "#16a34a" : "#dc2626" }}
                />
                <strong>Status:</strong> {output.status}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Podsumowanie:</strong> {output.summary}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prawy panel: wykres */}
      <div style={{ minHeight: 420, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 6px" }}>
          <h3 style={{ margin: 0 }}>Wykres stężenia alkoholu (‰)</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, background: "#E8F5E9", border: "1px solid #bbf7d0", display: "inline-block" }} />
              <span>≤ 0.2‰ – strefa zielona</span>
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, background: "#FFEBEE", border: "1px solid #fecaca", display: "inline-block" }} />
              <span>&gt; 0.2‰ – strefa czerwona</span>
            </span>
          </div>
        </div>
        <div style={{ width: "100%", height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 12, right: 24, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timeString" interval="preserveStartEnd" angle={0} tickMargin={8} label={{ value: "Czas", position: "insideBottomRight", offset: -10 }} />
              <YAxis domain={[0, maxY]} tickFormatter={(v) => v.toFixed(2)} label={{ value: "‰", position: "insideLeft" }} />
              <Tooltip formatter={(value: any) => [`${Number(value).toFixed(3)}‰`, "Promile"]} />

              {/* Tło */}
              {timeline.length > 0 && (
                <>
                  <ReferenceArea x1={xStart} x2={xEnd} y1={0} y2={0.2} fill="#E8F5E9" fillOpacity={0.85} ifOverflow="visible" />
                  <ReferenceArea x1={xStart} x2={xEnd} y1={0.2} y2={maxY} fill="#FFEBEE" fillOpacity={0.5} ifOverflow="visible" />
                </>
              )}
              <ReferenceLine y={0.2} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "0.2‰", position: "insideTopRight" }} />

              <Line type="monotone" dataKey="promiles" strokeWidth={3} dot={false} isAnimationActive={false} stroke="#1f2937" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
