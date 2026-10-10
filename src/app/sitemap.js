import { dishes } from "@/lib/dishes";
import { SITE_URL } from "@/lib/site";

export default function sitemap() {
  const pages = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/menu`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const dishPages = dishes.map((dish) => ({
    url: `${SITE_URL}/menu/${dish.id}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...pages, ...dishPages];
}
