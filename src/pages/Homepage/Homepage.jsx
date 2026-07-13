import { Button, Card, Col, Form, Input, Row, Space, Switch, Table, Tabs, Upload, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiFilePlus, FiRefreshCw, FiSave, FiUpload } from "react-icons/fi";
import { addAdminHomepageQuote, addAdminHomepageQuotesBulk, listAdminHomepageQuotes, replaceAdminHomepageQuotes } from "../../../services/admin-content.service";

const parseBulk = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    return parsed.map((item) => ({ text: String(item.text || item.quote || "").trim(), author: String(item.author || "").trim(), active: item.active !== false })).filter((item) => item.text && item.author);
  }
  return trimmed.split(/\r?\n/).map((line) => {
    const [text, ...authorParts] = line.split(/\t|,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    return { text: String(text || "").replace(/^"|"$/g, "").trim(), author: authorParts.join(",").replace(/^"|"$/g, "").trim(), active: true };
  }).filter((item) => item.text && item.author && item.text.toLowerCase() !== "text");
};

export default function Homepage() {
  const [quotes, setQuotes] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const quoteResponse = await listAdminHomepageQuotes();
      setQuotes(quoteResponse?.items || []);
    } catch (error) {
      message.error(error.message || "Failed to load homepage data");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const addSingle = async (values) => {
    setSaving(true);
    try { const response = await addAdminHomepageQuote(values); setQuotes(response.items || []); form.resetFields(); message.success("Quote added"); }
    catch (error) { message.error(error.message || "Failed to add quote"); }
    finally { setSaving(false); }
  };

  const importBulk = async () => {
    try {
      const items = parseBulk(bulkText);
      if (!items.length) throw new Error("Add CSV/TSV lines or a JSON array first");
      setSaving(true); const response = await addAdminHomepageQuotesBulk(items); setQuotes(response.items || []); setBulkText(""); message.success(`${items.length} quotes imported`);
    } catch (error) { message.error(error.message || "Invalid bulk quote data"); }
    finally { setSaving(false); }
  };

  const updateActive = async (id, active) => {
    const next = quotes.map((item) => item.id === id ? { ...item, active } : item);
    setQuotes(next);
    try { await replaceAdminHomepageQuotes(next); } catch (error) { message.error(error.message || "Failed to update quote"); void load(); }
  };

  const quoteColumns = useMemo(() => [
    { title: "Quote", dataIndex: "text", key: "text", render: (value) => <span className="font-medium text-slate-700">{value}</span> },
    { title: "Author", dataIndex: "author", key: "author" },
    { title: "Homepage", dataIndex: "active", key: "active", width: 130, render: (active, item) => <Switch checked={active} onChange={(value) => updateActive(item.id, value)} /> },
  ], [quotes]);

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-800">Quotes</h1><p className="text-sm text-slate-500">Manage the quote rotation shown in the app.</p></div><Button icon={<FiRefreshCw />} onClick={() => void load()} loading={loading}>Refresh</Button></div>
    <Tabs items={[{
      key: "quotes", label: "Homepage quotes", children: <Row gutter={[20, 20]}>
        <Col xs={24} lg={9}><Card title="Add one quote" bordered={false} className="shadow-sm"><Form form={form} layout="vertical" onFinish={addSingle} initialValues={{ active: true }}><Form.Item name="text" label="Quote" rules={[{ required: true, message: "Enter a quote" }]}><Input.TextArea rows={4} placeholder="Your only limit is your mind." /></Form.Item><Form.Item name="author" label="Author" rules={[{ required: true, message: "Enter an author" }]}><Input placeholder="Michael Phelps" /></Form.Item><Form.Item name="active" label="Show on homepage" valuePropName="checked"><Switch /></Form.Item><Button type="primary" htmlType="submit" icon={<FiSave />} loading={saving}>Add quote</Button></Form></Card><Card title="Bulk import" bordered={false} className="mt-5 shadow-sm"><p className="mb-3 text-xs text-slate-500">One per line as <code>quote,author</code>, TSV, or JSON: [{`{ "text": "...", "author": "..." }`}]</p><Input.TextArea value={bulkText} onChange={(event) => setBulkText(event.target.value)} rows={7} placeholder={'Keep going, one step at a time., Coach Victor'} /><Space className="mt-3"><Upload accept=".csv,.tsv,.txt,.json" showUploadList={false} beforeUpload={(file) => { const reader = new FileReader(); reader.onload = (event) => setBulkText(String(event.target.result || "")); reader.readAsText(file); return false; }}><Button icon={<FiUpload />}>Load file</Button></Upload><Button type="primary" icon={<FiFilePlus />} onClick={() => void importBulk()} loading={saving}>Import</Button></Space></Card></Col>
        <Col xs={24} lg={15}><Card title={`Quote library (${quotes.length})`} bordered={false} className="shadow-sm"><Table rowKey="id" loading={loading} columns={quoteColumns} dataSource={quotes} pagination={{ pageSize: 8 }} scroll={{ x: 600 }} /></Card></Col>
      </Row>
    }]} />
  </div>;
}
