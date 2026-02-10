import { useState } from "react";
import { Button, Card, Input, Modal, Form, Table, Select, Space, Popconfirm, Tag, message, Typography, DatePicker } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useEpisodes } from "@/hooks/useEpisodes";
import { formatDate, STATUS_COLORS } from "@/lib/utils";
import type { Episode, EpisodeStatus } from "@/types";

const STATUSES: EpisodeStatus[] = ["IDEA", "PLANNED", "RECORDING", "EDITING", "PUBLISHED"];

export function EpisodesPage() {
  const { data, loading, search, setSearch, status, setStatus, page, setPage, createEpisode, updateEpisode, deleteEpisode } = useEpisodes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Episode | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (ep: Episode) => {
    setEditing(ep);
    form.setFieldsValue({ ...ep, scheduledAt: ep.scheduledAt ? dayjs(ep.scheduledAt) : undefined });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, scheduledAt: values.scheduledAt?.toISOString() };
      if (editing) {
        await updateEpisode(editing.id, payload);
        message.success("Episode updated");
      } else {
        await createEpisode(payload);
        message.success("Episode created");
      }
      setModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const columns = [
    { title: "#", dataIndex: "episodeNum", key: "episodeNum", width: 60, render: (v: number | null) => v ?? "—" },
    { title: "Title", dataIndex: "title", key: "title", render: (text: string, record: Episode) => <Link to={`/episodes/${record.id}`}>{text}</Link> },
    { title: "Status", dataIndex: "status", key: "status", render: (s: string) => <Tag color={STATUS_COLORS[s]}>{s}</Tag> },
    { title: "Guests", key: "guests", render: (_: unknown, r: Episode) => r.guests?.length ?? 0 },
    { title: "Scheduled", dataIndex: "scheduledAt", key: "scheduledAt", render: formatDate },
    {
      title: "Actions", key: "actions",
      render: (_: unknown, record: Episode) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this episode?" onConfirm={async () => { await deleteEpisode(record.id); message.success("Deleted"); }} okText="Delete" okButtonProps={{ danger: true }}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Episodes</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Episode</Button>
      </div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 250 }} allowClear />
          <Select placeholder="All Statuses" allowClear value={status} onChange={(v) => setStatus(v)} style={{ width: 150 }} options={STATUSES.map((s) => ({ value: s, label: s }))} />
        </Space>
        <Table dataSource={data?.data} columns={columns} rowKey="id" loading={loading} pagination={{ current: page, total: data?.total, pageSize: 20, onChange: setPage }} />
      </Card>

      <Modal title={editing ? "Edit Episode" : "New Episode"} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} okText={editing ? "Save" : "Create"}>
        <Form form={form} layout="vertical" initialValues={{ status: "IDEA" }}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Title is required" }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="status" label="Status"><Select options={STATUSES.map((s) => ({ value: s, label: s }))} /></Form.Item>
          <Form.Item name="episodeNum" label="Episode #"><Input type="number" /></Form.Item>
          <Form.Item name="scheduledAt" label="Scheduled Date"><DatePicker style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
