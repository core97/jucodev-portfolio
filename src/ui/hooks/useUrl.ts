import { LANGUAGES, DEFAULT_LANG } from "@/i18n/config";

function getLangFromUrl(url: URL): LANGUAGES {
  const [, lang] = url.pathname.split("/");

  if ((Object.values(LANGUAGES) as string[]).includes(lang)) {
    return lang as LANGUAGES;
  }

  return DEFAULT_LANG;
}

function getRelativeUrlByLang(url: URL, newLang: LANGUAGES) {
  const currentLang = getLangFromUrl(url);
  let relativeUrl = url.pathname + url.search + url.hash;

  if (currentLang === DEFAULT_LANG) {
    relativeUrl =
      newLang === DEFAULT_LANG ? relativeUrl : `/${newLang}${relativeUrl}`;
  } else {
    relativeUrl =
      newLang === DEFAULT_LANG
        ? relativeUrl.replace(`/${currentLang}`, "")
        : relativeUrl.replace(`/${currentLang}`, `/${newLang}`);
  }

  return relativeUrl;
}

function getUrlFromClient() {
  const currentUrl = window.location.href;
  return new URL(currentUrl);
}

export function useUrl() {
  return { getLangFromUrl, getRelativeUrlByLang, getUrlFromClient };
}
