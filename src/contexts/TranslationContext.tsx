import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TranslationState, TranslationStrings, StoredTranslation } from '@/types/translation';
import enTemplate from '@/i18n/template-en.json';
import { setTranslationFunction } from '@/utils/timeUtils';
import { fontService } from '@/services/fontService';

const TRANSLATION_STORAGE_KEY = 'muajjin-translations';
const ACTIVE_TRANSLATION_KEY = 'muajjin-active-translation';

interface TranslationContextType {
  t: (key: string, params?: Record<string, string | number>) => string;
  getPrayerName: (prayer: string) => string;
  activeTranslation: StoredTranslation | null;
  setActiveTranslation: (id: string | null) => void;
  importedTranslations: Record<string, StoredTranslation>;
  importTranslation: (translation: any) => { success: boolean; error?: string; id?: string };
  deleteTranslation: (id: string) => void;
  direction: 'ltr' | 'rtl';
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Track current applied font
let currentFont: string | null = null;

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: any, key: string): string | undefined {
  const keys = key.split('.');
  let value = obj;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

// Replace {{placeholder}} with actual values
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TranslationState>({
    activeTranslationId: null,
    translations: {}
  });
  const [mounted, setMounted] = useState(false);

  // Load translations from localStorage on mount
  useEffect(() => {
    try {
      const storedTranslations = localStorage.getItem(TRANSLATION_STORAGE_KEY);
      const activeId = localStorage.getItem(ACTIVE_TRANSLATION_KEY);

      setState({
        activeTranslationId: activeId || null,
        translations: storedTranslations ? JSON.parse(storedTranslations) : {}
      });
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      setMounted(true);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(TRANSLATION_STORAGE_KEY, JSON.stringify(state.translations));
        if (state.activeTranslationId) {
          localStorage.setItem(ACTIVE_TRANSLATION_KEY, state.activeTranslationId);
        } else {
          localStorage.removeItem(ACTIVE_TRANSLATION_KEY);
        }
      } catch (error) {
        console.error('Failed to save translations:', error);
      }
    }
  }, [state, mounted]);

  // Get active translation
  const activeTranslation = state.activeTranslationId
    ? state.translations[state.activeTranslationId]
    : null;

  const direction = activeTranslation?.meta.direction || 'ltr';

  // Load font when translation changes
  useEffect(() => {
    const loadFontForTranslation = async () => {
      // Remove previous font
      if (currentFont) {
        fontService.removeFont(currentFont);
        currentFont = null;
      }

      // Load new font if available
      if (activeTranslation?.meta.font && state.activeTranslationId) {
        try {
          const fontName = await fontService.loadFont(
            activeTranslation.meta.font.url,
            state.activeTranslationId
          );
          fontService.applyFont(fontName);
          currentFont = fontName;
          console.log('Custom font applied:', fontName);
        } catch (error) {
          console.error('Failed to load custom font:', error);
          // Continue without custom font - translation still works
        }
      }
    };

    loadFontForTranslation();
  }, [activeTranslation]);

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Try active translation first
    if (activeTranslation) {
      const translated = getNestedValue(activeTranslation.translations, key);
      if (translated) {
        return interpolate(translated, params);
      }
    }

    // Fallback to English template
    const englishValue = getNestedValue(enTemplate.translations, key);
    if (englishValue) {
      return interpolate(englishValue, params);
    }

    // Final fallback: return the key itself
    return key;
  };

  // Helper to get translated prayer name
  const getPrayerName = (prayer: string): string => {
    const prayerKey = prayer.toLowerCase();
    return t(`prayers.${prayerKey}`);
  };

  // Initialize translation function for timeUtils
  useEffect(() => {
    setTranslationFunction(t);
  }, [t, activeTranslation]);

  const setActiveTranslation = (id: string | null) => {
    setState(prev => ({ ...prev, activeTranslationId: id }));
  };

  const importTranslation = (translation: any): { success: boolean; error?: string; id?: string } => {
    try {
      // Validate structure
      if (!translation.meta || !translation.translations) {
        return { success: false, error: 'Invalid file structure' };
      }

      if (!translation.meta.languageName || !translation.meta.direction) {
        return { success: false, error: 'Missing required meta fields' };
      }

      // Check if direction is valid
      if (!['ltr', 'rtl'].includes(translation.meta.direction)) {
        return { success: false, error: 'Invalid direction. Must be "ltr" or "rtl"' };
      }

      // Generate unique ID
      const id = `${translation.meta.languageCode}-${Date.now()}`;

      const newTranslation: StoredTranslation = {
        ...translation,
        id,
        importedAt: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [id]: newTranslation
        }
      }));

      return { success: true, id };
    } catch (error) {
      return { success: false, error: 'Failed to parse translation file' };
    }
  };

  const deleteTranslation = (id: string) => {
    setState(prev => {
      const newTranslations = { ...prev.translations };
      const translationToDelete = newTranslations[id];

      // Clear font cache if exists
      if (translationToDelete?.meta.font) {
        fontService.clearFontCache(translationToDelete.meta.font.url).catch(err => {
          console.error('Failed to clear font cache:', err);
        });
      }

      delete newTranslations[id];

      return {
        ...prev,
        translations: newTranslations,
        activeTranslationId: prev.activeTranslationId === id ? null : prev.activeTranslationId
      };
    });
  };

  return (
    <TranslationContext.Provider
      value={{
        t,
        getPrayerName,
        activeTranslation,
        setActiveTranslation,
        importedTranslations: state.translations,
        importTranslation,
        deleteTranslation,
        direction
      }}
    >
      <div dir={direction}>
        {children}
      </div>
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
