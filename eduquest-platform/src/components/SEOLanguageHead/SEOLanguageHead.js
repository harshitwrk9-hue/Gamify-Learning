import { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

const SEOLanguageHead = () => {
  const { currentLanguage, supportedLanguages } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    // Update document language attribute
    document.documentElement.lang = currentLanguage;

    // Remove existing hreflang links
    const existingLinks = document.querySelectorAll('link[hreflang]');
    existingLinks.forEach(link => link.remove());

    // Get current URL without language parameter
    const baseUrl = window.location.origin + location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Remove any existing language parameter
    searchParams.delete('lang');
    const queryString = searchParams.toString();
    const baseUrlWithQuery = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    // Add hreflang links for all supported languages
    Object.keys(supportedLanguages).forEach(langCode => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = langCode;
      
      // Create URL with language parameter
      const langUrl = new URL(baseUrlWithQuery);
      langUrl.searchParams.set('lang', langCode);
      link.href = langUrl.toString();
      
      document.head.appendChild(link);
    });

    // Add x-default hreflang for default language
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = baseUrlWithQuery;
    document.head.appendChild(defaultLink);

    // Update meta tags for language
    let langMeta = document.querySelector('meta[name="language"]');
    if (!langMeta) {
      langMeta = document.createElement('meta');
      langMeta.name = 'language';
      document.head.appendChild(langMeta);
    }
    langMeta.content = currentLanguage;

    // Update Open Graph locale
    let ogLocaleMeta = document.querySelector('meta[property="og:locale"]');
    if (!ogLocaleMeta) {
      ogLocaleMeta = document.createElement('meta');
      ogLocaleMeta.setAttribute('property', 'og:locale');
      document.head.appendChild(ogLocaleMeta);
    }
    
    // Map language codes to proper locale formats
    const localeMap = {
      'en': 'en_US',
      'hi': 'hi_IN',
      'or': 'or_IN'
    };
    
    ogLocaleMeta.content = localeMap[currentLanguage] || 'en_US';

    // Add alternate Open Graph locales
    const existingOgAlternates = document.querySelectorAll('meta[property="og:locale:alternate"]');
    existingOgAlternates.forEach(meta => meta.remove());

    Object.keys(supportedLanguages).forEach(langCode => {
      if (langCode !== currentLanguage) {
        const ogAlternateMeta = document.createElement('meta');
        ogAlternateMeta.setAttribute('property', 'og:locale:alternate');
        ogAlternateMeta.content = localeMap[langCode] || 'en_US';
        document.head.appendChild(ogAlternateMeta);
      }
    });

    // Update page direction for RTL languages (if needed in future)
    const rtlLanguages = ['ar', 'he', 'fa', 'ur']; // Add RTL language codes here
    document.documentElement.dir = rtlLanguages.includes(currentLanguage) ? 'rtl' : 'ltr';

  }, [currentLanguage, location.pathname, location.search, supportedLanguages]);

  // This component doesn't render anything
  return null;
};

export default SEOLanguageHead;