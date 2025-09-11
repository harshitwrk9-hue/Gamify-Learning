import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = ({ className = '', showLabel = true }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`language-switcher ${className}`} ref={dropdownRef}>
      {showLabel && (
        <span className="language-switcher__label">
          {t('languageSwitcher.selectLanguage')}
        </span>
      )}
      
      <div className="language-switcher__dropdown">
        <button
          className="language-switcher__trigger"
          onClick={toggleDropdown}
          aria-label={t('languageSwitcher.currentLanguage')}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="language-switcher__flag">{currentLang.flag}</span>
          <span className="language-switcher__name">{currentLang.nativeName}</span>
          <svg 
            className={`language-switcher__arrow ${isOpen ? 'language-switcher__arrow--open' : ''}`}
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M3 4.5L6 7.5L9 4.5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="language-switcher__menu" role="listbox">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`language-switcher__option ${
                  language.code === currentLanguage ? 'language-switcher__option--active' : ''
                }`}
                onClick={() => handleLanguageChange(language.code)}
                role="option"
                aria-selected={language.code === currentLanguage}
              >
                <span className="language-switcher__option-flag">{language.flag}</span>
                <div className="language-switcher__option-text">
                  <span className="language-switcher__option-native">{language.nativeName}</span>
                  <span className="language-switcher__option-english">{language.name}</span>
                </div>
                {language.code === currentLanguage && (
                  <svg 
                    className="language-switcher__check" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M13.5 4.5L6 12L2.5 8.5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSwitcher;