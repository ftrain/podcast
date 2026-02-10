import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  FundProjectionScreenOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/guests", icon: <TeamOutlined />, label: "Guests" },
  { key: "/episodes", icon: <PlayCircleOutlined />, label: "Episodes" },
  { key: "/pipeline", icon: <FundProjectionScreenOutlined />, label: "Pipeline" },
  { key: "/assets", icon: <FolderOpenOutlined />, label: "Assets" },
];

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = menuItems
    .filter((item) => item.key !== "/")
    .find((item) => location.pathname.startsWith(item.key))?.key ?? "/";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="80" theme="dark">
        <div style={{ padding: "16px", textAlign: "center", color: "#fff", fontSize: 18, fontWeight: 700 }}>
          PodManager
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", borderBottom: "1px solid #f0f0f0" }}>
          <h2 style={{ margin: 0, lineHeight: "64px" }}>Podcast Manager</h2>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
