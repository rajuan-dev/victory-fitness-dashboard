import { useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

function ChangePass() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccess("Password changed successfully (Demo)!");
      setError("");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setError("Failed to change password");
      setSuccess("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-xl mx-auto px-4 sm:px-6 md:px-8 pt-8 py-5 rounded-md border border-gray-200 shadow-sm">
      <p className="text-[#111827] text-center font-bold text-xl sm:text-2xl mb-5">
        Change Password
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="w-full">
          <label
            htmlFor="oldPassword"
            className="text-sm md:text-base text-[#111827] mb-2 font-semibold block"
          >
            Current Password
          </label>
          <div className="w-full relative">
            <input
              type={showPassword ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              placeholder="**********"
              className="w-full border border-gray-300 rounded-md outline-none px-4 py-3 placeholder:text-sm md:placeholder:text-base focus:ring-2 focus:ring-[#74AA2E]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#6A6D76]"
            >
              {showPassword ? (
                <IoEyeOffOutline className="w-5 h-5" />
              ) : (
                <IoEyeOutline className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div className="w-full">
          <label
            htmlFor="newPassword"
            className="text-sm md:text-base text-[#111827] mb-2 font-semibold block"
          >
            New Password
          </label>
          <div className="w-full relative">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="**********"
              className="w-full border border-gray-300 rounded-md outline-none px-4 py-3 placeholder:text-sm md:placeholder:text-base focus:ring-2 focus:ring-[#74AA2E]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#6A6D76]"
            >
              {showPassword ? (
                <IoEyeOffOutline className="w-5 h-5" />
              ) : (
                <IoEyeOutline className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div className="w-full">
          <label
            htmlFor="confirmPassword"
            className="text-sm md:text-base text-[#111827] mb-2 font-semibold block"
          >
            Confirm New Password
          </label>
          <div className="w-full relative">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="**********"
              className="w-full border border-gray-300 rounded-md outline-none px-4 py-3 placeholder:text-sm md:placeholder:text-base focus:ring-2 focus:ring-[#74AA2E]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#6A6D76]"
            >
              {showPassword ? (
                <IoEyeOffOutline className="w-5 h-5" />
              ) : (
                <IoEyeOutline className="w-5 h-5" />
              )}
            </button>
          </div>
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
            className="bg-blue-600 text-white font-semibold w-full py-3 rounded-md hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Changing..." : "Save & Change"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChangePass;
