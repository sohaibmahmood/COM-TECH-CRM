"use client";

import { useState, useEffect, useCallback } from "react";

type StorageType = "localStorage" | "sessionStorage";

interface UseStorageOptions {
  type?: StorageType;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

export function useStorage<T>(
  key: string,
  defaultValue: T,
  options: UseStorageOptions = {}
) {
  const {
    type = "localStorage",
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const storage = window[type];
      const item = storage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading ${type} key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prevValue) => {
          const valueToStore =
            value instanceof Function ? value(prevValue) : value;

          if (typeof window !== "undefined") {
            const storage = window[type];
            storage.setItem(key, serialize(valueToStore));
          }

          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting ${type} key "${key}":`, error);
      }
    },
    [key, serialize, type]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (typeof window !== "undefined") {
        const storage = window[type];
        storage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing ${type} key "${key}":`, error);
    }
  }, [key, defaultValue, type]);

  return [storedValue, setValue, removeValue] as const;
}

// Specific hooks for localStorage and sessionStorage
export function useLocalStorage<T>(key: string, defaultValue: T) {
  return useStorage(key, defaultValue, { type: "localStorage" });
}

export function useSessionStorage<T>(key: string, defaultValue: T) {
  return useStorage(key, defaultValue, { type: "sessionStorage" });
}

// Session management hook
export function useSessionManager() {
  const [userPreferences, setUserPreferences] = useLocalStorage(
    "userPreferences",
    {
      theme: "light",
      language: "en",
      currency: "PKR",
      dateFormat: "DD/MM/YYYY",
      timezone: "Asia/Karachi",
    }
  );

  const [sessionData, setSessionData] = useSessionStorage("sessionData", {
    lastActivity: Date.now(),
    searchHistory: [] as string[],
    currentPage: "/",
    filters: {},
    sortPreferences: {},
  });

  const [dashboardSettings, setDashboardSettings] = useLocalStorage(
    "dashboardSettings",
    {
      refreshInterval: 30000, // 30 seconds
      autoRefresh: true,
      showNotifications: true,
      compactView: false,
    }
  );

  // Update last activity
  const updateActivity = useCallback(() => {
    setSessionData((prev) => ({
      ...prev,
      lastActivity: Date.now(),
    }));
  }, [setSessionData]);

  // Add to search history
  const addToSearchHistory = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) return;

      setSessionData((prev) => ({
        ...prev,
        searchHistory: [
          searchTerm,
          ...prev.searchHistory.filter((term) => term !== searchTerm),
        ].slice(0, 10), // Keep only last 10 searches
      }));
    },
    [setSessionData]
  );

  // Update current page
  const updateCurrentPage = useCallback(
    (page: string) => {
      setSessionData((prev) => ({
        ...prev,
        currentPage: page,
      }));
    },
    [setSessionData]
  );

  // Save filter preferences
  const saveFilters = useCallback(
    (page: string, filters: any) => {
      setSessionData((prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          [page]: filters,
        },
      }));
    },
    [setSessionData]
  );

  // Save sort preferences
  const saveSortPreferences = useCallback(
    (page: string, sortConfig: any) => {
      setSessionData((prev) => ({
        ...prev,
        sortPreferences: {
          ...prev.sortPreferences,
          [page]: sortConfig,
        },
      }));
    },
    [setSessionData]
  );

  // Clear session data
  const clearSession = useCallback(() => {
    setSessionData({
      lastActivity: Date.now(),
      searchHistory: [],
      currentPage: "/",
      filters: {},
      sortPreferences: {},
    });
  }, [setSessionData]);

  // Check if session is expired (24 hours)
  const isSessionExpired = useCallback(() => {
    const now = Date.now();
    const lastActivity = sessionData.lastActivity;
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    return now - lastActivity > sessionTimeout;
  }, [sessionData.lastActivity]);

  // Auto-update activity on user interaction
  useEffect(() => {
    const handleUserActivity = () => {
      updateActivity();
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [updateActivity]);

  return {
    userPreferences,
    setUserPreferences,
    sessionData,
    setSessionData,
    dashboardSettings,
    setDashboardSettings,
    updateActivity,
    addToSearchHistory,
    updateCurrentPage,
    saveFilters,
    saveSortPreferences,
    clearSession,
    isSessionExpired,
  };
}
