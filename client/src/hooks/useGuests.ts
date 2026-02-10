import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Guest, PaginatedResponse } from "@/types";

export function useGuests(initialSearch = "") {
  const [data, setData] = useState<PaginatedResponse<Guest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const result = await api.get<PaginatedResponse<Guest>>(`/guests?${params}`);
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch guests");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  const createGuest = async (input: Partial<Guest>) => {
    const guest = await api.post<Guest>("/guests", input);
    await fetchGuests();
    return guest;
  };

  const updateGuest = async (id: string, input: Partial<Guest>) => {
    const guest = await api.patch<Guest>(`/guests/${id}`, input);
    await fetchGuests();
    return guest;
  };

  const deleteGuest = async (id: string) => {
    await api.delete(`/guests/${id}`);
    await fetchGuests();
  };

  return { data, loading, error, search, setSearch, page, setPage, refetch: fetchGuests, createGuest, updateGuest, deleteGuest };
}

export function useGuest(id: string) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<Guest>(`/guests/${id}`);
      setGuest(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch guest");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchGuest(); }, [fetchGuest]);

  return { guest, loading, error, refetch: fetchGuest };
}
