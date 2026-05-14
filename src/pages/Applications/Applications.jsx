import { useEffect, useState } from "react";
import { adminApiRequest } from "../../../services/auth.service";

const STATUS_OPTIONS = ["NEW", "REVIEWING", "APPROVED", "REJECTED"];

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApiRequest("/admin/applications");
      setApplications(Array.isArray(response?.applications) ? response.applications : []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const updateLocalApplication = (applicationId, patch) => {
    setApplications((current) =>
      current.map((item) => (item.id === applicationId ? { ...item, ...patch } : item))
    );
  };

  const handleSave = async (application) => {
    setSavingId(application.id);
    setError("");
    setSuccess("");
    try {
      const response = await adminApiRequest(`/admin/applications/${application.id}`, {
        method: "PATCH",
        body: {
          status: application.status,
          admin_notes: application.admin_notes || "",
        },
      });
      updateLocalApplication(application.id, response);
      setSuccess("Application updated");
    } catch (saveError) {
      setError(saveError.message || "Failed to update application");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="flex flex-col space-y-6 pt-2 h-full text-slate-100 w-full pb-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-white tracking-wide">Coaching Applications</h1>
        <span className="bg-[#243142] border border-[#334155] text-slate-400 text-[11px] font-semibold px-3 py-1 rounded-full">
          {applications.length} submissions
        </span>
      </div>

      {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      {success ? <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div> : null}
      {loading ? <div className="text-sm text-slate-400">Loading applications...</div> : null}

      {!loading && applications.length === 0 ? (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-sm text-slate-300">
          No coaching applications yet.
        </div>
      ) : null}

      <div className="grid gap-4">
        {applications.map((application) => (
          <div key={application.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{application.full_name}</h2>
                  <span className="rounded-full border border-[#334155] bg-[#111827] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                    {application.status}
                  </span>
                </div>
                <div className="text-sm text-slate-400">{application.email}</div>
                <div className="text-sm text-slate-400">{application.phone_number || "No phone provided"}</div>
                <div className="text-xs text-slate-500">
                  Submitted {new Date(application.created_at).toLocaleString()}
                </div>
              </div>

              <div className="w-full lg:w-64 space-y-3">
                <select
                  value={application.status}
                  onChange={(event) => updateLocalApplication(application.id, { status: event.target.value })}
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
                  onClick={() => handleSave(application)}
                  disabled={savingId === application.id}
                  className="w-full bg-teal-400 text-slate-950 font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
                >
                  {savingId === application.id ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-[#334155] bg-[#0f172a] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Goal</div>
                <div className="text-sm text-slate-200">{application.goal}</div>
              </div>
              <div className="rounded-xl border border-[#334155] bg-[#0f172a] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Obstacle</div>
                <div className="text-sm text-slate-200">{application.obstacle}</div>
              </div>
              <div className="rounded-xl border border-[#334155] bg-[#0f172a] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Investment</div>
                <div className="text-sm text-slate-200">{application.investment}</div>
              </div>
              <div className="rounded-xl border border-[#334155] bg-[#0f172a] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Commitment</div>
                <div className="text-sm text-slate-200">{application.commitment}</div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-[#334155] bg-[#0f172a] p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Injury / Medical</div>
              <div className="text-sm text-slate-200">{application.injury}</div>
            </div>

            <div className="mt-3 rounded-xl border border-[#334155] bg-[#0f172a] p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Additional Notes</div>
              <div className="text-sm text-slate-200 whitespace-pre-wrap">
                {application.additional_notes || "No extra notes"}
              </div>
            </div>

            <div className="mt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Admin Notes</div>
              <textarea
                value={application.admin_notes || ""}
                onChange={(event) => updateLocalApplication(application.id, { admin_notes: event.target.value })}
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

export default Applications;
