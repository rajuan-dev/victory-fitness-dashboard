import { ConfigProvider, Table } from "antd";
import PropTypes from "prop-types";

const RecentUsers = ({ users = [] }) => {
  const columns = [
    {
      title: "No",
      key: "no",
      width: 70,
      render: (_, _r, index) => index + 1,
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
          <span className="leading-none">{value || "Unknown"}</span>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className="capitalize">{status?.toLowerCase()}</span>
      ),
    },
    {
      title: "Joined Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (text ? new Date(text).toLocaleDateString() : "N/A"),
    },
  ];

  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: "#2563eb",
              headerColor: "#ffffff",
              cellFontSize: 14,
              headerSplitColor: "transparent",
              borderColor: "#e5e7eb",
            },
          },
        }}
      >
        <Table
          dataSource={users}
          columns={columns}
          rowKey={(record) => record.id || record._id}
          pagination={false}
          scroll={{ x: "max-content" }}
          className="custom-table"
        />
      </ConfigProvider>
    </>
  );
};

RecentUsers.propTypes = {
  users: PropTypes.array,
};

export default RecentUsers;
