import { useEffect, useState } from "react";
import { adminApiRequest } from "../../../services/auth.service";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED"];

const SupportInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApiRequest("/admin/support/messages");
      setMessages(Array.isArray(response?.messages) ? response.messages : []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load support messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateLocalMessage = (messageId, patch) => {
    setMessages((current) =>
      current.map((item) => (item.id === messageId ? { ...item, ...patch } : item))
    );
  };

  const handleSave = async (message) => {
    setSavingId(message.id);
    setError("");
    setSuccess("");
    try {
      const response = await adminApiRequest(`/admin/support/messages/${message.id}`, {
        method: "PATCH",
        body: {
          status: message.status,
          admin_notes: message.admin_notes || "",
        },
      });
      updateLocalMessage(message.id, response);
      setSuccess("Support message updated");
    } catch (saveError) {
      setError(saveError.message || "Failed to update support message");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="flex flex-col space-y-6 pt-2 h-full text-slate-100 w-full pb-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-white tracking-wide">Help &amp; Support Inbox</h1>
        <span className="bg-[#243142] border border-[#334155] text-slate-400 text-[11px] font-semibold px-3 py-1 rounded-full">
          {messages.length} messages
        </span>
      </div>

      {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      {success ? <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div> : null}
      {loading ? <div className="text-sm text-slate-400">Loading support messages...</div> : null}

      {!loading && messages.length === 0 ? (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-sm text-slate-300">
          No support messages yet.
        </div>
      ) : null}

      <div className="grid gap-4">
        {messages.map((message) => (
          <div key={message.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{message.subject}</h2>
                  <span className="rounded-full border border-[#334155] bg-[#111827] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                    {message.status}
                  </span>
                </div>
                <div className="text-sm text-slate-300">{message.user_name}</div>
                <div className="text-sm text-slate-400">{message.user_email}</div>
                <div className="text-xs text-slate-500">
                  Sent {new Date(message.created_at).toLocaleString()}
                </div>
              </div>

              <div className="w-full lg:w-64 space-y-3">
                <select
                  value={message.status}
                  onChange={(event) => updateLocalMessage(message.id, { status: event.target.value })}
                  className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg px-4 py-2.5 outline-none"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleSave(message)}
                  disabled={savingId === message.id}
                  className="w-full bg-teal-400 text-slate-950 font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
                >
                  {savingId === message.id ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#334155] bg-[#0f172a] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">User Message</div>
              <div className="text-sm text-slate-200 whitespace-pre-wrap">{message.message}</div>
            </div>

            <div className="mt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Admin Notes</div>
              <textarea
                value={message.admin_notes || ""}
                onChange={(event) => updateLocalMessage(message.id, { admin_notes: event.target.value })}
                rows={4}
                className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg p-4 outline-none resize-y"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportInbox;
