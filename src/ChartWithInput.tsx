import { useState } from "react";
import { AlcoholChart } from "./components/AlcoholChart";
import type { InputData, Drink, OutputData } from "./assets/interfaces";
import { PRESETS } from "./assets/presets";

export const ChartWithInput = () => {
  const [input, setInput] = useState<InputData>({
    weightKg: 70,
    heightCm: 175,
    age: 30,
    sex: "Mężczyzna",
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
  });

  const [drinks, setDrinks] = useState<Drink[]>(PRESETS.map(d => ({ ...d, count: 0 })));
  const [output, setOutput] = useState<OutputData | null>(null);

  const handleChange = (field: keyof InputData, value: any) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const handleDrinkChange = (index: number, delta: number) => {
    setDrinks(prev => {
      const newDrinks = [...prev];
      newDrinks[index] = {
        ...newDrinks[index],
        count: Math.max(0, newDrinks[index].count + delta),
      };
      return newDrinks;
    });
  };

  const removeDrink = (index: number) => {
    setDrinks(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomDrink = () => {
    const label = prompt("Nazwa napoju") || "Niestandardowy napój";
    const percent = Number(prompt("Procent alkoholu") || 0);
    const volumeMl = Number(prompt("Ilość [ml]") || 0);
    setDrinks(prev => [
      ...prev,
      { id: Date.now().toString(), label, percent, volumeMl, count: 1 },
    ]);
  };

  const submit = async () => {
    try {
      const fullInput = { ...input, drinks };
      const res = await fetch("http://localhost:5293/Alkomat/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullInput),
      });
      const data: OutputData = await res.json();
      setOutput(data);
    } catch (e) {
      console.error(e);
    }
  };

  // kolor tła zależny od statusu
  const currPromiles = output?.timeline?.length
    ? output.timeline[output.timeline.length - 1].promiles
    : 0;
  const isGreenPhase = currPromiles <= 0.2;
  const panelBg = isGreenPhase
    ? "linear-gradient(180deg,#E8F5E9 0%,#FFFFFF 60%)"
    : "linear-gradient(180deg,#FFEBEE 0%,#FFFFFF 60%)";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        gap: 16,
        padding: 20,
        alignItems: "stretch",
      }}
    >
      {/* Lewy panel */}
      <div
        style={{
          background: panelBg,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>🍺 Symulator alkoholu</h2>

        {/* Dane wejściowe */}
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { label: "Płeć", field: "sex", type: "select", options: ["Mężczyzna", "Kobieta"] },
            { label: "Waga (kg)", field: "weightKg", type: "number" },
            { label: "Wzrost (cm)", field: "heightCm", type: "number" },
            { label: "Wiek (lata)", field: "age", type: "number" },
          ].map((inputDef, idx) => (
            <label key={idx}>
              <small>{inputDef.label}</small>
              {inputDef.type === "select" ? (
                <select
                  value={input[inputDef.field as keyof InputData] as string}
                  onChange={e => handleChange(inputDef.field as keyof InputData, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                  }}
                >
                  {inputDef.options?.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={inputDef.type}
                  value={input[inputDef.field as keyof InputData] as any}
                  onChange={e =>
                    handleChange(inputDef.field as keyof InputData, Number(e.target.value))
                  }
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                  }}
                />
              )}
            </label>
          ))}

          {/* Napoje */}
          <div style={{ marginTop: 10 }}>
            <strong>Co zostało spożyte</strong>
            <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
              {drinks.map((d, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 10,
                    background: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{d.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {d.percent}% | {d.volumeMl} ml
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => handleDrinkChange(i, -1)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#f8fafc",
                      }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={d.count}
                      min={0}
                      onChange={e => handleDrinkChange(i, Number(e.target.value) - d.count)}
                      style={{
                        width: 48,
                        textAlign: "center",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                      }}
                    />
                    <button
                      onClick={() => handleDrinkChange(i, 1)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#f8fafc",
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeDrink(i)}
                      style={{
                        background: "#fef2f2",
                        color: "#b91c1c",
                        border: "1px solid #fecaca",
                        borderRadius: 8,
                        padding: "6px 10px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 14 }}>
              <span>Nie ma na liście tego co spożywałeś?</span>
              <button
                onClick={addCustomDrink}
                style={{
                  marginLeft: 8,
                  background: "#ecfeff",
                  color: "#0e7490",
                  border: "1px solid #a5f3fc",
                  borderRadius: 8,
                  padding: "6px 10px",
                }}
              >
                ➕ Dodaj
              </button>
            </div>
          </div>

          {/* Czas */}
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            <label>
              <small>Start</small>
              <input
                type="datetime-local"
                value={input.startTime}
                onChange={e => handleChange("startTime", e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
            </label>
            <label>
              <small>Koniec</small>
              <input
                type="datetime-local"
                value={input.endTime}
                onChange={e => handleChange("endTime", e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
            </label>
          </div>

          <button
            onClick={submit}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              background: "#15803d",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Oblicz promile 🍷
          </button>
        </div>
      </div>

      {/* Prawy panel – wykres */}
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
    </div>
  );
};
