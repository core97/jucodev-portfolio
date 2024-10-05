export function useNavigation() {
  const redirect = (urlToRedirect: string) => {
    window.location.href = urlToRedirect;
  };

  return { redirect };
}
