
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from './use-local-storage';
import { useEffect } from 'react';

type Language = 'en' | 'pt';

export function useLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguageStorage] = useLocalStorage<Language>('app-language', 'en');

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const changeLanguage = (lang: Language) => {
    setLanguageStorage(lang);
  };

  return {
    currentLanguage: language,
    changeLanguage,
    languages: [
      { code: 'en', name: 'English' },
      { code: 'pt', name: 'Português' }
    ] as const
  };
}
