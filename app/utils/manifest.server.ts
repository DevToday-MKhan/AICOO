import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let manifestCache: any = null;

export function getFrontendAssets() {
  if (manifestCache) {
    return manifestCache;
  }

  try {
    const publicDir = path.join(__dirname, "../../public");
    const indexHtmlPath = path.join(publicDir, "index.html");
    
    if (fs.existsSync(indexHtmlPath)) {
      const html = fs.readFileSync(indexHtmlPath, "utf8");
      
      // Extract script and CSS references from index.html
      const scriptMatch = html.match(/src="([^"]+\.js)"/);
      const cssMatch = html.match(/href="([^"]+\.css)"/);
      
      manifestCache = {
        js: scriptMatch ? scriptMatch[1] : "/assets/index.js",
        css: cssMatch ? cssMatch[1] : "/assets/index.css",
      };
      
      return manifestCache;
    }
  } catch (error) {
    console.error("Error loading frontend assets:", error);
  }
  
  // Fallback
  return {
    js: "/assets/index.js",
    css: "/assets/index.css",
  };
}
