import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, res) => {
            console.warn("[Vite Proxy Notice] Backend connection on 127.0.0.1:8000:", err.message);
            if (res.writeHead && !res.headersSent) {
              res.writeHead(502, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  status: "gateway_offline",
                  detail: "Backend gateway offline or restarting on port 8000. Resilient client simulation active.",
                  code: 502,
                })
              );
            }
          });
        },
      },
    },
  },
});