import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Descriptions, Spin, Table, Tag, Typography, Space, Button, Alert, Select, message, List } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useEpisode } from "@/hooks/useEpisodes";
import { api } from "@/lib/api";
import { formatDate, formatBytes, STATUS_COLORS } from "@/lib/utils";
import type { Guest, Asset, PaginatedResponse } from "@/types";

export function EpisodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { episode, loading, error, assignGuest, removeGuest, refetch } = useEpisode(id!);
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<string | undefined>();

  useEffect(() => {
    api.get<PaginatedResponse<Guest>>("/guests?limit=100").then((r) => setAllGuests(r.data));
  }, []);

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: 100 }} />;
  if (error) return <Alert type="error" message={error} />;
  if (!episode) return <Alert type="warning" message="Episode not found" />;

  const assignedIds = new Set(episode.guests?.map((g) => g.guestId) ?? []);
  const availableGuests = allGuests.filter((g) => !assignedIds.has(g.id));

  const handleAssign = async () => {
    if (!selectedGuest) return;
    await assignGuest(selectedGuest);
    setSelectedGuest(undefined);
    message.success("Guest assigned");
  };

  const handleRemoveGuest = async (guestId: string) => {
    await removeGuest(guestId);
    message.success("Guest removed");
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Link to="/episodes"><Button icon={<ArrowLeftOutlined />}>Back</Button></Link>
      </Space>
      <Typography.Title level={3}>{episode.title}</Typography.Title>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Status"><Tag color={STATUS_COLORS[episode.status]}>{episode.status}</Tag></Descriptions.Item>
          {episode.episodeNum && <Descriptions.Item label="Episode #">{episode.episodeNum}</Descriptions.Item>}
          <Descriptions.Item label="Scheduled">{formatDate(episode.scheduledAt)}</Descriptions.Item>
          <Descriptions.Item label="Published">{formatDate(episode.publishedAt)}</Descriptions.Item>
          <Descriptions.Item label="Created">{formatDate(episode.createdAt)}</Descriptions.Item>
        </Descriptions>
        {episode.description && <div style={{ marginTop: 16 }}><Typography.Text type="secondary">Description</Typography.Text><p>{episode.description}</p></div>}
        {episode.notes && <div style={{ marginTop: 8 }}><Typography.Text type="secondary">Notes</Typography.Text><p>{episode.notes}</p></div>}
      </Card>

      <Card title="Guests" style={{ marginBottom: 24 }} extra={
        <Space>
          <Select placeholder="Select guest" value={selectedGuest} onChange={setSelectedGuest} style={{ width: 200 }} options={availableGuests.map((g) => ({ value: g.id, label: g.name }))} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAssign} disabled={!selectedGuest} size="small">Assign</Button>
        </Space>
      }>
        <List
          dataSource={episode.guests}
          renderItem={(eg) => (
            <List.Item actions={[<Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleRemoveGuest(eg.guestId)} />]}>
              <List.Item.Meta title={<Link to={`/guests/${eg.guest?.id}`}>{eg.guest?.name}</Link>} description={<Tag>{eg.role}</Tag>} />
            </List.Item>
          )}
          locale={{ emptyText: "No guests assigned" }}
        />
      </Card>

      <Card title="Assets">
        <Table
          dataSource={episode.assets}
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            { title: "Filename", dataIndex: "filename", key: "filename" },
            { title: "Type", dataIndex: "category", key: "category", render: (c: string) => <Tag>{c}</Tag> },
            { title: "Size", dataIndex: "size", key: "size", render: formatBytes },
            { title: "Uploaded", dataIndex: "createdAt", key: "createdAt", render: formatDate },
            { title: "", key: "download", render: (_: unknown, r: Asset) => <a href={`/api/assets/${r.id}/download`}>Download</a> },
          ]}
          locale={{ emptyText: "No assets linked" }}
        />
      </Card>
    </div>
  );
}
