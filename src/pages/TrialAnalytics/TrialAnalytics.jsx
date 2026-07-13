import { Card, Col, Row, Statistic, Table, Tag, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { FiActivity, FiCreditCard, FiRefreshCw, FiTrendingUp, FiUserCheck, FiUsers } from "react-icons/fi";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAdminTrialConversion } from "../../../services/admin-content.service";

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "-";

export default function TrialAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await getAdminTrialConversion()); }
    catch (error) { message.error(error.message || "Failed to load trial analytics"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cards = [
    ["Total users", data?.totalUsers || 0, FiUsers],
    ["Total subscriptions", data?.totalSubscriptions || 0, FiCreditCard],
    ["Trial users", data?.trialUsers || 0, FiActivity],
    ["Active trials", data?.activeTrials || 0, FiUserCheck],
    ["Continued after trial", data?.continuedAfterTrial || 0, FiTrendingUp],
    ["Conversion rate", `${data?.conversionRate || 0}%`, FiTrendingUp],
  ];

  const columns = [
    { title: "User", key: "user", render: (_, row) => <div><div className="font-semibold text-slate-800">{row.fullName}</div><div className="text-xs text-slate-500">{row.email}</div></div> },
    { title: "Trial started", dataIndex: "trialStartedAt", key: "trialStartedAt", render: formatDate },
    { title: "Trial ends", dataIndex: "trialEndsAt", key: "trialEndsAt", render: formatDate },
    { title: "Outcome", dataIndex: "status", key: "status", render: (value) => <Tag color={value === "CONTINUED_AFTER_TRIAL" ? "green" : value === "ACTIVE_TRIAL" ? "blue" : "red"}>{value.replaceAll("_", " ")}</Tag> },
    { title: "Tier", dataIndex: "subscriptionTier", key: "subscriptionTier" },
    { title: "Subscription", dataIndex: "subscriptionStatus", key: "subscriptionStatus" },
  ];

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-800">Trial & Subscription Analytics</h1><p className="text-sm text-slate-500">Compare user growth, five-day trial activity, and paid continuation.</p></div><button className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200" onClick={() => void load()}><FiRefreshCw /> Refresh</button></div>
    <Row gutter={[16, 16]}>{cards.map(([title, value, Icon]) => <Col xs={12} sm={8} lg={4} key={title}><Card bordered={false} className="h-full shadow-sm"><Statistic title={title} value={value} prefix={<Icon />} /></Card></Col>)}</Row>
    <Card title="Trial and subscription comparison" bordered={false} className="shadow-sm"><div className="h-[320px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data?.chart || []} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="users" name="Users" fill="#2563eb" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
    <Card title="Detailed trial users" bordered={false} className="shadow-sm"><Table rowKey="id" loading={loading} columns={columns} dataSource={data?.users || []} pagination={{ pageSize: 12 }} scroll={{ x: 850 }} /></Card>
  </div>;
}
