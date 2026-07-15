import { useEffect, useState } from "react";
import { Alert, Spin, Table, Tag } from "antd";
import { listAdminAuditLogs } from "../../../services/admin-content.service";

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    listAdminAuditLogs({ signal: controller.signal })
      .then((response) => setItems(Array.isArray(response?.items) ? response.items : []))
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(loadError.message || "Unable to load audit logs");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const columns = [
    { title: "Time", dataIndex: "createdAt", render: (value) => value ? new Date(value).toLocaleString() : "—" },
    { title: "Admin", dataIndex: "adminEmail" },
    { title: "Action", dataIndex: "action", render: (value) => <Tag color="blue">{value || "unknown"}</Tag> },
    { title: "Resource", dataIndex: "resource" },
    { title: "Resource ID", dataIndex: "resourceId", ellipsis: true },
  ];

  return (
    <div className="space-y-5 p-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Review important administrative actions and moderation changes.</p>
      </div>
      {error ? <Alert type="error" showIcon message={error} /> : null}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        {loading ? <div className="flex justify-center py-16"><Spin size="large" /></div> : <Table rowKey="id" columns={columns} dataSource={items} pagination={{ pageSize: 20 }} scroll={{ x: 800 }} locale={{ emptyText: "No audit activity yet" }} />}
      </div>
    </div>
  );
}
