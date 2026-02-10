import { useState } from "react";
import { Button, Card, Table, Select, Tag, Space, Upload, Modal, Form, Input, message, Popconfirm, Typography } from "antd";
import { UploadOutlined, DeleteOutlined, DownloadOutlined, InboxOutlined } from "@ant-design/icons";
import { useAssets } from "@/hooks/useAssets";
import { formatDate, formatBytes } from "@/lib/utils";
import type { Asset, AssetCategory } from "@/types";

const CATEGORIES: AssetCategory[] = ["AUDIO", "COVER_ART", "GUEST_PHOTO", "EPISODE_ARTWORK", "OTHER"];

export function AssetsPage() {
  const { data, loading, category, setCategory, page, setPage, uploadAsset, deleteAsset } = useAssets();
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) { message.error("Select a file"); return; }
    setUploading(true);
    try {
      const values = await form.validateFields();
      await uploadAsset(file, { category: values.category || "OTHER", description: values.description });
      message.success("File uploaded");
      setModalOpen(false);
      setFile(null);
      form.resetFields();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { title: "Filename", dataIndex: "filename", key: "filename" },
    { title: "Type", dataIndex: "mimeType", key: "mimeType" },
    { title: "Category", dataIndex: "category", key: "category", render: (c: string) => <Tag>{c}</Tag> },
    { title: "Size", dataIndex: "size", key: "size", render: formatBytes },
    { title: "Episode", key: "episode", render: (_: unknown, r: Asset) => r.episode?.title ?? "—" },
    { title: "Uploaded", dataIndex: "createdAt", key: "createdAt", render: formatDate },
    {
      title: "Actions", key: "actions",
      render: (_: unknown, record: Asset) => (
        <Space>
          <a href={`/api/assets/${record.id}/download`}><Button icon={<DownloadOutlined />} size="small" /></a>
          <Popconfirm title="Delete?" onConfirm={async () => { await deleteAsset(record.id); message.success("Deleted"); }}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Assets</Typography.Title>
        <Button type="primary" icon={<UploadOutlined />} onClick={() => setModalOpen(true)}>Upload</Button>
      </div>
      <Card>
        <Select placeholder="All Categories" allowClear value={category} onChange={(v) => setCategory(v)} style={{ width: 180, marginBottom: 16 }} options={CATEGORIES.map((c) => ({ value: c, label: c.replace("_", " ") }))} />
        <Table dataSource={data?.data} columns={columns} rowKey="id" loading={loading} pagination={{ current: page, total: data?.total, pageSize: 20, onChange: setPage }} />
      </Card>

      <Modal title="Upload Asset" open={modalOpen} onOk={handleUpload} onCancel={() => setModalOpen(false)} okText="Upload" confirmLoading={uploading}>
        <Form form={form} layout="vertical" initialValues={{ category: "OTHER" }}>
          <Upload.Dragger
            beforeUpload={(f) => { setFile(f); return false; }}
            maxCount={1}
            onRemove={() => setFile(null)}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p>Click or drag a file here (MP3, images)</p>
          </Upload.Dragger>
          <Form.Item name="category" label="Category" style={{ marginTop: 16 }}>
            <Select options={CATEGORIES.map((c) => ({ value: c, label: c.replace("_", " ") }))} />
          </Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
