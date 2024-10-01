import en from "./locales/en.json";
import es from "./locales/es.json";

export enum LANGUAGES {
  en = "en",
  es = "es",
}

const DEFAULT_LANG = LANGUAGES.en;

const LOCALES = {
  [LANGUAGES.en]: en,
  [LANGUAGES.es]: es,
};

export function getLangFromUrl(url: URL): LANGUAGES {
  const [, lang] = url.pathname.split("/");

  if ((Object.values(LANGUAGES) as string[]).includes(lang)) {
    return lang as LANGUAGES;
  }

  return DEFAULT_LANG;
}

export function useTranslation(lang: keyof typeof LANGUAGES) {
  return function t(
    key: keyof (typeof LOCALES)[typeof lang],
    valuesToReplace?: Record<string, string | number>
  ) {
    let text = LOCALES[lang][key] || LOCALES[DEFAULT_LANG][key];

    if (valuesToReplace) {
      Object.entries(valuesToReplace).forEach(([key, value]) => {
        text = text.replaceAll(`{{${key}}}`, value.toString());
      });
    }

    return text;
  };
}
