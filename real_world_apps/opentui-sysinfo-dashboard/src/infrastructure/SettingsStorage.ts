/**
 * Filename: SettingsStorage.ts
 * Folder: /infrastructure/
 */

import fs from "fs";
import path from "path";
import os from "os";
import { AppSettings, defaultSettings } from "../domain/entities/AppSettings";

export class SettingsStorage {
  private configPath: string;

  constructor() {
    const configDir = path.join(os.homedir(), ".opentui-dashboard");
    this.configPath = path.join(configDir, "settings.json");

    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  load(): AppSettings {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf-8");
        const settings = JSON.parse(data);
        return { ...defaultSettings, ...settings };
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
    return defaultSettings;
  }

  save(settings: AppSettings): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  reset(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        fs.unlinkSync(this.configPath);
      }
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  }
}
