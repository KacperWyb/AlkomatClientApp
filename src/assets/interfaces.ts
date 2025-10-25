export interface Drink {
  id: string;
  label: string;
  volumeMl: number;
  percent: number;
  count: number;
}

export interface InputData {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: string;
  startTime: string;
  endTime: string;
}

export interface TimelinePoint {
  time: number;
  promiles: number;
}

export interface OutputData {
  promiles: number;
  summary: string;
  timeline: TimelinePoint[];
}