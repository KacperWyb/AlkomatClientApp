import { useState } from "react";
import type { InputData, Drink, OutputData } from "../assets/interfaces";
import { PRESETS } from "../assets/presets";
import { ChartPanel } from "./ChartPanel";
import { InputPanel } from "./InputPanel";

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
      {/* Left */}
      <InputPanel
        input={input}
        onInputChange={handleChange}
        drinks={drinks}
        setDrinks={setDrinks}
        onSubmit={submit}
        output={output}
      />
      {/* right */}
      <ChartPanel output={output} />
    </div>
  );
};
