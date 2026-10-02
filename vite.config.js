import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";
import retiredLitterMedia, { retiredLitterMediaPath } from "./api/retired-litter-media.js";

// Apply the existing publication control before litter records reach the browser.
function publicLitterData() {
  const litterFile = fileURLToPath(new URL("./src/data/litters.json", import.meta.url));
  const parentFile = fileURLToPath(new URL("./src/data/parents.json", import.meta.url));
  const isHidden = (record) => ["hidden", "private"].includes(String(record.visibility || "public").trim().toLowerCase());
  return {
    name: "public-litter-data",
    enforce: "pre",
    transform(code, id) {
      const file = id.split("?")[0];
      if (file !== litterFile && file !== parentFile) return;
      let records = JSON.parse(code);
      if (file === litterFile) records = records.filter((record) => !isHidden(record));
      else {
        this.addWatchFile(litterFile);
        const hiddenSlugs = new Set(JSON.parse(readFileSync(litterFile, "utf8")).filter(isHidden).map((record) => record.slug));
        records = records.map((record) => Array.isArray(record.relatedLitters)
          ? { ...record, relatedLitters: record.relatedLitters.filter((slug) => !hiddenSlugs.has(slug)) }
          : record);
      }
      return { code: JSON.stringify(records), map: null };
    }
  };
}

// Match the exact production retirement response in local dev/preview QA.
function retiredMediaRoute() {
  const configure = (server) => {
    server.middlewares.use((request, response, next) => {
      if (new URL(request.url, "http://localhost").pathname === retiredLitterMediaPath) return retiredLitterMedia(request, response);
      next();
    });
  };
  return { name: "retired-litter-media", configureServer: configure, configurePreviewServer: configure };
}

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
  plugins: [publicLitterData(), retiredMediaRoute(), galleryChunkUrl()],
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
