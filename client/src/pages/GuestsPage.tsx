import { useState } from "react";
import { Button, Card, Input, Modal, Form, Table, Space, Popconfirm, message, Typography } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useGuests } from "@/hooks/useGuests";
import { formatDate } from "@/lib/utils";
import type { Guest } from "@/types";

export function GuestsPage() {
  const { data, loading, search, setSearch, page, setPage, createGuest, updateGuest, deleteGuest } = useGuests();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (guest: Guest) => { setEditing(guest); form.setFieldsValue(guest); setModalOpen(true); };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateGuest(editing.id, values);
        message.success("Guest updated");
      } else {
        await createGuest(values);
        message.success("Guest created");
      }
      setModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteGuest(id);
    message.success("Guest deleted");
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", render: (text: string, record: Guest) => <Link to={`/guests/${record.id}`}>{text}</Link> },
    { title: "Email", dataIndex: "email", key: "email", render: (v: string | null) => v || "—" },
    { title: "Episodes", key: "episodes", render: (_: unknown, record: Guest) => record._count?.appearances ?? 0 },
    { title: "Added", dataIndex: "createdAt", key: "createdAt", render: formatDate },
    {
      title: "Actions", key: "actions",
      render: (_: unknown, record: Guest) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this guest?" onConfirm={() => handleDelete(record.id)} okText="Delete" okButtonProps={{ danger: true }}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Guests</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Guest</Button>
      </div>
      <Card>
        <Input prefix={<SearchOutlined />} placeholder="Search guests..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 16, maxWidth: 300 }} allowClear />
        <Table
          dataSource={data?.data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ current: page, total: data?.total, pageSize: 20, onChange: setPage }}
        />
      </Card>

      <Modal title={editing ? "Edit Guest" : "Add Guest"} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} okText={editing ? "Save" : "Create"}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email"><Input type="email" /></Form.Item>
          <Form.Item name="bio" label="Bio"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="website" label="Website"><Input /></Form.Item>
          <Form.Item name="twitter" label="Twitter"><Input /></Form.Item>
          <Form.Item name="linkedin" label="LinkedIn"><Input /></Form.Item>
          <Form.Item name="instagram" label="Instagram"><Input /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
