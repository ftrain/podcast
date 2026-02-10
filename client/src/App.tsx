import { Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { GuestsPage } from "@/pages/GuestsPage";
import { GuestDetailPage } from "@/pages/GuestDetailPage";
import { EpisodesPage } from "@/pages/EpisodesPage";
import { EpisodeDetailPage } from "@/pages/EpisodeDetailPage";
import { PipelinePage } from "@/pages/PipelinePage";
import { AssetsPage } from "@/pages/AssetsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#6366f1",
          borderRadius: 6,
        },
      }}
    >
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="guests/:id" element={<GuestDetailPage />} />
          <Route path="episodes" element={<EpisodesPage />} />
          <Route path="episodes/:id" element={<EpisodeDetailPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

export default App;
