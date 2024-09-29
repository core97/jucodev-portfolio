import en from "./locales/en.json";
import es from "./locales/en.json";

enum LANGUAGES {
  en = "en",
  es = "es",
}

const LOCALES = {
  [LANGUAGES.en]: en,
  [LANGUAGES.es]: es,
};

const DEFAULT_LANG = LANGUAGES.en;

export function getLangFromUrl(url: URL): LANGUAGES {
  const [, lang] = url.pathname.split("/");

  if ((Object.values(LANGUAGES) as string[]).includes(lang)) {
    return lang as LANGUAGES;
  }

  return DEFAULT_LANG;
}

export function useTranslation(lang: keyof typeof LANGUAGES) {
  return function t(key: keyof (typeof LOCALES)[typeof lang]) {
    return LOCALES[lang][key] || LOCALES[DEFAULT_LANG][key];
  };
}
