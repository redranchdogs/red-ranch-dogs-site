import { defineConfig } from "vite";

// Expose the built viewer URL so retries can bypass a browser-cached import failure.
function galleryChunkUrl() {
  const publicId = "virtual:gallery-chunk-url";
  const id = `\0${publicId}`;
  let building = false;
  return {
    name: "gallery-chunk-url",
    configResolved(config) { building = config.command === "build"; },
    resolveId(source) { if (source === publicId) return id; },
    load(source) {
      if (source !== id) return;
      if (!building) return 'export default "/src/PhotoLightbox.jsx";';
      const reference = this.emitFile({ type: "chunk", id: "./src/PhotoLightbox.jsx", name: "PhotoLightbox", preserveSignature: "strict" });
      return `export default import.meta.ROLLUP_FILE_URL_${reference};`;
    }
  };
}

export default defineConfig({
  plugins: [galleryChunkUrl()],
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
              minSize: 0,
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
