"use client";

import { useState, useEffect, useCallback } from "react";

export function useSettings(isAuthenticated: boolean | null) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [deepgramApiKey, setDeepgramApiKey] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((sdata) => {
          if (sdata.setting?.openaiApiKey) setOpenaiApiKey(sdata.setting.openaiApiKey);
          if (sdata.setting?.deepgramApiKey) setDeepgramApiKey(sdata.setting.deepgramApiKey);
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const saveSettings = useCallback(async () => {
    setIsSavingSettings(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openaiApiKey, deepgramApiKey }),
      });
      setIsSettingsOpen(false);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSavingSettings(false);
    }
  }, [openaiApiKey, deepgramApiKey]);

  const clearSettings = useCallback(() => {
    setOpenaiApiKey("");
    setDeepgramApiKey("");
  }, []);

  return {
    isSettingsOpen,
    setIsSettingsOpen,
    openaiApiKey,
    setOpenaiApiKey,
    deepgramApiKey,
    setDeepgramApiKey,
    isSavingSettings,
    saveSettings,
    clearSettings,
  };
}
