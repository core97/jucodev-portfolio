import { LANGUAGES } from "@/i18n/config";

export function getIntlLongDate(date: Date, locale: LANGUAGES) {
  let formatedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  if (locale === LANGUAGES.es) {
    formatedDate = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  return formatedDate;
}
