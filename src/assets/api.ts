import type { InputData, OutputData } from "./interfaces";

export async function calculateAlkomat(input: InputData): Promise<OutputData> {
  const res = await fetch(`${API_URL}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(`Błąd API: ${res.status}`);
  }

  return res.json();
}