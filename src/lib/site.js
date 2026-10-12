export const SITE_URL = "https://addis-eats-next-rho.vercel.app";
export const SOCIAL_IMAGE = "/dishes/hero.jpg?v=2";

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
