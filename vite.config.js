import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20 * 1024,
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom)[\\/]/,
              priority: 30
            },
            {
              name: "icons-vendor",
              test: /node_modules[\\/](lucide-react|lucide)[\\/]/,
              priority: 20
            },
            {
              name: "analytics-vendor",
              test: /node_modules[\\/]@vercel[\\/]analytics[\\/]/,
              priority: 10
            }
          ]
        }
      }
    }
  }
});
