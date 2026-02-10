import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  // Route-aware mock: return appropriate shapes per endpoint
  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/episodes/pipeline")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [],
      });
    }
    // Default paginated response for guests, episodes, assets, etc.
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
    });
  });
});

describe("App", () => {
  it("renders the app shell with navigation", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("PodManager")).toBeInTheDocument();

    // Navigation items may also appear in page content (stat titles, table headers),
    // so query within the sidebar menu specifically.
    const nav = screen.getByRole("menu");
    expect(within(nav).getByText("Dashboard")).toBeInTheDocument();
    expect(within(nav).getByText("Guests")).toBeInTheDocument();
    expect(within(nav).getByText("Episodes")).toBeInTheDocument();
    expect(within(nav).getByText("Pipeline")).toBeInTheDocument();
    expect(within(nav).getByText("Assets")).toBeInTheDocument();
  });

  it("renders 404 page for unknown routes", () => {
    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });
});
