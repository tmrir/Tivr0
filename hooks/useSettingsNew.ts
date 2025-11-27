import { useState, useEffect } from 'react';
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
  const updateNestedField = (parent: keyof SiteSettings, field: string, value: any) => {
    const newSettings = {
      ...settings,
      [parent]: {
        ...(settings[parent] as any),
        [field]: value
      }
    };
    updateSettings(newSettings);
  };

  // Test connection function
  const testConnection = async () => {
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (err) {
      return false;
    }
  };

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
    testConnection,
    updateField,
    updateNestedField
  };
}
