import { inputs } from "../assets/inputs";
import type { InputData, Drink, OutputData } from "../assets/interfaces";

interface InputPanelProps {
  input: InputData;
  onInputChange: (field: keyof InputData, value: any) => void;
  drinks: Drink[];
  setDrinks: React.Dispatch<React.SetStateAction<Drink[]>>;
  onSubmit: () => void;
  output: OutputData | null;
}

export const InputPanel = ({
  input,
  onInputChange,
  drinks,
  setDrinks,
  onSubmit,
}: InputPanelProps) => {
  const handleDrinkChange = (index: number, delta: number) => {
    setDrinks((prev) => {
      const newDrinks = [...prev];
      newDrinks[index] = {
        ...newDrinks[index],
        count: Math.max(0, newDrinks[index].count + delta),
      };
      return newDrinks;
    });
  };

  const removeDrink = (index: number) => {
    setDrinks((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomDrink = () => {
    setDrinks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: "Niestandardowy napój",
        percent: 0,
        volumeMl: 10,
        count: 1,
      },
    ]);
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg,#E8F5E9 0%,#FFFFFF 60%)",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>🍺 Symulator alkoholu</h2>

      {/* Dane wejściowe */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {inputs.map((inputDef, idx) => (
          <label key={idx} style={{ display: "flex", flexDirection: "column" }}>
            <small>{inputDef.label}</small>
            {inputDef.type === "select" ? (
              <select
                value={input[inputDef.field as keyof InputData] as string}
                onChange={(e) =>
                  onInputChange(inputDef.field as keyof InputData, e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                }}
              >
                {inputDef.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={inputDef.type}
                value={input[inputDef.field as keyof InputData] as any}
                onChange={(e) =>
                  onInputChange(inputDef.field as keyof InputData, Number(e.target.value))
                }
                style={{
                  width: "90%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                }}
              />
            )}
          </label>
        ))}
      </div>

      {/* Napoje */}
      <div style={{ marginTop: 16 }}>
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
              {/* start */}

              {/* <div>
                <div style={{ fontWeight: 600 }}>{d.label}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {d.percent}% | {d.volumeMl} ml
                </div>
              </div> */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontWeight: 600 }}>
                  {d.label}
                </div>
                {d.label === "Niestandardowy napój" ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="number"
                      value={d.percent}
                      onChange={(e) =>
                        setDrinks((prev) => {
                          const newDrinks = [...prev];
                          newDrinks[i] = { ...newDrinks[i], percent: Number(e.target.value) };
                          return newDrinks;
                        })
                      }
                      style={{
                        width: 30,
                        padding: "4px 6px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                      }}
                    />
                    <span style={{ alignSelf: "center", fontSize: 13 }}>%</span>

                    <input
                      type="number"
                      value={d.volumeMl}
                      onChange={(e) =>
                        setDrinks((prev) => {
                          const newDrinks = [...prev];
                          newDrinks[i] = { ...newDrinks[i], volumeMl: Number(e.target.value) };
                          return newDrinks;
                        })
                      }
                      style={{
                        width: 35,
                        padding: "4px 6px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                      }}
                    />
                    <span style={{ alignSelf: "center", fontSize: 13 }}>ml</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {d.percent}% | {d.volumeMl} ml
                  </div>
                )}
              </div>


              {/* koniec */}
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
                  onChange={(e) =>
                    handleDrinkChange(i, Number(e.target.value) - d.count)
                  }
                  style={{
                    width: 35,
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
            onChange={(e) => onInputChange("startTime", e.target.value)}
            style={{
              width: "90%",
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
            onChange={(e) => onInputChange("endTime", e.target.value)}
            style={{
              width: "90%",
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
            }}
          />
        </label>
      </div>

      <button
        onClick={onSubmit}
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
  );
};
