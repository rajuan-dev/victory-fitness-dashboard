import { ConfigProvider, Modal, Table, Spin, message } from "antd";
import { useMemo, useState } from "react";
import { IoSearch, IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { globalDemoData } from "../../utils/demoData";


function AllSubscribers() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersData, setUsersData] = useState(globalDemoData.subscribers || []);


  const meta = { total: usersData.length };
  const isLoading = false;
  const isDeleting = false;


  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const showViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const openDelete = (row) => {
    setSelectedUser(row);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setUsersData(usersData.filter(user => user.id !== selectedUser.id));
      message.success("Subscriber deleted successfully (Demo)");
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
      message.error("Failed to delete subscriber");
    }
  };

  const columns = [
    {
      title: "No",
      key: "no",
      width: 70,
      render: (_, _r, index) => (currentPage - 1) * 10 + index + 1,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.profileImage || "/userimg.png"}
            className="w-10 h-10 object-cover rounded-full"
            alt="User Avatar"
          />
          <span className="leading-none">{value}</span>
        </div>
      ),
    },
    { title: "Tier", dataIndex: "subscriptionTier", key: "subscriptionTier" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone No", dataIndex: "contactNumber", key: "contactNumber" },
    {
      title: "Joined Date",
      dataIndex: "joinedDate",
      key: "joinedDate",
      render: (value) => value ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <button onClick={() => showViewModal(record)}>
            <FaRegEye className="text-blue-600 w-5 h-5 cursor-pointer rounded-md" />
          </button>
          <button onClick={() => openDelete(record)}>
            <AiOutlineDelete className="h-5 w-5 text-red-600 cursor-pointer rounded-md" />
          </button>
        </div>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    const q = (searchQuery || "").toLowerCase().trim();
    if (!q) return usersData;
    return usersData.filter((r) =>
      [r.fullName, r.email, r.contactNumber, r.subscriptionTier, r.country]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [usersData, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-6 py-4 md:py-5 rounded-2xl mb-5 shadow-lg">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
            aria-label="Go back"
          >
            <IoChevronBack className="w-6 h-6" />
          </button>
          <h1 className="text-white text-2xl sm:text-3xl font-bold">All Subscribers</h1>

          {/* Desktop Search */}
          <div className="hidden md:flex ml-auto gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscribers..."
                className="bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all w-64"
              />
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="relative w-full md:hidden mt-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscribers..."
            className="w-full bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          />
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        </div>
      </div>

      <ConfigProvider
        theme={{
          components: {
            Pagination: {
              colorPrimary: "#2563eb",
              colorPrimaryHover: "#1d4ed8",
            },
            Table: {
              headerBg: '#60a5fa',
              headerColor: '#ffffff',
              cellFontSize: 14,
              headerSplitColor: 'transparent',
              borderColor: '#e5e7eb',
            },
          },
        }}
      >
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: meta.total || 0,
            onChange: (page) => setCurrentPage(page),
          }}
          scroll={{ x: "max-content" }}
          className="custom-user-table"
        />

        {/* Delete Modal */}
        <Modal
          open={isModalOpen}
          centered
          onCancel={handleCancel}
          footer={null}
          className="delete-user-modal"
        >
          <div className="flex flex-col justify-center items-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AiOutlineDelete className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-3">Delete Subscriber</h1>
            <p className="text-base md:text-lg text-center text-slate-600 mb-6 px-4">
              {selectedUser
                ? `Are you sure you want to delete ${selectedUser.fullName}?`
                : `Are you sure you want to delete this subscriber?`}
            </p>
            <div className="flex justify-center gap-3 w-full px-4">
              <button
                onClick={handleCancel}
                className="flex-1 max-w-[150px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 max-w-[150px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
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
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 -m-6 mb-6 rounded-t-lg">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={selectedUser.profileImage || "/userimg.png"}
                      alt={selectedUser.fullName}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
                    />
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      {selectedUser.fullName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                        {selectedUser.subscriptionTier}
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                        Joined: {new Date(selectedUser.joinedDate).toLocaleDateString()}
                      </span>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${selectedUser.status === "ACTIVE"
                        ? "bg-green-400/30 text-green-100"
                        : "bg-red-400/30 text-red-100"
                        }`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl shadow-sm">
                  <div className="text-slate-600 text-sm font-medium mb-1">Email</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {selectedUser.email}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl shadow-sm">
                  <div className="text-slate-600 text-sm font-medium mb-1">Phone No</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {selectedUser.contactNumber || "N/A"}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl shadow-sm">
                  <div className="text-slate-600 text-sm font-medium mb-1">Joined Date</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {new Date(selectedUser.joinedDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl shadow-sm">
                  <div className="text-slate-600 text-sm font-medium mb-1">Country</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {selectedUser.country || "N/A"}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end items-center mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handleViewCancel}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </ConfigProvider>
    </div>
  );
}

export default AllSubscribers;
