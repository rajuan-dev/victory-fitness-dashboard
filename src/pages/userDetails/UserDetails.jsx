import { ConfigProvider, Modal, Table, message } from "antd";
import { useEffect, useState } from "react";
import { IoSearch, IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import TotalUsers from "../User Management/TotalUsers";
import { deleteAdminUser, getAdminUser, getUserManagementOverview } from "../../../services/admin-users.service";

function UserTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-lg animate-pulse">
      <div className="grid grid-cols-6 gap-4 bg-blue-600 px-6 py-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-4 rounded bg-blue-400/70" />
        ))}
      </div>
      <div className="space-y-4 px-6 py-5">
        {[...Array(8)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-6 items-center gap-4">
            <div className="h-4 w-8 rounded bg-slate-100" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-100" />
            </div>
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="h-4 w-36 rounded bg-slate-100" />
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="justify-self-end h-4 w-20 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

const DEFAULT_SUMMARY = {
  totalUsers: 0,
  activeUsers: 0,
  pendingUsers: 0,
  userChart: [],
};

function UserDetails() {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersData, setUsersData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [error, setError] = useState("");

  const pageSize = 10;

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadUserManagement = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getUserManagementOverview({
          page: currentPage,
          limit: pageSize,
          query: searchQuery,
          signal: controller.signal,
        });

        if (!isMounted) {
          return;
        }

        setSummary(data.summary || DEFAULT_SUMMARY);
        setUsersData(data.table?.users || []);
        setTotalUsers(data.table?.total || 0);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        const detail = requestError instanceof Error ? requestError.message : "Failed to load user management data";
        setError(detail);
        setSummary(DEFAULT_SUMMARY);
        setUsersData([]);
        setTotalUsers(0);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUserManagement();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [currentPage, searchQuery]);

  const reloadUserManagement = async (page = currentPage) => {
    const data = await getUserManagementOverview({
      page,
      limit: pageSize,
      query: searchQuery,
    });

    setSummary(data.summary || DEFAULT_SUMMARY);
    setUsersData(data.table?.users || []);
    setTotalUsers(data.table?.total || 0);

    return data;
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const showViewModal = async (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
    setIsViewLoading(true);

    try {
      const detail = await getAdminUser(user.id);
      setSelectedUser(detail);
    } catch (requestError) {
      message.error(requestError instanceof Error ? requestError.message : "Failed to load user details");
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const openDelete = (row) => {
    setSelectedUser(row);
    setIsDeleteModalOpen(true);
  };

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const confirmDelete = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAdminUser(selectedUser.id);
      message.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedUser(null);

      const data = await reloadUserManagement(currentPage);
      if ((data.table?.users || []).length === 0 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      }
    } catch (requestError) {
      message.error(requestError instanceof Error ? requestError.message : "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      title: "No",
      key: "no",
      width: 70,
      render: (_, _record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.profileImage || "/userimg.png"}
            className="h-10 w-10 rounded-full object-cover"
            alt="User Avatar"
          />
          <span className="leading-none">{value}</span>
        </div>
      ),
    },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone No", dataIndex: "contactNumber", key: "contactNumber" },
    {
      title: "Joined Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "N/A"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <button onClick={() => showViewModal(record)}>
            <FaRegEye className="h-5 w-5 cursor-pointer rounded-md text-blue-600" />
          </button>
          <button onClick={() => openDelete(record)}>
            <AiOutlineDelete className="h-5 w-5 cursor-pointer rounded-md text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 shadow-lg md:px-6 md:py-5">
        <div className="flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 text-white transition-all duration-200 hover:bg-white/20"
            aria-label="Go back"
          >
            <IoChevronBack className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">User Management</h1>
            <p className="mt-1 text-sm text-white/80">Manage all non-admin users from the backend.</p>
          </div>

          <div className="ml-auto hidden gap-3 md:flex">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search users..."
                className="w-64 rounded-xl bg-white/90 py-2.5 pl-10 pr-4 text-slate-800 backdrop-blur-sm transition-all placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <IoSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        <div className="relative mt-3 w-full md:hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-xl bg-white/90 py-2.5 pl-10 pr-4 text-slate-800 backdrop-blur-sm transition-all placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <IoSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Users</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{totalUsers}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Shown on page</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{usersData.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Search</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {searchQuery.trim() || "All users"}
          </div>
        </div>
      </div>

      <TotalUsers summary={summary} isLoading={isLoading} error={error} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : isLoading ? (
        <UserTableSkeleton />
      ) : (
        <ConfigProvider
          theme={{
            components: {
              Pagination: {
                colorPrimary: "#2563eb",
                colorPrimaryHover: "#1d4ed8",
              },
              Table: {
                headerBg: "#60a5fa",
                headerColor: "#ffffff",
                cellFontSize: 14,
                headerSplitColor: "transparent",
                borderColor: "#e5e7eb",
              },
            },
          }}
        >
          <Table
            dataSource={usersData}
            columns={columns}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize,
              total: totalUsers,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: false,
            }}
            scroll={{ x: "max-content" }}
            className="custom-user-table"
          />
        </ConfigProvider>
      )}

      <Modal
        open={isDeleteModalOpen}
        centered
        onCancel={handleCancel}
        footer={null}
        className="delete-user-modal"
      >
        <div className="flex flex-col items-center justify-center py-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AiOutlineDelete className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mb-3 text-center text-2xl font-bold text-slate-800 md:text-3xl">Delete User</h1>
          <p className="mb-6 px-4 text-center text-base text-slate-600 md:text-lg">
            {selectedUser
              ? `Are you sure you want to delete ${selectedUser.fullName}?`
              : "Are you sure you want to delete this user?"}
          </p>
          <div className="flex w-full justify-center gap-3 px-4">
            <button
              onClick={handleCancel}
              className="max-w-[150px] flex-1 rounded-xl bg-slate-200 px-6 py-3 font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="max-w-[150px] flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isViewModalOpen}
        centered
        onCancel={handleViewCancel}
        footer={null}
        width={800}
        className="user-view-modal"
      >
        {selectedUser && (
          <div className="relative">
            <div className="-m-6 mb-6 rounded-t-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={selectedUser.profileImage || "/userimg.png"}
                    alt={selectedUser.fullName}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-xl"
                  />
                </div>
                <div className="text-white">
                  <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                    {isViewLoading ? "Loading user..." : selectedUser.fullName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
                      {selectedUser.role}
                    </span>
                    <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
                      Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                        selectedUser.status === "ACTIVE"
                          ? "bg-green-400/30 text-green-100"
                          : "bg-red-400/30 text-red-100"
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isViewLoading ? (
              <div className="grid grid-cols-1 gap-4 animate-pulse md:grid-cols-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-slate-100 p-5">
                    <div className="mb-3 h-4 w-20 rounded bg-slate-200" />
                    <div className="h-6 w-full rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
                    <div className="mb-1 text-sm font-medium text-slate-600">Email</div>
                    <div className="text-lg font-semibold text-slate-800">{selectedUser.email}</div>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
                    <div className="mb-1 text-sm font-medium text-slate-600">Phone No</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {selectedUser.contactNumber || "N/A"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
                    <div className="mb-1 text-sm font-medium text-slate-600">Joined Date</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
                    <div className="mb-1 text-sm font-medium text-slate-600">Country</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {selectedUser.country || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-6">
                  <button
                    onClick={handleViewCancel}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default UserDetails;
