import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { IoChevronBack } from "react-icons/io5";
import { Spin, message } from "antd";
import { globalDemoData } from "../../utils/demoData";


function TermsCondition() {
  const navigate = useNavigate();
  const isLoading = false;
  const isUpdating = false;

  const [content, setContent] = useState("");

  useEffect(() => {
    setContent(globalDemoData.termsCondition);
  }, []);

  const handleSave = async () => {
    try {
      globalDemoData.termsCondition = content;
      message.success("Terms & Conditions updated successfully (Demo)");
    } catch (err) {
      console.error("Failed to update terms:", err);
      message.error("Failed to update Terms & Conditions");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="px-5 md:px-0 py-5 md:py-10">
      <div className="bg-blue-600 px-5 py-3 rounded-md mb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:opacity-90 transition"
          aria-label="Go back"
        >
          <IoChevronBack className="w-6 h-6" />
        </button>
        <h1 className="text-white text-2xl font-bold">Terms & Condition</h1>
      </div>

      <div className=" bg-white rounded shadow p-5 h-full">
        <ReactQuill
          style={{ padding: "10px" }}
          theme="snow"
          value={content}
          onChange={setContent}
        />
      </div>
      <div className="text-center py-5">
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-blue-600 text-white font-semibold w-full py-2 rounded transition duration-200 disabled:opacity-50"
        >
          {isUpdating ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

export default TermsCondition;
