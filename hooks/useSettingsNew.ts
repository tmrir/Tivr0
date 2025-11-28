import { useState, useEffect, useCallback } from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { SiteSettings } from '../types';

export function useSettingsNew() {
  const { 
    settings, 
    loading, 
    saving, 
    error, 
    hasUnsavedChanges,
    updateSettings, 
    updateField, 
    saveSettings,
    refreshSettings,
    resetChanges
  } = useSettingsContext();

  // تحديث حقل متداخل
  const updateNestedField = useCallback((parent: keyof SiteSettings, field: string, value: any) => {
    const newSettings = {
      ...settings,
      [parent]: {
        ...(settings[parent] as any),
        [field]: value
      }
    };
    updateSettings(newSettings);
  }, [settings, updateSettings]);

  return {
    settings,
    setSettings: updateSettings,
    loading,
    saving,
    error,
    hasUnsavedChanges,
    fetchSettings: refreshSettings,
    saveSettings,
    resetChanges,
    testConnection: async () => {
      try {
        return true;
      } catch (err) {
        return false;
      }
    },
    updateField,
    updateNestedField
  };
}
