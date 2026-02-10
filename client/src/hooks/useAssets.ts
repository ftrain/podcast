import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Asset, AssetCategory, PaginatedResponse } from "@/types";

export function useAssets(initialCategory?: AssetCategory) {
  const [data, setData] = useState<PaginatedResponse<Asset> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<AssetCategory | undefined>(initialCategory);
  const [page, setPage] = useState(1);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (category) params.set("category", category);
      const result = await api.get<PaginatedResponse<Asset>>(`/assets?${params}`);
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const uploadAsset = async (file: File, metadata: { category: AssetCategory; episodeId?: string; description?: string }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", metadata.category);
    if (metadata.episodeId) formData.append("episodeId", metadata.episodeId);
    if (metadata.description) formData.append("description", metadata.description);
    const asset = await api.upload<Asset>("/assets/upload", formData);
    await fetchAssets();
    return asset;
  };

  const deleteAsset = async (id: string) => {
    await api.delete(`/assets/${id}`);
    await fetchAssets();
  };

  return { data, loading, error, category, setCategory, page, setPage, refetch: fetchAssets, uploadAsset, deleteAsset };
}
