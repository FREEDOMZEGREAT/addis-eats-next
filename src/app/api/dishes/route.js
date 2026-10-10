import { getDishesByCategory } from "@/lib/dishes";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "All";
  const query = searchParams.get("q") || "";

  return Response.json(await getDishesByCategory(category, query));
}
