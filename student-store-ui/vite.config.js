import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig((envConfig) => ({
  plugins: [
    react({
      include: ["./src/main.jsx"],
    }),
  ],
  // Output the production bundle to "build" (Render's expected publish
  // directory, and the folder name listed in .gitignore). Vite's default is
  // "dist".
  build: {
    outDir: "build",
  },
  server: {
    port: 5173,
    open: true,
    host: true,
  },
}))
