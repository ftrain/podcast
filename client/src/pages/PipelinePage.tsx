import { Card, Col, Row, Tag, Typography, Spin, Alert, Select, message, Badge } from "antd";
import { Link } from "react-router-dom";
import { usePipeline } from "@/hooks/useEpisodes";
import { api } from "@/lib/api";
import { STATUS_COLORS } from "@/lib/utils";
import type { Episode, EpisodeStatus } from "@/types";

const STATUSES: EpisodeStatus[] = ["IDEA", "PLANNED", "RECORDING", "EDITING", "PUBLISHED"];

export function PipelinePage() {
  const { pipeline, loading, error, refetch } = usePipeline();

  const handleStatusChange = async (episodeId: string, newStatus: EpisodeStatus) => {
    try {
      await api.patch(`/episodes/${episodeId}`, { status: newStatus });
      message.success("Status updated");
      refetch();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: 100 }} />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div>
      <Typography.Title level={3}>Pipeline</Typography.Title>
      <Row gutter={16}>
        {STATUSES.map((status) => {
          const group = pipeline.find((g) => g.status === status);
          const episodes = group?.episodes ?? [];
          return (
            <Col key={status} xs={24} sm={12} lg={Math.floor(24 / STATUSES.length)} style={{ minWidth: 220 }}>
              <Card
                title={<Badge count={episodes.length} offset={[12, 0]} color={STATUS_COLORS[status]}><span>{status}</span></Badge>}
                size="small"
                style={{ marginBottom: 16, minHeight: 400, background: "#fafafa" }}
              >
                {episodes.map((ep: Episode) => (
                  <Card key={ep.id} size="small" style={{ marginBottom: 8 }} hoverable>
                    <Link to={`/episodes/${ep.id}`}><Typography.Text strong>{ep.title}</Typography.Text></Link>
                    <div style={{ marginTop: 8 }}>
                      {ep.guests?.map((g) => <Tag key={g.id}>{g.guest?.name}</Tag>)}
                    </div>
                    <Select
                      size="small"
                      value={ep.status}
                      onChange={(v) => handleStatusChange(ep.id, v)}
                      style={{ width: "100%", marginTop: 8 }}
                      options={STATUSES.map((s) => ({ value: s, label: s }))}
                    />
                  </Card>
                ))}
                {episodes.length === 0 && <Typography.Text type="secondary">No episodes</Typography.Text>}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
