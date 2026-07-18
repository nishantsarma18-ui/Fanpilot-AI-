import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

export function loadApiKey(): string | undefined {
  // 1. Prioritize environment variable (e.g. set in Netlify / Cloud Run dashboard or local .env)
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MOCK_KEY') {
    return process.env.GEMINI_API_KEY;
  }

  // 2. Check config.json in the project root
  try {
    const rootConfigPath = path.join(process.cwd(), 'config.json');
    if (fs.existsSync(rootConfigPath)) {
      const data = JSON.parse(fs.readFileSync(rootConfigPath, 'utf8'));
      if (data.GEMINI_API_KEY && data.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' && data.GEMINI_API_KEY.trim() !== '') {
        return data.GEMINI_API_KEY.trim();
      }
    }
  } catch (e) {
    console.warn("Warning: Failed to parse root config.json:", e);
  }

  // 3. Check src/config.json
  try {
    const srcConfigPath = path.join(process.cwd(), 'src', 'config.json');
    if (fs.existsSync(srcConfigPath)) {
      const data = JSON.parse(fs.readFileSync(srcConfigPath, 'utf8'));
      if (data.GEMINI_API_KEY && data.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' && data.GEMINI_API_KEY.trim() !== '') {
        return data.GEMINI_API_KEY.trim();
      }
    }
  } catch (e) {
    console.warn("Warning: Failed to parse src/config.json:", e);
  }

  // 4. Hardcoded key fallback - allow user to commit the key directly to their repository
  const HARDCODED_API_KEY: string = ""; // Paste your key here (e.g. "AIzaSy...") to embed it inside the code
  if (HARDCODED_API_KEY && HARDCODED_API_KEY.trim() !== "") {
    return HARDCODED_API_KEY.trim();
  }

  return undefined;
}

export const apiKey = loadApiKey();
