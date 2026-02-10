import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Episode, EpisodeStatus, PaginatedResponse, PipelineGroup } from "@/types";

export function useEpisodes(initialStatus?: EpisodeStatus) {
  const [data, setData] = useState<PaginatedResponse<Episode> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EpisodeStatus | undefined>(initialStatus);
  const [page, setPage] = useState(1);

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const result = await api.get<PaginatedResponse<Episode>>(`/episodes?${params}`);
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch episodes");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => { fetchEpisodes(); }, [fetchEpisodes]);

  const createEpisode = async (input: Partial<Episode>) => {
    const episode = await api.post<Episode>("/episodes", input);
    await fetchEpisodes();
    return episode;
  };

  const updateEpisode = async (id: string, input: Partial<Episode>) => {
    const episode = await api.patch<Episode>(`/episodes/${id}`, input);
    await fetchEpisodes();
    return episode;
  };

  const deleteEpisode = async (id: string) => {
    await api.delete(`/episodes/${id}`);
    await fetchEpisodes();
  };

  return { data, loading, error, search, setSearch, status, setStatus, page, setPage, refetch: fetchEpisodes, createEpisode, updateEpisode, deleteEpisode };
}

export function useEpisode(id: string) {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEpisode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<Episode>(`/episodes/${id}`);
      setEpisode(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch episode");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchEpisode(); }, [fetchEpisode]);

  const assignGuest = async (guestId: string, role = "guest") => {
    await api.post(`/episodes/${id}/guests`, { guestId, role });
    await fetchEpisode();
  };

  const removeGuest = async (guestId: string) => {
    await api.delete(`/episodes/${id}/guests/${guestId}`);
    await fetchEpisode();
  };

  return { episode, loading, error, refetch: fetchEpisode, assignGuest, removeGuest };
}

export function usePipeline() {
  const [pipeline, setPipeline] = useState<PipelineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<PipelineGroup[]>("/episodes/pipeline");
      setPipeline(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch pipeline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPipeline(); }, [fetchPipeline]);

  return { pipeline, loading, error, refetch: fetchPipeline };
}
