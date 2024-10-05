import { LANGUAGES, LOCALES, DEFAULT_LANG } from "@/i18n/config";

export function useTranslation(lang: keyof typeof LANGUAGES) {
  return function getTranslation(
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
