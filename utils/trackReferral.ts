export function trackReferral() {
  const url = new URL(window.location.href);
  const source = url.searchParams.get("utm_source");
  if (source && !sessionStorage.getItem("referral_source")) {
    sessionStorage.setItem("referral_source", source);
  }
}
