import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset, storeResetEmail } from "../../../services/auth.service";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await requestPasswordReset({ email: normalizedEmail });
      storeResetEmail(normalizedEmail);
      navigate("/verification-code");
    } catch (err) {
      console.error("Failed to send password reset code:", err);
      setError(err instanceof Error ? err.message : "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-5">
      <div className="container mx-auto">
        <div className="flex  justify-center items-center ">
          <div className="w-full md:w-1/2 lg:w-1/2 p-5 md:px-[100px] md:py-[200px] bg-white  shadow-[0px_10px_20px_rgba(0,0,0,0.2)] rounded-2xl">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-xl text-blue-600 mb-2 font-bold">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="nahidhossain@gmail.com"
                  className="w-full px-5 py-3 border-2 border-[#6A6D76] rounded-md outline-none mt-5 placeholder:text-xl"
                  value={email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex justify-center items-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/3 bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg cursor-pointer mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Code"}
                </button>
              </div>
              {error && (
                <div className="text-red-500 text-center mt-2">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
