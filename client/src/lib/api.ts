const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

interface ApiError {
  error: string;
  details?: Array<{ path: string; message: string }>;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body: ApiError = await res
      .json()
      .catch(() => ({ error: res.statusText }));
    throw new Error(body.error);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) =>
    fetch(`${BASE_URL}${path}`, { method: "POST", body: formData }).then(
      async (res) => {
        if (!res.ok) {
          const body = await res
            .json()
            .catch(() => ({ error: res.statusText }));
          throw new Error(body.error);
        }
        return res.json() as Promise<T>;
      }
    ),
};
