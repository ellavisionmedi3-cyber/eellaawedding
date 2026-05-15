"use client";

import React, { createContext, useContext } from "react";

const SettingsContext = createContext<Record<string, string>>({});

export function SettingsProvider({ children, settings }: { children: React.ReactNode; settings: Record<string, string> }) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
