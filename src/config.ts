/** Central frontend configuration — single source of truth for all env-driven values. */

export const API_BASE: string =
  import.meta.env.VITE_API_BASE || "http://localhost:5000";

export const DEFAULT_POSITION: [number, number] = [
  Number(import.meta.env.VITE_DEFAULT_LAT) || 18.44271143872656,
  Number(import.meta.env.VITE_DEFAULT_LNG) || 73.83139194092284,
];
