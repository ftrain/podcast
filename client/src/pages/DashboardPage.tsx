import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Tag, Typography } from "antd";
import { TeamOutlined, PlayCircleOutlined, FolderOpenOutlined, RocketOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { formatDate, STATUS_COLORS } from "@/lib/utils";
import type { Guest, Episode, Asset, PaginatedResponse, PipelineGroup } from "@/types";

export function DashboardPage() {
  const [stats, setStats] = useState({ guests: 0, episodes: 0, assets: 0, published: 0 });
  const [recentEpisodes, setRecentEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [guests, episodes, assets, pipeline] = await Promise.all([
          api.get<PaginatedResponse<Guest>>("/guests?limit=1"),
          api.get<PaginatedResponse<Episode>>("/episodes?limit=5"),
          api.get<PaginatedResponse<Asset>>("/assets?limit=1"),
          api.get<PipelineGroup[]>("/episodes/pipeline"),
        ]);
        const published = pipeline.find((g) => g.status === "PUBLISHED")?.count ?? 0;
        setStats({ guests: guests.total, episodes: episodes.total, assets: assets.total, published });
        setRecentEpisodes(episodes.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns = [
    { title: "Title", dataIndex: "title", key: "title", render: (text: string, record: Episode) => <Link to={`/episodes/${record.id}`}>{text}</Link> },
    { title: "Status", dataIndex: "status", key: "status", render: (status: string) => <Tag color={STATUS_COLORS[status]}>{status}</Tag> },
    { title: "Guests", key: "guests", render: (_: unknown, record: Episode) => record.guests?.length ?? 0 },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", render: formatDate },
  ];

  return (
    <div>
      <Typography.Title level={3}>Dashboard</Typography.Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}><Card><Statistic title="Guests" value={stats.guests} prefix={<TeamOutlined />} loading={loading} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Episodes" value={stats.episodes} prefix={<PlayCircleOutlined />} loading={loading} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Published" value={stats.published} prefix={<RocketOutlined />} loading={loading} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Assets" value={stats.assets} prefix={<FolderOpenOutlined />} loading={loading} /></Card></Col>
      </Row>
      <Card title="Recent Episodes">
        <Table dataSource={recentEpisodes} columns={columns} rowKey="id" pagination={false} loading={loading} size="small" />
      </Card>
    </div>
  );
}
