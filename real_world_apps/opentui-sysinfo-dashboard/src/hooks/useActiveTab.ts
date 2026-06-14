import { useState } from "react";

export type Tab = "dashboard" | "processes" | "settings";

export const useActiveTab = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  return { tab, setTab };
};
