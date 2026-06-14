/**
 * Filename: useSettings.ts
 * Folder: /hooks/
 */

import { useEffect, useState } from "react";
import { AppSettings } from "../domain/entities/AppSettings";
import { SettingsStorage } from "../infrastructure/SettingsStorage";

const storage = new SettingsStorage();

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => storage.load());

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    storage.save(updated);
  };

  const resetSettings = () => {
    storage.reset();
    setSettings(storage.load());
  };

  return { settings, updateSettings, resetSettings };
}
