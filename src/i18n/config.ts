import en from "./locales/en.json";
import es from "./locales/es.json";

export enum LANGUAGES {
  en = "en",
  es = "es",
}

export const DEFAULT_LANG = LANGUAGES.en;

export const LOCALES = {
  [LANGUAGES.en]: en,
  [LANGUAGES.es]: es,
};
