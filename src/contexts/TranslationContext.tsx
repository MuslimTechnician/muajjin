import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { TranslationState, TranslationStrings, StoredTranslation } from '@/types/translation';
import enTemplate from '@/i18n/template-en.json';
import { setTranslationFunction } from '@/utils/timeUtils';
import { toast } from '@/components/ui/use-toast';

const TRANSLATION_STORAGE_KEY = 'muajjin-translations';
const ACTIVE_TRANSLATION_KEY = 'muajjin-active-translation';
const CUSTOM_FONT_KEY = 'muajjin-custom-font';
const FONT_FAMILY_NAME = 'MuajjinCustomFont';

// Built-in translations (ships with the app)
const BUILTIN_TRANSLATIONS: Record<string, StoredTranslation> = {
  en: {
    ...enTemplate,
    id: 'en',
    importedAt: new Date().toISOString(),
  },
};

interface StoredFont {
  name: string;
  data: string; // base64
  timestamp: number;
}

interface TranslationContextType {
  t: (key: string, params?: Record<string, string | number>) => string;
  getSalatName: (salat: string) => string;
  activeTranslation: StoredTranslation | null;
  setActiveTranslation: (id: string | null) => void;
  importedTranslations: Record<string, StoredTranslation>;
  importTranslation: (translation: any) => { success: boolean; error?: string; id?: string };
  deleteTranslation: (id: string) => void;
  direction: 'ltr' | 'rtl';
  mounted: boolean;
  uploadFont: (file: File) => Promise<boolean>;
  removeFont: () => void;
  customFont: StoredFont | null;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

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
    const value = params[key];
    if (value === undefined || value === null) {
      return match;
    }
    return String(value);
  });
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TranslationState>({
    activeTranslationId: null,
    translations: {}
  });
  const [mounted, setMounted] = useState(false);
  const [customFont, setCustomFont] = useState<StoredFont | null>(null);

  // Load translations and font from localStorage on mount
  useEffect(() => {
    try {
      const storedTranslations = localStorage.getItem(TRANSLATION_STORAGE_KEY);
      const activeId = localStorage.getItem(ACTIVE_TRANSLATION_KEY);
      const storedFont = localStorage.getItem(CUSTOM_FONT_KEY);

      setState({
        activeTranslationId: activeId || null,
        translations: storedTranslations ? JSON.parse(storedTranslations) : {}
      });

      if (storedFont) {
        const fontData = JSON.parse(storedFont) as StoredFont;
        setCustomFont(fontData);
        // Font will be applied after mounted is true (see useEffect below)
      }
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

  // Get active translation (check both built-in and user-imported)
  const activeTranslation = state.activeTranslationId
    ? (state.translations[state.activeTranslationId] || BUILTIN_TRANSLATIONS[state.activeTranslationId])
    : null;

  const direction = activeTranslation?.meta.direction || 'ltr';

  // Translation function
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translated: string | undefined;

    // Try active translation first
    if (activeTranslation) {
      translated = getNestedValue(activeTranslation.translations, key);
    }

    // Fallback to English template
    if (!translated) {
      translated = getNestedValue(enTemplate.translations, key);
    }

    // If still no translation, return key itself
    if (!translated) {
      return key;
    }

    // Interpolate params
    return interpolate(translated, params);
  }, [activeTranslation]);

  // Helper to get translated salat name
  const getSalatName = (salat: string): string => {
    const salatKey = salat.toLowerCase();
    return t(`salats.${salatKey}`);
  };

  // Initialize translation function for timeUtils
  useEffect(() => {
    setTranslationFunction(t);
  }, [t]);

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
      delete newTranslations[id];

      return {
        ...prev,
        translations: newTranslations,
        activeTranslationId: prev.activeTranslationId === id ? null : prev.activeTranslationId
      };
    });
  };

  // Apply font to document
  const applyFont = useCallback(async (font: StoredFont) => {
    try {
      const fontFace = new FontFace(FONT_FAMILY_NAME, `url(${font.data})`);
      const loadedFont = await fontFace.load();

      // Add to document fonts
      document.fonts.add(loadedFont);

      // Apply to root element
      document.documentElement.style.fontFamily = `'${FONT_FAMILY_NAME}', system-ui, -apple-system, sans-serif`;

      console.log('Custom font applied:', font.name);
    } catch (error) {
      console.error('Failed to apply font:', error);
      throw error;
    }
  }, []);

  // Apply font after mounted and when customFont changes
  useEffect(() => {
    if (mounted && customFont) {
      applyFont(customFont);
    }
  }, [mounted, customFont, applyFont]);

  // Remove custom font
  const removeFont = useCallback(() => {
    try {
      // Remove all font faces with our custom font family from document
      for (const fontFace of document.fonts) {
        if (fontFace.family === FONT_FAMILY_NAME) {
          document.fonts.delete(fontFace);
        }
      }

      // Reset document font family to default
      document.documentElement.style.fontFamily = '';

      // Clear from localStorage
      localStorage.removeItem(CUSTOM_FONT_KEY);

      // Update state
      setCustomFont(null);

      toast({
        title: t('settings.fontRemoved'),
        description: t('settings.fontRemovedDesc'),
      });
    } catch (error) {
      console.error('Failed to remove font:', error);
    }
  }, [t]);

  // Upload and set custom font
  const uploadFont = useCallback(async (file: File): Promise<boolean> => {
    try {
      // Validate file name must be exactly "customfont.woff2"
      if (file.name !== 'customfont.woff2') {
        throw new Error('Font file must be named exactly "customfont.woff2"');
      }

      // Validate file type
      if (!file.name.endsWith('.woff2')) {
        throw new Error('Invalid font file. Only .woff2 files are supported.');
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Font file too large. Maximum size is 5MB.');
      }

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;

      // Remove previous font
      removeFont();

      // Create new font data
      const fontData: StoredFont = {
        name: file.name,
        data: base64,
        timestamp: Date.now()
      };

      // Store in localStorage
      localStorage.setItem(CUSTOM_FONT_KEY, JSON.stringify(fontData));

      setCustomFont(fontData);

      toast({
        title: t('settings.fontUploaded'),
        description: t('settings.fontUploadedDesc'),
      });

      return true;
    } catch (error) {
      console.error('Failed to upload font:', error);
      toast({
        title: t('errors.fontUploadFailed'),
        description: error instanceof Error ? error.message : t('common.unknownError') || 'Unknown error',
        variant: "destructive",
      });
      return false;
    }
  }, [removeFont, t]);

  return (
    <TranslationContext.Provider
      value={{
        t,
        getSalatName,
        activeTranslation,
        setActiveTranslation,
        importedTranslations: state.translations,
        importTranslation,
        deleteTranslation,
        direction,
        mounted,
        uploadFont,
        removeFont,
        customFont
      }}
    >
      {!mounted ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse">Loading...</div>
        </div>
      ) : (
        <div dir={direction}>
          {children}
        </div>
      )}
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
