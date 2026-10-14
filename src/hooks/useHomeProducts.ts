import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { getPublicThumbnailUrl } from "../api/products.api";
import { useAdminProductsFilter } from "./useAdminProducts";
import type { Product } from "../types/product";

export type HomeProduct = Pick<Product, "id" | "title" | "subtitle" | "region" | "status" | "priceText" | "thumbnailUrl">;

// Home cards never render itinerary, departures or rich description content.
// Keep this cache separate from full product queries; detail pages still fetch full data.
export function useHomeProducts() {
    const { q, region } = useAdminProductsFilter();
    return useQuery<HomeProduct[]>({
        queryKey: ["home-products", { q, region }],
        queryFn: async () => {
            let query = supabase.from("products")
                .select("id,title,subtitle,region,status,price_text,thumbnail_url,thumbnail_path")
                .order("updated_at", { ascending: false })
                .eq("status", "PUBLISHED");
            if (region?.trim() && region.trim() !== "전체") query = query.eq("region", region.trim());
            if (q?.trim()) {
                const safe = q.trim().replaceAll("%", "\\%").replaceAll(",", "\\,");
                query = query.or(`title.ilike.%${safe}%,subtitle.ilike.%${safe}%`);
            }
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []).map(row => ({
                id: row.id, title: row.title ?? "", subtitle: row.subtitle ?? "",
                region: row.region ?? "", status: row.status as Product["status"],
                priceText: row.price_text ?? "",
                thumbnailUrl: getPublicThumbnailUrl((row.thumbnail_path ?? row.thumbnail_url ?? "").trim()),
            }));
        },
    });
}
