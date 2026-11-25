import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES, 
  LanguageOption,
  translateString,
  triggerGoogleTranslate 
} from '../services/translationService';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  translate: (text: string) => string;
  languageOptions: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'gramverse_selected_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) return saved;
    } catch {
      // fallback
    }
    return 'en';
  });

  const observerRef = useRef<MutationObserver | null>(null);
  const isTranslatingRef = useRef(false);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    triggerGoogleTranslate(lang);
    // Double trigger after short delay to sync Google combo
    setTimeout(() => triggerGoogleTranslate(lang), 400);
    setTimeout(() => triggerGoogleTranslate(lang), 1200);
  };

  const t = (key: string, fallback?: string): string => {
    if (language === 'en') return fallback || key;
    return translateString(fallback || key, language);
  };

  const translate = (text: string): string => {
    return translateString(text, language);
  };

  const currentLanguageOption = 
    SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  // DOM Auto-Translation Engine (Excludes GIS Map)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Trigger Google Translate engine
    triggerGoogleTranslate(language);

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const isExcluded = (node: Node | null): boolean => {
      if (!node) return false;
      const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
      if (!el) return false;
      return !!el.closest('[data-gis-map="true"], .leaflet-container, .notranslate, [translate="no"], script, style, textarea, input, [data-no-translate="true"]');
    };

    const processTextNode = (textNode: Text, currentLang: SupportedLanguage) => {
      if (isExcluded(textNode)) return;
      
      const customNode = textNode as any;
      if (customNode._originalText === undefined) {
        customNode._originalText = textNode.nodeValue || '';
      }

      const original = customNode._originalText;
      if (!original || !original.trim()) return;

      if (currentLang === 'en') {
        if (textNode.nodeValue !== original) {
          textNode.nodeValue = original;
        }
      } else {
        const translated = translateString(original, currentLang);
        if (translated !== textNode.nodeValue) {
          textNode.nodeValue = translated;
        }
      }
    };

    const walkAndTranslate = (root: Node, currentLang: SupportedLanguage) => {
      if (isExcluded(root)) return;

      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            if (isExcluded(node)) return NodeFilter.FILTER_REJECT;
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_SKIP;
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes: Text[] = [];
      let currentNode = walker.nextNode();
      while (currentNode) {
        textNodes.push(currentNode as Text);
        currentNode = walker.nextNode();
      }

      for (const tn of textNodes) {
        processTextNode(tn, currentLang);
      }
    };

    // Execute translation on current DOM
    isTranslatingRef.current = true;
    walkAndTranslate(document.body, language);
    isTranslatingRef.current = false;

    // Set up MutationObserver to translate dynamically rendered elements (tabs, tables, cards)
    const observer = new MutationObserver((mutations) => {
      if (isTranslatingRef.current) return;
      isTranslatingRef.current = true;

      try {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(added => {
              if (added.nodeType === Node.TEXT_NODE) {
                processTextNode(added as Text, language);
              } else if (added.nodeType === Node.ELEMENT_NODE) {
                walkAndTranslate(added, language);
              }
            });
          } else if (mutation.type === 'characterData') {
            const target = mutation.target as Text;
            if (!isExcluded(target)) {
              const customNode = target as any;
              if (customNode._originalText !== target.nodeValue) {
                customNode._originalText = target.nodeValue;
                if (language !== 'en') {
                  const translated = translateString(target.nodeValue || '', language);
                  if (translated !== target.nodeValue) {
                    target.nodeValue = translated;
                  }
                }
              }
            }
          }
        }
      } finally {
        isTranslatingRef.current = false;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translate,
        languageOptions: SUPPORTED_LANGUAGES,
        currentLanguageOption
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
