// Base URL for the Student Store backend API.
// Kept in one place so every fetch call points at the same server.
// In production (e.g. Render) set VITE_API_BASE_URL to the deployed backend
// URL; locally it falls back to the Express server on port 3000.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
