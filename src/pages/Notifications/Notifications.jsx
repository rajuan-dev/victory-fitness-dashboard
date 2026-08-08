import { useEffect, useMemo, useState } from "react";
import { ConfigProvider, List, Button, Spin, Pagination } from "antd";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  listAdminNotifications,
  markAllAdminNotificationsRead,
  updateAdminNotification,
  sendTestPushNotification,
} from "../../../services/admin-content.service";

function timeAgo(dateString) {
  const timestamp = new Date(dateString).getTime();
  if (!Number.isFinite(timestamp)) return "Not available";

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 28) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 28);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [allNotifications, setAllNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await listAdminNotifications();
        if (isMounted) {
          const items = Array.isArray(response?.items) ? response.items : [];
          setAllNotifications(items);
          window.dispatchEvent(new CustomEvent("admin-notifications-updated", { detail: items }));
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  const notifications = useMemo(
    () => allNotifications.filter((item) => !item?.read),
    [allNotifications],
  );
  const total = notifications.length;
  const pagedNotifications = notifications.slice((page - 1) * limit, page * limit);

  const markRead = async (id) => {
    try {
      const updated = await updateAdminNotification(id, { read: true });
      setAllNotifications((prev) => {
        const items = prev.map((n) => n.id === id ? updated : n);
        window.dispatchEvent(new CustomEvent("admin-notifications-updated", { detail: items }));
        return items;
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      const response = await markAllAdminNotificationsRead();
      const items = Array.isArray(response?.items) ? response.items : [];
      setAllNotifications(items);
      window.dispatchEvent(new CustomEvent("admin-notifications-updated", { detail: items }));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const sendTestNotification = async () => {
    if (!testEmail.trim()) {
      setTestResult({ type: "error", text: "Enter the app user email first." });
      return;
    }
    setTestSending(true);
    setTestResult(null);
    try {
      const response = await sendTestPushNotification(testEmail.trim());
      setTestResult({
        type: "success",
        text: `Notification ${response?.status || "processed"}. Registered devices: ${response?.registeredDevices ?? 0}.`,
      });
    } catch (err) {
      setTestResult({ type: "error", text: err.message || "Could not send test notification." });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="p-5 min-h-screen">
      <div className="bg-blue-600 px-4 md:px-5 py-3 rounded-md mb-3 flex flex-wrap md:flex-nowrap items-start md:items-center gap-2 md:gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:opacity-90 transition"
          aria-label="Go back"
        >
          <IoChevronBack className="w-6 h-6" />
        </button>
        <h1 className="text-white text-xl sm:text-2xl font-bold">
          Notifications
        </h1>
        {notifications.length > 0 && (
          <div className="ml-0 md:ml-auto w-full md:w-auto flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0">
            <Button onClick={markAllRead} size="small">
              Mark all read
            </Button>
          </div>
        )}
      </div>
      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <h2 className="text-base font-semibold text-blue-900">Test app push notification</h2>
        <p className="mt-1 text-sm text-blue-700">Enter a registered app user email. The test will be sent only to that user&apos;s devices.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={testEmail}
            onChange={(event) => setTestEmail(event.target.value)}
            placeholder="app-user@example.com"
            type="email"
            className="min-h-9 flex-1 rounded-md border border-blue-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
          />
          <Button type="primary" loading={testSending} onClick={sendTestNotification}>
            Send test push
          </Button>
        </div>
        {testResult ? <p className={`mt-2 text-sm ${testResult.type === "success" ? "text-green-700" : "text-red-600"}`}>{testResult.text}</p> : null}
      </div>
      <ConfigProvider
        theme={{
          components: {
            List: {
              colorPrimary: "#2563eb",
            },
          },
        }}
      >
        <div className="bg-transparent">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-lg font-medium text-gray-500">No unread notifications</p>
              <p className="text-sm text-gray-400 mt-1">You{"'"}re all caught up!</p>
            </div>
          ) : (
            <>
              <List
                split={false}
                dataSource={pagedNotifications}
                renderItem={(item) => (
                  <div
                    onClick={() => markRead(item?.id)}
                    className="group flex items-start justify-between gap-4 p-4 border border-gray-200 bg-white rounded-lg mb-3 transition hover:shadow-sm cursor-pointer"
                  >
                    {/* Unread Accent Bar */}
                    <div className="w-1 rounded-full self-stretch bg-blue-600" />

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base md:text-lg font-semibold text-blue-600">
                          {item?.title}
                        </h4>
                        <span className="text-xs md:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0">
                          {timeAgo(item?.createdAt)}
                        </span>
                      </div>
                      {item?.message && (
                        <p className="text-gray-600 text-sm mt-1 pr-2">
                          {item?.message}
                        </p>
                      )}
                      <p className="text-[12px] text-blue-600 mt-1">New</p>
                    </div>

                    {/* Actions */}
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="small"
                        type="primary"
                        style={{ background: "#2563eb" }}
                        onClick={() => markRead(item?.id)}
                      >
                        Mark read
                      </Button>
                    </div>
                  </div>
                )}
              />

              {/* Pagination */}
              {total > limit && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    current={page}
                    pageSize={limit}
                    total={total}
                    onChange={(newPage) => setPage(newPage)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </ConfigProvider>
    </div>
  );
}

