"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useSessionManager } from "@/hooks/use-session-storage";
import { usePathname } from "next/navigation";

interface SessionContextType {
  userPreferences: any;
  setUserPreferences: (value: any) => void;
  sessionData: any;
  setSessionData: (value: any) => void;
  dashboardSettings: any;
  setDashboardSettings: (value: any) => void;
  updateActivity: () => void;
  addToSearchHistory: (searchTerm: string) => void;
  updateCurrentPage: (page: string) => void;
  saveFilters: (page: string, filters: any) => void;
  saveSortPreferences: (page: string, sortConfig: any) => void;
  clearSession: () => void;
  isSessionExpired: () => boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionManager = useSessionManager();
  const pathname = usePathname();

  // Update current page when pathname changes
  useEffect(() => {
    sessionManager.updateCurrentPage(pathname);
  }, [pathname, sessionManager.updateCurrentPage]);

  // Check for expired session on mount only
  useEffect(() => {
    if (sessionManager.isSessionExpired()) {
      console.log("Session expired, clearing session data");
      sessionManager.clearSession();
    }
  }, []); // Empty dependency array - only run on mount

  return (
    <SessionContext.Provider value={sessionManager}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

// Hook for managing table preferences
export function useTablePreferences(tableName: string) {
  const { sessionData, saveFilters, saveSortPreferences } = useSession();

  const getFilters = () => {
    return sessionData.filters[tableName] || {};
  };

  const getSortPreferences = () => {
    return (
      sessionData.sortPreferences[tableName] || {
        sortBy: "name",
        sortOrder: "asc",
      }
    );
  };

  const updateFilters = (filters: any) => {
    saveFilters(tableName, filters);
  };

  const updateSortPreferences = (sortConfig: any) => {
    saveSortPreferences(tableName, sortConfig);
  };

  return {
    filters: getFilters(),
    sortPreferences: getSortPreferences(),
    updateFilters,
    updateSortPreferences,
  };
}

// Hook for managing search history
export function useSearchHistory() {
  const { sessionData, addToSearchHistory } = useSession();

  return {
    searchHistory: sessionData.searchHistory,
    addToSearchHistory,
  };
}

// Hook for managing dashboard settings
export function useDashboardSettings() {
  const { dashboardSettings, setDashboardSettings } = useSession();

  const updateSetting = (key: string, value: any) => {
    setDashboardSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    settings: dashboardSettings,
    updateSetting,
    setDashboardSettings,
  };
}

// Hook for managing user preferences
export function useUserPreferences() {
  const { userPreferences, setUserPreferences } = useSession();

  const updatePreference = (key: string, value: any) => {
    setUserPreferences((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    preferences: userPreferences,
    updatePreference,
    setUserPreferences,
  };
}
