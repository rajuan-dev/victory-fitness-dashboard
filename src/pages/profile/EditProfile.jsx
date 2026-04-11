import { useState, useEffect } from "react";
import { globalDemoData } from "../../utils/demoData";


function EditProfile() {
  const [formData, setFormData] = useState({
    fullName: "",
    country: "",
    contactNumber: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const profileData = globalDemoData.profileData;
  const isLoading = false;

  useEffect(() => {
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || "",
        country: profileData.country || "",
        contactNumber: profileData.contactNumber || ""
      });
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      Object.assign(globalDemoData.profileData, formData);
      setSuccess("Profile updated successfully (Demo)!");
      setError("");
    } catch (err) {
      setError("Failed to update profile");
      setSuccess("");
    }
  };
  return (
    <div className="w-full flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-xl px-4 sm:px-6 md:px-8 py-5 rounded-md border border-gray-200 shadow-sm">
        <p className="text-[#111827] text-center font-bold text-xl sm:text-2xl mb-5">
          Edit Your Profile
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm md:text-base text-[#111827] mb-2 font-semibold block">
              User Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none placeholder:text-sm md:placeholder:text-base focus:ring-2 focus:ring-[#74AA2E]"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="text-sm md:text-base text-[#111827] mb-2 font-semibold block">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profileData?.email || ""}
              className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none placeholder:text-sm md:placeholder:text-base focus:ring-2 focus:ring-[#74AA2E] bg-gray-50"
              placeholder="Enter email"
              disabled
              readOnly
            />
          </div>

          <div>
            <label className="text-sm md:text-base text-[#0D0D0D] mb-2 font-semibold block">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none placeholder:text-sm md:placeholder:text-base focus:ring-2 focus:ring-[#74AA2E]"
              placeholder="Enter contact number"
              required
            />
          </div>

          <div>
            <label className="text-sm md:text-base text-[#0D0D0D] mb-2 font-semibold block">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none placeholder:text-sm md:placeholder:text-base focus:ring-2 focus:ring-[#74AA2E]"
              placeholder="Enter country"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-500 text-sm text-center">
              {success}
            </div>
          )}

          <div className="text-center pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white font-semibold w-full py-3 rounded-lg hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Save & Change"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
