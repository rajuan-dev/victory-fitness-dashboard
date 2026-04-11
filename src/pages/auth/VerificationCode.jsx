import { useState } from "react";
import { useNavigate } from "react-router-dom";

function VerificationCode() {
  const [code, setCode] = useState(new Array(4).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (value, index) => {
    if (!isNaN(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      setError("");

      if (value && index < 3) { 
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    const otp = code.join("");

    if (otp.length !== 4) {
      setError("Please enter all 4 digits");
      return;
    }
    
    setIsLoading(true);
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock successful verification
      localStorage.setItem('resetToken', "demo-reset-token");
      navigate("/new-password");
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-5">
      <div className="container mx-auto">
        <div className="flex  justify-center items-center">
          <div className="w-full lg:w-1/2 bg-white p-5 md:px-18 md:py-28 shadow-[0px_10px_20px_rgba(0,0,0,0.2)] rounded-2xl">
            <form className="space-y-5" onSubmit={handleVerifyCode}>
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    className="shadow-xs w-12 h-12 text-2xl text-center border border-[#6A6D76] text-[#0d0d0d] rounded-lg focus:outline-none"
                  />
                ))}
              </div>
              <div className="flex justify-center items-center my-5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/3 bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg cursor-pointer mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </form>
            {error && (
              <div className="text-red-500 text-center mt-2">
                {error}
              </div>
            )}
            <p className="text-blue-600 text-center mb-10">
              You have not received the email?{" "}
              <span className="text-blue-600 cursor-pointer hover:underline"> Resend</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationCode;
