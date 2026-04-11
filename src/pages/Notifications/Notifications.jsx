import { useState } from "react";
import { ConfigProvider, List, Button, Spin, Pagination } from "antd";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { globalDemoData } from "../../utils/demoData";

function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now - past) / 1000);
  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s);
    if (count >= 1) return `${count}${label} ago`;
  }
  return "Just now";
}

export default function Notifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [allNotifications, setAllNotifications] = useState(globalDemoData.notifications);
  const isLoading = false;
  
  const total = allNotifications.length;

  // Only show unread notifications
  const notifications = allNotifications.filter((item) => !item?.read);

  const markRead = async (id) => {
    try {
      setAllNotifications(allNotifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      setAllNotifications(allNotifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
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
      <ConfigProvider
        theme={{
          components: {
            List: {
              colorPrimary: "blue-600",
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
                dataSource={notifications}
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
                        style={{ background: "blue-600" }}
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

