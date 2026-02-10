import { useParams, Link } from "react-router-dom";
import { Card, Descriptions, Spin, Table, Tag, Typography, Space, Button, Alert } from "antd";
import { ArrowLeftOutlined, GlobalOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useGuest } from "@/hooks/useGuests";
import { formatDate, STATUS_COLORS } from "@/lib/utils";
import type { EpisodeGuest } from "@/types";

export function GuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { guest, loading, error } = useGuest(id!);

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: 100 }} />;
  if (error) return <Alert type="error" message={error} />;
  if (!guest) return <Alert type="warning" message="Guest not found" />;

  const columns = [
    { title: "Episode", key: "episode", render: (_: unknown, r: EpisodeGuest) => <Link to={`/episodes/${r.episode?.id}`}>{r.episode?.title}</Link> },
    { title: "Role", dataIndex: "role", key: "role", render: (role: string) => <Tag>{role}</Tag> },
    { title: "Status", key: "status", render: (_: unknown, r: EpisodeGuest) => <Tag color={STATUS_COLORS[r.episode?.status ?? ""]}>{r.episode?.status}</Tag> },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Link to="/guests"><Button icon={<ArrowLeftOutlined />}>Back</Button></Link>
      </Space>
      <Typography.Title level={3}>{guest.name}</Typography.Title>
      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 2 }}>
          {guest.email && <Descriptions.Item label={<><MailOutlined /> Email</>}>{guest.email}</Descriptions.Item>}
          {guest.phone && <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>{guest.phone}</Descriptions.Item>}
          {guest.website && <Descriptions.Item label={<><GlobalOutlined /> Website</>}><a href={guest.website} target="_blank" rel="noreferrer">{guest.website}</a></Descriptions.Item>}
          {guest.twitter && <Descriptions.Item label="Twitter">@{guest.twitter}</Descriptions.Item>}
          {guest.linkedin && <Descriptions.Item label="LinkedIn">{guest.linkedin}</Descriptions.Item>}
          {guest.instagram && <Descriptions.Item label="Instagram">{guest.instagram}</Descriptions.Item>}
          <Descriptions.Item label="Added">{formatDate(guest.createdAt)}</Descriptions.Item>
        </Descriptions>
        {guest.bio && <div style={{ marginTop: 16 }}><Typography.Text type="secondary">Bio</Typography.Text><p>{guest.bio}</p></div>}
        {guest.notes && <div style={{ marginTop: 8 }}><Typography.Text type="secondary">Notes</Typography.Text><p>{guest.notes}</p></div>}
      </Card>

      <Card title={`Appearances (${guest.appearances?.length ?? 0})`}>
        <Table dataSource={guest.appearances} columns={columns} rowKey="id" pagination={false} size="small" />
      </Card>
    </div>
  );
}
