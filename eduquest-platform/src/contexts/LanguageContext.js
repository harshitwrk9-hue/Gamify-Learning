import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Language Context
const LanguageContext = createContext();

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳'
  },
  or: {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    flag: '🇮🇳'
  }
};

// Default language
const DEFAULT_LANGUAGE = 'en';

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadedLanguages, setLoadedLanguages] = useState(new Set());

  // Load translations for a specific language
  const loadTranslations = async (languageCode) => {
    if (loadedLanguages.has(languageCode)) {
      return translations[languageCode];
    }

    setIsLoading(true);
    try {
      // Check cache first for better performance
      const cacheKey = `vidhyasaathi_translations_${languageCode}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const cachedTranslations = JSON.parse(cached);
          // Validate cached data structure
          if (cachedTranslations && typeof cachedTranslations === 'object') {
            setTranslations(prev => ({
              ...prev,
              [languageCode]: cachedTranslations
            }));
            setLoadedLanguages(prev => new Set([...prev, languageCode]));
            setIsLoading(false);
            return cachedTranslations;
          }
        } catch (cacheError) {
          console.warn(`Invalid cached translations for ${languageCode}:`, cacheError);
          localStorage.removeItem(cacheKey);
        }
      }
      
      // Dynamic import for lazy loading
      const translationModule = await import(`../translations/${languageCode}.js`);
      const languageTranslations = translationModule.default;
      
      if (!languageTranslations || typeof languageTranslations !== 'object') {
        throw new Error(`Invalid translation file format for ${languageCode}`);
      }
      
      setTranslations(prev => ({
        ...prev,
        [languageCode]: languageTranslations
      }));
      
      setLoadedLanguages(prev => new Set([...prev, languageCode]));
      
      // Cache in localStorage for performance with error handling
      try {
        localStorage.setItem(cacheKey, JSON.stringify(languageTranslations));
      } catch (storageError) {
        console.warn(`Failed to cache translations for ${languageCode}:`, storageError);
      }
      
      return languageTranslations;
    } catch (error) {
      console.error(`Failed to load translations for ${languageCode}:`, error);
      
      // Enhanced fallback logic
      if (languageCode !== DEFAULT_LANGUAGE) {
        console.warn(`Falling back to ${DEFAULT_LANGUAGE} translations`);
        return await loadTranslations(DEFAULT_LANGUAGE);
      }
      
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  // Change language function
  const changeLanguage = async (languageCode) => {
    if (!SUPPORTED_LANGUAGES[languageCode]) {
      console.warn(`Language ${languageCode} is not supported`);
      return;
    }

    try {
      setCurrentLanguage(languageCode);
      localStorage.setItem('vidhyasaathi_language', languageCode);
      
      // Load translations if not already loaded
      await loadTranslations(languageCode);
      
      // Update document language attribute for SEO
      document.documentElement.lang = languageCode;
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: languageCode } 
      }));
      
    } catch (error) {
      console.error(`Failed to change language to ${languageCode}:`, error);
    }
  };

  // Translation function
  const t = (key, params = {}) => {
    const currentTranslations = translations[currentLanguage] || {};
    let translation = key.split('.').reduce((obj, k) => obj?.[k], currentTranslations);
    
    // Fallback to English if translation not found
    if (!translation && currentLanguage !== 'en') {
      const englishTranslations = translations['en'] || {};
      translation = key.split('.').reduce((obj, k) => obj?.[k], englishTranslations);
    }
    
    // Fallback to key if no translation found
    if (!translation) {
      translation = key;
    }
    
    // Replace parameters in translation
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return translation;
  };

  // Detect browser language with better fallback logic
  const detectBrowserLanguage = () => {
    const browserLanguages = navigator.languages || [navigator.language];
    
    for (const lang of browserLanguages) {
      const langCode = lang.split('-')[0].toLowerCase();
      if (SUPPORTED_LANGUAGES[langCode]) {
        return langCode;
      }
    }
    
    return DEFAULT_LANGUAGE;
  };

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Check for saved language preference
        const savedLanguage = localStorage.getItem('vidhyasaathi_language');
        
        // Validate saved language
        const isValidSavedLanguage = savedLanguage && SUPPORTED_LANGUAGES[savedLanguage];
        
        // Detect browser language as fallback
        const browserLanguage = detectBrowserLanguage();
        
        const initialLanguage = isValidSavedLanguage ? savedLanguage : browserLanguage;
        
        setCurrentLanguage(initialLanguage);
        
        // Load initial translations
        await loadTranslations(initialLanguage);
        
        // Preload English as fallback if not already loaded
        if (initialLanguage !== 'en') {
          await loadTranslations('en');
        }
        
        // Set document language attribute for SEO
        document.documentElement.lang = initialLanguage;
        
      } catch (error) {
        console.error('Failed to initialize language:', error);
        // Fallback to default language
        setCurrentLanguage(DEFAULT_LANGUAGE);
        await loadTranslations(DEFAULT_LANGUAGE);
        document.documentElement.lang = DEFAULT_LANGUAGE;
      }
    };

    initializeLanguage();
  }, []);

  const contextValue = {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    t,
    isLoading,
    loadedLanguages: Array.from(loadedLanguages)
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;